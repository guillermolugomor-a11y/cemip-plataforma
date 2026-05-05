import { create } from 'zustand';
import { supabase } from '../../lib/supabase';
import type { Patient } from '../../types/clinical';
import { toast } from 'sonner';

interface PatientState {
  patients: Patient[];
  isLoading: boolean;
  error: string | null;
  fetchPatients: () => Promise<void>;
  addPatient: (patient: Omit<Patient, 'id'>) => Promise<Patient>;
  updatePatient: (id: string, updates: Partial<Patient>) => Promise<void>;
  deletePatient: (id: string) => Promise<void>;
  getPatient: (id: string) => Patient | undefined;
}

export const usePatientStore = create<PatientState>()((set, get) => ({
  patients: [],
  isLoading: false,
  error: null,

  fetchPatients: async () => {
    if (get().isLoading) return;
    if (get().patients.length === 0) {
      set({ isLoading: true, error: null });
    } else {
      set({ error: null });
    }

    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const patientsData = data as any[] || [];
      const mapped: Patient[] = patientsData.map(d => ({
        id: d.id,
        caseId: d.case_id,
        name: d.name,
        lastNamePaterno: d.last_name_paterno || undefined,
        lastNameMaterno: d.last_name_materno || undefined,
        age: d.age || 0,
        gender: d.gender as any,
        birthDate: d.birth_date || undefined,
        tutor: d.tutor || '',
        relationship: d.relationship || '',
        phone: d.phone || '',
        email: d.email || undefined,
        consultReason: d.consult_reason || undefined,
        initialNotes: d.initial_notes || undefined,
        attendanceDays: d.attendance_days || [],
        appointmentTime: d.appointment_time || undefined,
        sessionCost: d.session_cost || 0,
        requiresInvoice: d.requires_invoice || false,
        schoolName: d.school_name || undefined,
        schoolPhone: d.school_phone || undefined,
        schoolEmail: d.school_email || undefined,
        schoolGrade: d.school_grade || undefined,
        schoolGroup: d.school_group || undefined,
      }));

      set({ patients: mapped, isLoading: false });
    } catch (err: any) {
      console.error('Error fetching patients:', err);
      set({ error: err.message, isLoading: false });
    }
  },

  addPatient: async (p) => {
    try {
      const dbPayload = {
        case_id: p.caseId,
        name: p.name,
        last_name_paterno: p.lastNamePaterno,
        last_name_materno: p.lastNameMaterno,
        age: p.age,
        gender: p.gender,
        birth_date: p.birthDate,
        tutor: p.tutor,
        relationship: p.relationship,
        phone: p.phone,
        email: p.email,
        consult_reason: p.consultReason,
        initial_notes: p.initialNotes,
        attendance_days: p.attendanceDays,
        appointment_time: p.appointmentTime,
        session_cost: p.sessionCost,
        requires_invoice: p.requiresInvoice,
        school_name: p.schoolName,
        school_phone: p.schoolPhone,
        school_email: p.schoolEmail,
        school_grade: p.schoolGrade,
        school_group: p.schoolGroup,
      };

      const { data, error } = await (supabase
        .from('patients') as any)
        .insert(dbPayload)
        .select()
        .single();

      if (error) throw error;

      const resData = data as any;
      const newPatient: Patient = {
        id: resData.id,
        caseId: resData.case_id,
        name: resData.name,
        lastNamePaterno: resData.last_name_paterno || undefined,
        lastNameMaterno: resData.last_name_materno || undefined,
        age: resData.age || 0,
        gender: resData.gender as any,
        birthDate: resData.birth_date || undefined,
        tutor: resData.tutor || '',
        relationship: resData.relationship || '',
        phone: resData.phone || '',
        email: resData.email || undefined,
        consultReason: resData.consult_reason || undefined,
        initialNotes: resData.initial_notes || undefined,
        attendanceDays: resData.attendance_days || [],
        appointmentTime: resData.appointment_time || undefined,
        sessionCost: resData.session_cost || 0,
        requiresInvoice: resData.requires_invoice || false,
        schoolName: resData.school_name || undefined,
        schoolPhone: resData.school_phone || undefined,
        schoolEmail: resData.school_email || undefined,
        schoolGrade: resData.school_grade || undefined,
        schoolGroup: resData.school_group || undefined,
      };

      set((state) => ({ patients: [newPatient, ...state.patients] }));
      return newPatient;
    } catch (err: any) {
      console.error('Error adding patient:', err);
      toast.error(`Error de base de datos: ${err.message || 'No se pudo registrar el paciente'}`);
      throw err;
    }
  },

  updatePatient: async (id, updates) => {
    const existingPatient = get().patients.find(p => p.id === id);
    
    try {
      const dbPayload: any = {};
      
      const sanitizeAndCompare = (newValue: any, oldValue: any, isPhone = false) => {
        const val = newValue === undefined ? null : newValue;
        const old = oldValue === undefined ? null : oldValue;

        if (typeof val === 'string') {
          let cleaned = val.trim();
          
          if (isPhone) {
            cleaned = cleaned.replace(/[^\d+]/g, '');
          } else {
            cleaned = cleaned.replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200D\uFEFF]/g, '');
          }

          const finalVal = cleaned === '' ? null : cleaned;
          return finalVal !== old ? finalVal : undefined;
        }

        if (Array.isArray(val)) {
          return JSON.stringify(val) !== JSON.stringify(old) ? val : undefined;
        }

        return val !== old ? val : undefined;
      };

      const addField = (dbKey: string, newValue: any, oldValue: any, isPhone = false) => {
        const finalValue = sanitizeAndCompare(newValue, oldValue, isPhone);
        if (finalValue !== undefined) {
          dbPayload[dbKey] = finalValue;
        }
      };

      addField('case_id', updates.caseId, existingPatient?.caseId);
      addField('name', updates.name, existingPatient?.name);
      addField('last_name_paterno', updates.lastNamePaterno, existingPatient?.lastNamePaterno);
      addField('last_name_materno', updates.lastNameMaterno, existingPatient?.lastNameMaterno);
      addField('age', updates.age, existingPatient?.age);
      addField('gender', updates.gender, existingPatient?.gender);
      addField('birth_date', updates.birthDate, existingPatient?.birthDate);
      addField('tutor', updates.tutor, existingPatient?.tutor);
      addField('relationship', updates.relationship, existingPatient?.relationship);
      addField('phone', updates.phone, existingPatient?.phone, true);
      addField('email', updates.email, existingPatient?.email);
      addField('consult_reason', updates.consultReason, existingPatient?.consultReason);
      addField('initial_notes', updates.initialNotes, existingPatient?.initialNotes);
      addField('attendance_days', updates.attendanceDays, existingPatient?.attendanceDays);
      addField('appointment_time', updates.appointmentTime, existingPatient?.appointmentTime);
      addField('session_cost', updates.sessionCost, existingPatient?.sessionCost);
      addField('requires_invoice', updates.requiresInvoice, existingPatient?.requiresInvoice);
      addField('school_name', updates.schoolName, existingPatient?.schoolName);
      addField('school_phone', updates.schoolPhone, existingPatient?.schoolPhone, true);
      addField('school_email', updates.schoolEmail, existingPatient?.schoolEmail);
      addField('school_grade', updates.schoolGrade, existingPatient?.schoolGrade);
      addField('school_group', updates.schoolGroup, existingPatient?.schoolGroup);

      if (Object.keys(dbPayload).length === 0) return;

      console.log('PatientStore: Enviando actualización minimalista:', dbPayload);

      const updatePromise = (supabase
        .from('patients') as any)
        .update(dbPayload, { count: 'none' }) // count: none ayuda a evitar lecturas extra
        .eq('id', id);

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Tiempo de espera agotado (30 segundos)')), 30000)
      );

      const { error } = await Promise.race([updatePromise, timeoutPromise]) as any;

      if (error) throw error;

      set((state) => ({
        patients: state.patients.map(p => p.id === id ? { ...p, ...updates } : p)
      }));
    } catch (err: any) {
      toast.error(`Error de base de datos: ${err.message || err}`);
      throw err;
    }
  },

  deletePatient: async (id) => {
    try {
      const { error } = await (supabase
        .from('patients') as any)
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Expediente eliminado correctamente');
      set((state) => ({
        patients: state.patients.filter(p => p.id !== id)
      }));
    } catch (err: any) {
      console.error('Error deleting patient:', err);
      toast.error(`Error al eliminar: ${err.message || 'No se pudo eliminar el expediente'}`);
      throw err;
    }
  },

  getPatient: (id) => get().patients.find(p => p.id === id),
}));
