import { create } from 'zustand';
import { supabase } from '../../lib/supabase';
import type { Patient } from '../../types/clinical';

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

      const { data, error } = await supabase
        .from('patients')
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
      throw err;
    }
  },

  updatePatient: async (id, updates) => {
    try {
      const dbPayload: any = {};
      if (updates.caseId !== undefined) dbPayload.case_id = updates.caseId;
      if (updates.name !== undefined) dbPayload.name = updates.name;
      if (updates.lastNamePaterno !== undefined) dbPayload.last_name_paterno = updates.lastNamePaterno;
      if (updates.lastNameMaterno !== undefined) dbPayload.last_name_materno = updates.lastNameMaterno;
      if (updates.age !== undefined) dbPayload.age = updates.age;
      if (updates.gender !== undefined) dbPayload.gender = updates.gender;
      if (updates.birthDate !== undefined) dbPayload.birth_date = updates.birthDate;
      if (updates.tutor !== undefined) dbPayload.tutor = updates.tutor;
      if (updates.relationship !== undefined) dbPayload.relationship = updates.relationship;
      if (updates.phone !== undefined) dbPayload.phone = updates.phone;
      if (updates.email !== undefined) dbPayload.email = updates.email;
      if (updates.consultReason !== undefined) dbPayload.consult_reason = updates.consultReason;
      if (updates.initialNotes !== undefined) dbPayload.initial_notes = updates.initialNotes;
      if (updates.attendanceDays !== undefined) dbPayload.attendance_days = updates.attendanceDays;
      if (updates.appointmentTime !== undefined) dbPayload.appointment_time = updates.appointmentTime;
      if (updates.sessionCost !== undefined) dbPayload.session_cost = updates.sessionCost;
      if (updates.requiresInvoice !== undefined) dbPayload.requires_invoice = updates.requiresInvoice;
      if (updates.schoolName !== undefined) dbPayload.school_name = updates.schoolName;
      if (updates.schoolPhone !== undefined) dbPayload.school_phone = updates.schoolPhone;
      if (updates.schoolEmail !== undefined) dbPayload.school_email = updates.schoolEmail;
      if (updates.schoolGrade !== undefined) dbPayload.school_grade = updates.schoolGrade;
      if (updates.schoolGroup !== undefined) dbPayload.school_group = updates.schoolGroup;

      const { error } = await supabase
        .from('patients')
        .update(dbPayload)
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        patients: state.patients.map(p => p.id === id ? { ...p, ...updates } : p)
      }));
    } catch (err: any) {
      console.error('Error updating patient:', err);
      throw err;
    }
  },

  deletePatient: async (id) => {
    try {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        patients: state.patients.filter(p => p.id !== id)
      }));
    } catch (err: any) {
      console.error('Error deleting patient:', err);
      throw err;
    }
  },

  getPatient: (id) => get().patients.find(p => p.id === id),
}));
