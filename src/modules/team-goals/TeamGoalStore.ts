import { create } from 'zustand';
import { supabase } from '../../lib/supabase';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface GoalComment {
  id: string;
  text: string;
  author: string;
  date: string;
}

export interface GoalAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  dataUrl?: string; // Local preview base64
  storage_path?: string;
}

export interface TeamGoal {
  id: string;
  title: string;
  indicator: string;
  progress: number;
  status: 'pending' | 'in_progress' | 'achieved';
  responsible: string;
  targetDate: string;
  subtasks?: SubTask[];
  priority?: 'high' | 'medium' | 'low';
  category?: string;
  comments?: GoalComment[];
  attachments?: GoalAttachment[];
}

interface TeamGoalState {
  teamGoals: TeamGoal[];
  isLoading: boolean;
  error: string | null;
  fetchTeamGoals: () => Promise<void>;
  subscribeToChanges: () => () => void;
  addTeamGoal: (goal: Omit<TeamGoal, 'id'>) => Promise<void>;
  updateTeamGoal: (id: string, updates: Partial<TeamGoal>) => Promise<void>;
  deleteTeamGoal: (id: string) => Promise<void>;
}

export const useTeamGoalStore = create<TeamGoalState>()((set, get) => ({
  teamGoals: [],
  isLoading: false,
  error: null,

  fetchTeamGoals: async () => {
    if (get().isLoading) return;
    
    if (get().teamGoals.length === 0) {
      set({ isLoading: true, error: null });
    } else {
      set({ error: null });
    }

    try {
      const { data, error } = await supabase
        .from('team_goals')
        .select(`
          *,
          subtasks:team_goal_subtasks(*),
          comments:team_goal_comments(*),
          attachments:team_goal_attachments(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const goalsData = data as any[] || [];
      const mappedGoals: TeamGoal[] = goalsData.map(d => ({
        id: d.id,
        title: d.title,
        indicator: d.indicator || '',
        responsible: d.responsible || '',
        targetDate: d.target_date || '',
        progress: d.progress || 0,
        status: d.status,
        priority: d.priority,
        category: d.category,
        subtasks: d.subtasks ? d.subtasks.map((st:any) => ({ id: st.id, title: st.title, completed: st.completed })) : [],
        comments: d.comments ? d.comments.map((c:any) => ({ id: c.id, text: c.content, author: c.author, date: c.created_at })) : [],
        attachments: d.attachments ? d.attachments.map((a:any) => ({ id: a.id, name: a.name, size: a.size, type: a.type, storage_path: a.storage_path })) : []
      }));

      set({ teamGoals: mappedGoals, isLoading: false });
    } catch (err: any) {
      console.error('Error fetching team goals:', err);
      set({ error: err.message, isLoading: false });
    }
  },

  subscribeToChanges: () => {
    const channel = (supabase
      .channel('realtime_team_goals') as any)
      .on(
        'postgres_changes',
        { event: '*', scheme: 'public', table: 'team_goals' },
        () => {
          get().fetchTeamGoals();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', scheme: 'public', table: 'team_goal_subtasks' },
        () => {
          get().fetchTeamGoals();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', scheme: 'public', table: 'team_goal_comments' },
        () => {
          get().fetchTeamGoals();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  addTeamGoal: async (goal) => {
    try {
      const { subtasks, comments, attachments, ...mainGoal } = goal;
      
      const { data: newGoalData, error } = await (supabase
        .from('team_goals') as any)
        .insert([{
          title: mainGoal.title,
          indicator: mainGoal.indicator,
          responsible: mainGoal.responsible,
          target_date: mainGoal.targetDate || null,
          progress: mainGoal.progress,
          status: mainGoal.status,
          priority: mainGoal.priority,
          category: mainGoal.category
        }])
        .select()
        .single();

      if (error) throw error;
      const resData = newGoalData as any;
      const goalId = resData.id;

      if (subtasks && subtasks.length > 0) {
        await (supabase.from('team_goal_subtasks') as any).insert(
          subtasks.map(st => ({ goal_id: goalId, title: st.title, completed: st.completed }))
        );
      }

      if (comments && comments.length > 0) {
        await (supabase.from('team_goal_comments') as any).insert(
          comments.map(c => ({ goal_id: goalId, author: c.author, content: c.text, created_at: c.date }))
        );
      }

      if (attachments && attachments.length > 0) {
        await (supabase.from('team_goal_attachments') as any).insert(
          attachments.map(a => ({ goal_id: goalId, name: a.name, size: a.size, type: a.type, storage_path: a.storage_path || 'temp' }))
        );
      }

      await get().fetchTeamGoals();
    } catch (err: any) {
      console.error('Error adding team goal:', err);
    }
  },

  updateTeamGoal: async (id, updates) => {
    const previousGoals = get().teamGoals;
    set(state => ({
      teamGoals: state.teamGoals.map(g => g.id === id ? { ...g, ...updates } : g)
    }));

    try {
      const { subtasks, comments, attachments, ...mainUpdates } = updates as any;
      
      const dbUpdates: any = {};
      if (mainUpdates.title !== undefined) dbUpdates.title = mainUpdates.title;
      if (mainUpdates.indicator !== undefined) dbUpdates.indicator = mainUpdates.indicator;
      if (mainUpdates.responsible !== undefined) dbUpdates.responsible = mainUpdates.responsible;
      if (mainUpdates.targetDate !== undefined) dbUpdates.target_date = mainUpdates.targetDate || null;
      if (mainUpdates.progress !== undefined) dbUpdates.progress = mainUpdates.progress;
      if (mainUpdates.status !== undefined) dbUpdates.status = mainUpdates.status;
      if (mainUpdates.priority !== undefined) dbUpdates.priority = mainUpdates.priority;
      if (mainUpdates.category !== undefined) dbUpdates.category = mainUpdates.category;

      if (Object.keys(dbUpdates).length > 0) {
        const { error } = await (supabase.from('team_goals') as any).update(dbUpdates).eq('id', id);
        if (error) throw error;
      }

      if (subtasks !== undefined) {
        await (supabase.from('team_goal_subtasks') as any).delete().eq('goal_id', id);
        if (subtasks.length > 0) {
          await (supabase.from('team_goal_subtasks') as any).insert(
            subtasks.map((st:any) => ({ goal_id: id, title: st.title, completed: st.completed }))
          );
        }
      }

      if (comments !== undefined) {
        await (supabase.from('team_goal_comments') as any).delete().eq('goal_id', id);
        if (comments.length > 0) {
          await (supabase.from('team_goal_comments') as any).insert(
            comments.map((c:any) => ({ goal_id: id, author: c.author, content: c.text, created_at: c.date }))
          );
        }
      }

      if (attachments !== undefined) {
        await (supabase.from('team_goal_attachments') as any).delete().eq('goal_id', id);
        if (attachments.length > 0) {
          await (supabase.from('team_goal_attachments') as any).insert(
            attachments.map((a:any) => ({ goal_id: id, name: a.name, size: a.size, type: a.type, storage_path: a.storage_path || 'temp' }))
          );
        }
      }

      await get().fetchTeamGoals();

    } catch (err: any) {
      console.error('Error updating team goal:', err);
      set({ teamGoals: previousGoals });
    }
  },

  deleteTeamGoal: async (id) => {
    const previousGoals = get().teamGoals;
    set(state => ({ teamGoals: state.teamGoals.filter(g => g.id !== id) }));
    try {
      const { error } = await (supabase.from('team_goals') as any).delete().eq('id', id);
      if (error) throw error;
    } catch (err: any) {
      console.error('Error deleting team goal:', err);
      set({ teamGoals: previousGoals });
    }
  }
}));
