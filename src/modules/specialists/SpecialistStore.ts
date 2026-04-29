import { create } from 'zustand';
import { supabase } from '../../lib/supabase';

export interface Specialist {
  id: string;
  name: string;
  email: string;
  specialty: string;
  bankInfo: string;
  paymentSchema: 'Porcentaje' | 'Sueldo Fijo';
  paymentValue: number;
  status: 'Activo' | 'Inactivo';
}

interface SpecialistState {
  specialists: Specialist[];
  isLoading: boolean;
  error: string | null;
  fetchSpecialists: () => Promise<void>;
  addSpecialist: (specialist: Omit<Specialist, 'id'>) => Promise<void>;
  updateSpecialist: (id: string, updates: Partial<Specialist>) => Promise<void>;
  deleteSpecialist: (id: string) => Promise<void>;
  getSpecialist: (id: string) => Specialist | undefined;
}

export const useSpecialistStore = create<SpecialistState>()((set, get) => ({
  specialists: [],
  isLoading: false,
  error: null,

  fetchSpecialists: async () => {
    // Evitar múltiples llamadas simultáneas
    if (get().isLoading) return;
    
    // Solo mostrar loading si no hay datos previos para evitar parpadeos o bloqueos de UI
    if (get().specialists.length === 0) {
      set({ isLoading: true, error: null });
    } else {
      set({ error: null }); // Background refresh
    }

    try {
      const { data, error } = await supabase
        .from('specialists')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Map from DB format to our frontend interface
      const mapped: Specialist[] = (data || []).map(d => ({
        id: d.id,
        name: d.name,
        email: d.email || '',
        specialty: d.specialty || '',
        bankInfo: d.bank_info || '',
        paymentSchema: d.payment_schema as any,
        paymentValue: d.payment_value || 0,
        status: d.status as any,
      }));

      set({ specialists: mapped, isLoading: false });
    } catch (err: any) {
      console.error('Error fetching specialists:', err);
      set({ error: err.message, isLoading: false });
    }
  },

  addSpecialist: async (s) => {
    try {
      const dbPayload = {
        name: s.name,
        email: s.email,
        specialty: s.specialty,
        bank_info: s.bankInfo,
        payment_schema: s.paymentSchema,
        payment_value: s.paymentValue,
        status: s.status,
      };

      const { data, error } = await supabase
        .from('specialists')
        .insert(dbPayload)
        .select()
        .single();

      if (error) throw error;

      const newS: Specialist = {
        id: data.id,
        name: data.name,
        email: data.email || '',
        specialty: data.specialty || '',
        bankInfo: data.bank_info || '',
        paymentSchema: data.payment_schema as any,
        paymentValue: data.payment_value || 0,
        status: data.status as any,
      };

      set((state) => ({ specialists: [newS, ...state.specialists] }));
    } catch (err: any) {
      console.error('Error adding specialist:', err);
      throw err;
    }
  },

  updateSpecialist: async (id, updates) => {
    try {
      const dbPayload: any = {};
      if (updates.name !== undefined) dbPayload.name = updates.name;
      if (updates.email !== undefined) dbPayload.email = updates.email;
      if (updates.specialty !== undefined) dbPayload.specialty = updates.specialty;
      if (updates.bankInfo !== undefined) dbPayload.bank_info = updates.bankInfo;
      if (updates.paymentSchema !== undefined) dbPayload.payment_schema = updates.paymentSchema;
      if (updates.paymentValue !== undefined) dbPayload.payment_value = updates.paymentValue;
      if (updates.status !== undefined) dbPayload.status = updates.status;

      const { error } = await supabase
        .from('specialists')
        .update(dbPayload)
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        specialists: state.specialists.map(s => s.id === id ? { ...s, ...updates } : s)
      }));
    } catch (err: any) {
      console.error('Error updating specialist:', err);
      throw err;
    }
  },

  deleteSpecialist: async (id) => {
    try {
      const { error } = await supabase
        .from('specialists')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        specialists: state.specialists.filter(s => s.id !== id)
      }));
    } catch (err: any) {
      console.error('Error deleting specialist:', err);
      throw err;
    }
  },

  getSpecialist: (id) => get().specialists.find(s => s.id === id),
}));
