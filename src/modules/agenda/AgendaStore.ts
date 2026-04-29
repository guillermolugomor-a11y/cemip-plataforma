import { create } from 'zustand';
import { supabase } from '../../lib/supabase';
import type { Appointment } from '../../types/clinical';

// Helper: only pass valid UUIDs to Supabase FK columns
const toUuidOrNull = (val: string | undefined | null): string | null => {
  if (!val) return null;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(val) ? val : null;
};

interface AgendaState {
  appointments: Appointment[];
  isLoading: boolean;
  error: string | null;
  fetchAppointments: () => Promise<void>;
  addAppointment: (apt: Omit<Appointment, 'id'>) => Promise<void>;
  updateStatus: (id: string, status: Appointment['status']) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
  updateAppointment: (id: string, apt: Partial<Appointment>) => Promise<void>;
  markAppointmentsAsPaid: (ids: string[]) => Promise<void>;
}

export const useAgendaStore = create<AgendaState>()((set, get) => ({
  appointments: [],
  isLoading: false,
  error: null,

  fetchAppointments: async () => {
    if (get().isLoading) return;
    if (get().appointments.length === 0) {
      set({ isLoading: true, error: null });
    } else {
      set({ error: null });
    }

    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;

      const mapped: Appointment[] = data.map(d => ({
        id: d.id,
        patientId: d.patient_id || '',
        patientName: '', // Will be resolved by the UI component
        specialistId: d.specialist_id || '',
        specialistName: '', // Will be resolved by the UI component
        date: d.date,
        time: d.time,
        type: d.type || '',
        status: (d.status as Appointment['status']) || 'pending',
        isPaid: d.is_paid || false,
        sessionCost: d.session_cost || 0,
        isAccountingLogged: d.is_accounting_logged || false,
      }));

      set({ appointments: mapped, isLoading: false });
    } catch (err: any) {
      console.error('Error fetching appointments:', err);
      set({ error: err.message, isLoading: false });
    }
  },

  addAppointment: async (apt) => {
    try {
      const dbPayload = {
        patient_id: toUuidOrNull(apt.patientId),
        specialist_id: toUuidOrNull(apt.specialistId),
        date: apt.date,
        time: apt.time,
        type: apt.type,
        status: apt.status,
        is_paid: apt.isPaid || false,
        session_cost: apt.sessionCost || null,
        is_accounting_logged: apt.isAccountingLogged || false,
      };

      const { data, error } = await supabase
        .from('appointments')
        .insert(dbPayload)
        .select()
        .single();

      if (error) throw error;

      const newApt: Appointment = {
        id: data.id,
        patientId: data.patient_id || '',
        patientName: apt.patientName || '',
        specialistId: data.specialist_id || '',
        specialistName: apt.specialistName || '',
        date: data.date,
        time: data.time,
        type: data.type || '',
        status: (data.status as Appointment['status']) || 'pending',
        isPaid: data.is_paid || false,
        sessionCost: data.session_cost || 0,
        isAccountingLogged: data.is_accounting_logged || false,
      };

      set((state) => ({ appointments: [newApt, ...state.appointments] }));
    } catch (err: any) {
      console.error('Error adding appointment:', err);
      throw err;
    }
  },

  updateStatus: async (id, status) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', id)
        .select();

      if (error) throw error;
      
      if (!data || data.length === 0) {
        throw new Error('No se encontró la cita para actualizar.');
      }

      set((state) => ({
        appointments: state.appointments.map(a => a.id === id ? { ...a, status } : a)
      }));
    } catch (err: any) {
      console.error('Error updating status:', err);
      throw err;
    }
  },

  deleteAppointment: async (id) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        appointments: state.appointments.filter(a => a.id !== id)
      }));
    } catch (err: any) {
      console.error('Error deleting appointment:', err);
      throw err;
    }
  },

  updateAppointment: async (id, apt) => {
    try {
      const dbPayload: any = {};
      if (apt.patientId !== undefined) dbPayload.patient_id = toUuidOrNull(apt.patientId);
      if (apt.specialistId !== undefined) dbPayload.specialist_id = toUuidOrNull(apt.specialistId);
      if (apt.date !== undefined) dbPayload.date = apt.date;
      if (apt.time !== undefined) dbPayload.time = apt.time;
      if (apt.type !== undefined) dbPayload.type = apt.type;
      if (apt.status !== undefined) dbPayload.status = apt.status;
      if (apt.isPaid !== undefined) dbPayload.is_paid = apt.isPaid;
      if (apt.sessionCost !== undefined) dbPayload.session_cost = apt.sessionCost;
      if (apt.isAccountingLogged !== undefined) dbPayload.is_accounting_logged = apt.isAccountingLogged;

      const { error } = await supabase
        .from('appointments')
        .update(dbPayload)
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        appointments: state.appointments.map(a => a.id === id ? { ...a, ...apt } : a)
      }));
    } catch (err: any) {
      console.error('Error updating appointment:', err);
      throw err;
    }
  },

  markAppointmentsAsPaid: async (ids) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ is_paid: true })
        .in('id', ids);

      if (error) throw error;

      set((state) => ({
        appointments: state.appointments.map(a =>
          ids.includes(a.id) ? { ...a, isPaid: true } : a
        )
      }));
    } catch (err: any) {
      console.error('Error marking as paid:', err);
      throw err;
    }
  },
}));
