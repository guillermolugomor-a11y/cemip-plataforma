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
  markAppointmentsAsSpecialistPaid: (ids: string[]) => Promise<void>;
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

      const aptsData = data as any[] || [];
      const mapped: Appointment[] = aptsData.map(d => ({
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
        isSpecialistPaid: d.is_specialist_paid || false,
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
    const tempId = crypto.randomUUID();
    const optimisticApt: Appointment = { id: tempId, ...apt };
    
    // Optimistic update
    set((state) => ({ appointments: [optimisticApt, ...state.appointments] }));

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    let lastError: any = null;

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

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        if (attempt > 1) await new Promise(r => setTimeout(r, attempt * 2000));

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        const response = await fetch(`${supabaseUrl}/rest/v1/appointments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(dbPayload),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) throw new Error(await response.text());
        const data = await response.json();
        const resData = data[0];

        // Replace optimistic with real
        set(state => ({
          appointments: state.appointments.map(a => a.id === tempId ? {
            ...a,
            id: resData.id
          } : a)
        }));
        return;
      } catch (err: any) {
        lastError = err;
        console.warn(`AgendaStore: Fallo en intento ${attempt}:`, err.message);
      }
    }

    // Rollback
    set(state => ({ appointments: state.appointments.filter(a => a.id !== tempId) }));
    throw lastError || new Error('Error al agregar cita tras 3 reintentos');
  },

  updateStatus: async (id, status) => {
    const previousAppointments = get().appointments;
    
    // Optimistic update
    set((state) => ({
      appointments: state.appointments.map(a => a.id === id ? { ...a, status } : a)
    }));

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    let lastError: any = null;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        if (attempt > 1) await new Promise(r => setTimeout(r, attempt * 2000));

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        const response = await fetch(`${supabaseUrl}/rest/v1/appointments?id=eq.${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({ status }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) throw new Error(await response.text());
        return;
      } catch (err: any) {
        lastError = err;
        console.warn(`AgendaStore: Fallo en intento ${attempt}:`, err.message);
      }
    }

    // Rollback
    set({ appointments: previousAppointments });
    throw lastError || new Error('Error al actualizar estado tras 3 reintentos');
  },

  deleteAppointment: async (id) => {
    try {
      const { error } = await (supabase
        .from('appointments') as any)
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
    const previousAppointments = get().appointments;
    
    // Optimistic update
    set((state) => ({
      appointments: state.appointments.map(a => a.id === id ? { ...a, ...apt } : a)
    }));

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    let lastError: any = null;

    const dbPayload: any = {};
    if (apt.patientId !== undefined) dbPayload.patient_id = toUuidOrNull(apt.patientId);
    if (apt.specialistId !== undefined) dbPayload.specialist_id = toUuidOrNull(apt.specialistId);
    if (apt.date !== undefined) dbPayload.date = apt.date;
    if (apt.time !== undefined) dbPayload.time = apt.time;
    if (apt.type !== undefined) dbPayload.type = apt.type;
    if (apt.status !== undefined) dbPayload.status = apt.status;
    if (apt.isPaid !== undefined) dbPayload.is_paid = apt.isPaid;
    if (apt.isSpecialistPaid !== undefined) dbPayload.is_specialist_paid = apt.isSpecialistPaid;
    if (apt.sessionCost !== undefined) dbPayload.session_cost = apt.sessionCost;
    if (apt.isAccountingLogged !== undefined) dbPayload.is_accounting_logged = apt.isAccountingLogged;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        if (attempt > 1) await new Promise(r => setTimeout(r, attempt * 2000));

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        const response = await fetch(`${supabaseUrl}/rest/v1/appointments?id=eq.${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(dbPayload),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) throw new Error(await response.text());
        return;
      } catch (err: any) {
        lastError = err;
        console.warn(`AgendaStore: Fallo en intento ${attempt}:`, err.message);
      }
    }

    // Rollback
    set({ appointments: previousAppointments });
    throw lastError || new Error('Error al actualizar cita tras 3 reintentos');
  },

  markAppointmentsAsPaid: async (ids) => {
    try {
      const { error } = await (supabase
        .from('appointments') as any)
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

  markAppointmentsAsSpecialistPaid: async (ids) => {
    try {
      const { error } = await (supabase
        .from('appointments') as any)
        .update({ is_specialist_paid: true })
        .in('id', ids);

      if (error) throw error;

      set((state) => ({
        appointments: state.appointments.map(a =>
          ids.includes(a.id) ? { ...a, isSpecialistPaid: true } : a
        )
      }));
    } catch (err: any) {
      console.error('Error marking as specialist paid:', err);
      throw err;
    }
  },
}));
