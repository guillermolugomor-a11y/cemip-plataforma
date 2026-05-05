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

      const specialistsData = data as any[] || [];
      const mapped: Specialist[] = specialistsData.map(d => ({
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
    const tempId = crypto.randomUUID();
    const optimisticS: Specialist = { id: tempId, ...s };
    
    // Optimistic update
    set((state) => ({ specialists: [optimisticS, ...state.specialists] }));

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    let lastError: any = null;

    const dbPayload = {
      name: s.name,
      email: s.email,
      specialty: s.specialty,
      bank_info: s.bankInfo,
      payment_schema: s.paymentSchema,
      payment_value: s.paymentValue,
      status: s.status,
    };

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        if (attempt > 1) await new Promise(r => setTimeout(r, attempt * 2000));

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        const response = await fetch(`${supabaseUrl}/rest/v1/specialists`, {
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
          specialists: state.specialists.map(sp => sp.id === tempId ? {
            ...sp,
            id: resData.id
          } : sp)
        }));
        return;
      } catch (err: any) {
        lastError = err;
        console.warn(`SpecialistStore: Fallo en intento ${attempt}:`, err.message);
      }
    }

    // Rollback
    set(state => ({ specialists: state.specialists.filter(sp => sp.id !== tempId) }));
    throw lastError || new Error('Error al agregar especialista tras 3 reintentos');
  },

  updateSpecialist: async (id, updates) => {
    const previousSpecialists = get().specialists;
    
    // Optimistic update
    set((state) => ({
      specialists: state.specialists.map(s => s.id === id ? { ...s, ...updates } : s)
    }));

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    let lastError: any = null;

    const dbPayload: any = {};
    if (updates.name !== undefined) dbPayload.name = updates.name;
    if (updates.email !== undefined) dbPayload.email = updates.email;
    if (updates.specialty !== undefined) dbPayload.specialty = updates.specialty;
    if (updates.bankInfo !== undefined) dbPayload.bank_info = updates.bankInfo;
    if (updates.paymentSchema !== undefined) dbPayload.payment_schema = updates.paymentSchema;
    if (updates.paymentValue !== undefined) dbPayload.payment_value = updates.paymentValue;
    if (updates.status !== undefined) dbPayload.status = updates.status;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        if (attempt > 1) await new Promise(r => setTimeout(r, attempt * 2000));

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        const response = await fetch(`${supabaseUrl}/rest/v1/specialists?id=eq.${id}`, {
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
        console.warn(`SpecialistStore: Fallo en intento ${attempt}:`, err.message);
      }
    }

    // Rollback
    set({ specialists: previousSpecialists });
    throw lastError || new Error('Error al actualizar especialista tras 3 reintentos');
  },

  deleteSpecialist: async (id) => {
    try {
      const { error } = await (supabase
        .from('specialists') as any)
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
