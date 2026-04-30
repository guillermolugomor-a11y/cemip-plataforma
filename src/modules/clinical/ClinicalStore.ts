import { create } from 'zustand';
import { supabase } from '../../lib/supabase';
import type { Evaluation, Goal, ClinicalLog, TimelineNote } from './types';

interface ClinicalState {
  evaluations: Evaluation[];
  goals: Goal[];
  logs: ClinicalLog[];
  notes: TimelineNote[];
  isLoading: boolean;
  error: string | null;

  fetchClinicalData: () => Promise<void>;

  // Actions
  addEvaluation: (evalData: Omit<Evaluation, 'id'>) => Promise<void>;
  updateEvaluation: (id: string, updates: Partial<Evaluation>) => Promise<void>;
  deleteEvaluation: (id: string) => Promise<void>;

  addGoal: (goalData: Omit<Goal, 'id'>) => Promise<void>;
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>;
  updateGoalProgress: (patientId: string, updates: Record<string, number>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;

  addLog: (logData: Omit<ClinicalLog, 'id'>) => Promise<void>;
  updateLog: (id: string, updates: Partial<ClinicalLog>) => Promise<void>;
  deleteLog: (id: string) => Promise<void>;

  addNote: (noteData: Omit<TimelineNote, 'id'>) => Promise<void>;
  updateNote: (id: string, updates: Partial<TimelineNote>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  
  // Getters
  getPatientEvaluations: (patientId: string) => Evaluation[];
  getPatientGoals: (patientId: string) => Goal[];
  getPatientLogs: (patientId: string) => ClinicalLog[];
  getPatientNotes: (patientId: string) => TimelineNote[];
}

export const useClinicalStore = create<ClinicalState>()((set, get) => ({
  evaluations: [],
  goals: [],
  logs: [],
  notes: [],
  isLoading: false,
  error: null,

  fetchClinicalData: async () => {
    if (get().isLoading) return;
    if (get().evaluations.length === 0 && get().goals.length === 0 && get().logs.length === 0 && get().notes.length === 0) {
      set({ isLoading: true, error: null });
    } else {
      set({ error: null });
    }

    try {
      const [evalRes, goalRes, logRes, noteRes] = await Promise.all([
        supabase.from('evaluations').select('*').order('created_at', { ascending: false }),
        supabase.from('goals').select('*').order('created_at', { ascending: false }),
        supabase.from('clinical_logs').select('*').order('created_at', { ascending: false }),
        supabase.from('timeline_notes').select('*').order('created_at', { ascending: false }),
      ]);

      if (evalRes.error) throw evalRes.error;
      if (goalRes.error) throw goalRes.error;
      if (logRes.error) throw logRes.error;
      if (noteRes.error) throw noteRes.error;

      const evalData = evalRes.data as any[] || [];
      const evaluations: Evaluation[] = evalData.map(d => ({
        id: d.id, patientId: d.patient_id || '', title: d.title,
        date: d.date || '', score: d.score, status: d.status as any,
        conclusion: d.conclusion || '',
      }));

      const goalData = goalRes.data as any[] || [];
      const goals: Goal[] = goalData.map(d => ({
        id: d.id, patientId: d.patient_id || '', title: d.title,
        indicator: d.indicator || '', progress: d.progress || 0,
        status: d.status as any, responsible: d.responsible || '',
        targetDate: d.target_date || '',
      }));

      const logData = logRes.data as any[] || [];
      const logs: ClinicalLog[] = logData.map(d => ({
        id: d.id, patientId: d.patient_id || '', date: d.date || '',
        type: d.type as any, entity: d.entity || '',
        description: d.description || '', by: d.by_user || '',
      }));

      const noteData = noteRes.data as any[] || [];
      const notes: TimelineNote[] = noteData.map(d => ({
        id: d.id, patientId: d.patient_id || '', date: d.date || '',
        time: d.time || '', content: d.content || '',
        type: (d.template_type as any) || 'Nota',
        author: d.specialist_id || '',
      }));

      set({ evaluations, goals, logs, notes, isLoading: false });
    } catch (err: any) {
      console.error('Error fetching clinical data:', err);
      set({ error: err.message, isLoading: false });
    }
  },

  // ── Evaluations ─────────────────────────────────
  addEvaluation: async (data) => {
    try {
      const { data: d, error } = await supabase.from('evaluations').insert({
        patient_id: data.patientId, title: data.title, date: data.date || null,
        score: data.score, status: data.status, conclusion: data.conclusion,
      }).select().single();
      if (error) throw error;
      const resData = d as any;
      const newE: Evaluation = { id: resData.id, patientId: resData.patient_id || '', title: resData.title, date: resData.date || '', score: resData.score, status: resData.status as any, conclusion: resData.conclusion || '' };
      set(s => ({ evaluations: [newE, ...s.evaluations] }));
    } catch (err: any) { console.error('Error adding evaluation:', err); throw err; }
  },

  updateEvaluation: async (id, updates) => {
    try {
      const db: any = {};
      if (updates.title !== undefined) db.title = updates.title;
      if (updates.date !== undefined) db.date = updates.date;
      if (updates.score !== undefined) db.score = updates.score;
      if (updates.status !== undefined) db.status = updates.status;
      if (updates.conclusion !== undefined) db.conclusion = updates.conclusion;
      const { error } = await supabase.from('evaluations').update(db).eq('id', id);
      if (error) throw error;
      set(s => ({ evaluations: s.evaluations.map(e => e.id === id ? { ...e, ...updates } : e) }));
    } catch (err: any) { console.error('Error updating evaluation:', err); throw err; }
  },

  deleteEvaluation: async (id) => {
    try {
      const { error } = await supabase.from('evaluations').delete().eq('id', id);
      if (error) throw error;
      set(s => ({ evaluations: s.evaluations.filter(e => e.id !== id) }));
    } catch (err: any) { console.error('Error deleting evaluation:', err); throw err; }
  },

  // ── Goals ───────────────────────────────────────
  addGoal: async (data) => {
    try {
      const { data: d, error } = await supabase.from('goals').insert({
        patient_id: data.patientId, title: data.title, indicator: data.indicator,
        progress: data.progress, status: data.status, responsible: data.responsible,
        target_date: data.targetDate || null,
      }).select().single();
      if (error) throw error;
      const resData = d as any;
      const newG: Goal = { id: resData.id, patientId: resData.patient_id || '', title: resData.title, indicator: resData.indicator || '', progress: resData.progress || 0, status: resData.status as any, responsible: resData.responsible || '', targetDate: resData.target_date || '' };
      set(s => ({ goals: [newG, ...s.goals] }));
    } catch (err: any) { console.error('Error adding goal:', err); throw err; }
  },

  updateGoal: async (id, updates) => {
    try {
      const db: any = {};
      if (updates.title !== undefined) db.title = updates.title;
      if (updates.indicator !== undefined) db.indicator = updates.indicator;
      if (updates.progress !== undefined) db.progress = updates.progress;
      if (updates.status !== undefined) db.status = updates.status;
      if (updates.responsible !== undefined) db.responsible = updates.responsible;
      if (updates.targetDate !== undefined) db.target_date = updates.targetDate;
      const { error } = await supabase.from('goals').update(db).eq('id', id);
      if (error) throw error;
      set(s => ({ goals: s.goals.map(g => g.id === id ? { ...g, ...updates } : g) }));
    } catch (err: any) { console.error('Error updating goal:', err); throw err; }
  },

  updateGoalProgress: async (patientId, updates) => {
    try {
      const promises = Object.entries(updates).map(async ([goalId, progress]) => {
        const status = progress === 100 ? 'achieved' : 'pending';
        const { error } = await supabase.from('goals').update({ progress, status }).eq('id', goalId);
        if (error) throw error;
      });
      await Promise.all(promises);
      set(s => ({
        goals: s.goals.map(g => {
          if (g.patientId !== patientId || updates[g.id] === undefined) return g;
          const newProg = updates[g.id];
          return { ...g, progress: newProg, status: newProg === 100 ? 'achieved' : 'pending' };
        })
      }));
    } catch (err: any) { console.error('Error updating goal progress:', err); throw err; }
  },

  deleteGoal: async (id) => {
    try {
      const { error } = await supabase.from('goals').delete().eq('id', id);
      if (error) throw error;
      set(s => ({ goals: s.goals.filter(g => g.id !== id) }));
    } catch (err: any) { console.error('Error deleting goal:', err); throw err; }
  },

  // ── Logs ────────────────────────────────────────
  addLog: async (data) => {
    try {
      const { data: d, error } = await supabase.from('clinical_logs').insert({
        patient_id: data.patientId, date: data.date || null, type: data.type,
        entity: data.entity, description: data.description, by_user: data.by,
      }).select().single();
      if (error) throw error;
      const resData = d as any;
      const newL: ClinicalLog = { id: resData.id, patientId: resData.patient_id || '', date: resData.date || '', type: resData.type as any, entity: resData.entity || '', description: resData.description || '', by: resData.by_user || '' };
      set(s => ({ logs: [newL, ...s.logs] }));
    } catch (err: any) { console.error('Error adding log:', err); throw err; }
  },

  updateLog: async (id, updates) => {
    try {
      const db: any = {};
      if (updates.date !== undefined) db.date = updates.date;
      if (updates.type !== undefined) db.type = updates.type;
      if (updates.entity !== undefined) db.entity = updates.entity;
      if (updates.description !== undefined) db.description = updates.description;
      if (updates.by !== undefined) db.by_user = updates.by;
      const { error } = await supabase.from('clinical_logs').update(db).eq('id', id);
      if (error) throw error;
      set(s => ({ logs: s.logs.map(l => l.id === id ? { ...l, ...updates } : l) }));
    } catch (err: any) { console.error('Error updating log:', err); throw err; }
  },

  deleteLog: async (id) => {
    try {
      const { error } = await supabase.from('clinical_logs').delete().eq('id', id);
      if (error) throw error;
      set(s => ({ logs: s.logs.filter(l => l.id !== id) }));
    } catch (err: any) { console.error('Error deleting log:', err); throw err; }
  },

  // ── Notes ───────────────────────────────────────
  addNote: async (data) => {
    try {
      const { data: d, error } = await supabase.from('timeline_notes').insert({
        patient_id: data.patientId, date: data.date || null, time: data.time || null,
        content: data.content, specialist_id: data.author || null,
        template_type: data.type || 'Nota',
      }).select().single();
      if (error) throw error;
      const resData = d as any;
      const newN: TimelineNote = { id: resData.id, patientId: resData.patient_id || '', date: resData.date || '', time: resData.time || '', content: resData.content || '', type: (resData.template_type as any) || 'Nota', author: resData.specialist_id || '' };
      set(s => ({ notes: [newN, ...s.notes] }));
    } catch (err: any) { console.error('Error adding note:', err); throw err; }
  },


  updateNote: async (id, updates) => {
    try {
      const db: any = {};
      if (updates.date !== undefined) db.date = updates.date;
      if (updates.time !== undefined) db.time = updates.time;
      if (updates.content !== undefined) db.content = updates.content;
      if (updates.type !== undefined) db.template_type = updates.type;
      if (updates.author !== undefined) db.specialist_id = updates.author;
      const { error } = await supabase.from('timeline_notes').update(db).eq('id', id);
      if (error) throw error;
      set(s => ({ notes: s.notes.map(n => n.id === id ? { ...n, ...updates } : n) }));
    } catch (err: any) { console.error('Error updating note:', err); throw err; }
  },

  deleteNote: async (id) => {
    try {
      const { error } = await supabase.from('timeline_notes').delete().eq('id', id);
      if (error) throw error;
      set(s => ({ notes: s.notes.filter(n => n.id !== id) }));
    } catch (err: any) { console.error('Error deleting note:', err); throw err; }
  },

  // ── Getters (pure) ──────────────────────────────
  getPatientEvaluations: (pid) => get().evaluations.filter(e => e.patientId === pid),
  getPatientGoals: (pid) => get().goals.filter(g => g.patientId === pid),
  getPatientLogs: (pid) => get().logs.filter(l => l.patientId === pid),
  getPatientNotes: (pid) => get().notes.filter(n => n.patientId === pid),
}));
