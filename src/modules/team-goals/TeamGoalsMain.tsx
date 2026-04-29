import React, { useState, useEffect } from 'react';
import { Target, CheckCircle2, Circle, Plus, X, Check, Trash2, Calendar, Users, Briefcase, ListChecks, Flag, Tag, MessageSquare, Send, LayoutDashboard, List, Paperclip, File, Image as ImageIcon, Filter } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useTeamGoalStore } from './TeamGoalStore';
import { useSpecialistStore } from '../specialists/SpecialistStore';
import { useAuthStore } from '../../lib/AuthStore';

const priorityColors = {
  high: 'bg-apple-red/10 text-apple-red border-apple-red/20',
  medium: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  low: 'bg-apple-green/10 text-apple-green border-apple-green/20',
};

const priorityLabels = {
  high: 'Alta',
  medium: 'Media',
  low: 'Baja',
};

const GoalsListView = ({ goals, onGoalClick, filter, setFilter }: any) => {
  const { profile, user } = useAuthStore();
  const userName = profile?.full_name || user?.email?.split('@')[0] || '';

  const filteredGoals = goals.filter((g: any) => {
    if (filter === 'mine') {
      return g.responsible === userName || g.responsible === 'Equipo Directivo';
    }
    if (filter === 'high') {
      return g.priority === 'high';
    }
    if (filter === 'pending') {
      return g.status !== 'achieved';
    }
    return true; // 'all'
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-apple-text-tertiary" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-apple-text-tertiary mr-2">Filtros:</span>
          <div className="flex items-center gap-2 bg-apple-secondary/50 p-1 rounded-xl border border-apple-separator/30 overflow-x-auto custom-scrollbar">
            <button onClick={() => setFilter('all')} className={cn("px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all whitespace-nowrap", filter === 'all' ? "bg-apple-text text-apple-bg shadow-sm" : "text-apple-text-tertiary hover:text-apple-text")}>Todas</button>
            <button onClick={() => setFilter('pending')} className={cn("px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all whitespace-nowrap", filter === 'pending' ? "bg-apple-text text-apple-bg shadow-sm" : "text-apple-text-tertiary hover:text-apple-text")}>Activas</button>
            <button onClick={() => setFilter('mine')} className={cn("px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all whitespace-nowrap", filter === 'mine' ? "bg-apple-text text-apple-bg shadow-sm" : "text-apple-text-tertiary hover:text-apple-text")}>Mis Metas</button>
            <button onClick={() => setFilter('high')} className={cn("px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all whitespace-nowrap", filter === 'high' ? "bg-apple-text text-apple-bg shadow-sm" : "text-apple-text-tertiary hover:text-apple-text")}>Urgentes</button>
          </div>
        </div>
        <div className="text-[10px] font-bold text-apple-text-tertiary uppercase tracking-widest">
          Mostrando: <span className="text-apple-blue">{filteredGoals.length}</span>
        </div>
      </div>
      
      <div className="bg-apple-bg rounded-2xl shadow-apple-soft border border-apple-separator/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-apple-secondary/30 border-b border-apple-separator/50">
                <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-apple-text-tertiary w-[30%]">Iniciativa / Meta</th>
                <th className="py-4 px-4 text-[10px] font-bold uppercase tracking-widest text-apple-text-tertiary w-[12%]">Prioridad</th>
                <th className="py-4 px-4 text-[10px] font-bold uppercase tracking-widest text-apple-text-tertiary w-[15%]">Categoría</th>
                <th className="py-4 px-4 text-[10px] font-bold uppercase tracking-widest text-apple-text-tertiary w-[18%]">Responsable</th>
                <th className="py-4 px-4 text-[10px] font-bold uppercase tracking-widest text-apple-text-tertiary w-[13%]">Fecha Límite</th>
                <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-apple-text-tertiary w-[12%] text-center">Estado</th>
              </tr>
            </thead>
            <tbody>
              {filteredGoals.length === 0 && (
                <tr><td colSpan={6} className="text-center py-10 text-apple-text-tertiary text-sm font-medium">No hay metas que coincidan con el filtro.</td></tr>
              )}
              {filteredGoals.map((g: any) => (
                <tr key={g.id} onClick={() => onGoalClick(g)} className="border-b border-apple-separator/20 hover:bg-apple-secondary/40 cursor-pointer transition-colors group">
                  <td className="py-4 px-6 flex items-start gap-4">
                    <div className="mt-0.5 text-apple-text-tertiary group-hover:text-apple-blue transition-colors">
                      {g.status === 'achieved' ? <CheckCircle2 className="w-5 h-5 text-apple-green" /> : <Circle className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className={cn("text-[14px] font-bold leading-snug", g.status === 'achieved' ? "text-apple-text-tertiary line-through" : "text-apple-text")}>{g.title}</div>
                      <div className="flex items-center gap-3 mt-1.5">
                        {g.subtasks?.length > 0 && (
                          <div className="text-[10px] font-bold text-apple-text-secondary bg-apple-secondary px-1.5 py-0.5 rounded flex items-center gap-1">
                            <ListChecks className="w-3 h-3" />
                            {g.subtasks.filter((s:any)=>s.completed).length}/{g.subtasks.length}
                          </div>
                        )}
                        {g.comments?.length > 0 && (
                          <div className="text-[10px] font-bold text-apple-text-secondary bg-apple-secondary px-1.5 py-0.5 rounded flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {g.comments.length}
                          </div>
                        )}
                        {g.attachments?.length > 0 && (
                          <div className="text-[10px] font-bold text-apple-text-secondary bg-apple-secondary px-1.5 py-0.5 rounded flex items-center gap-1">
                            <Paperclip className="w-3 h-3" />
                            {g.attachments.length}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    {g.priority && (
                      <div className={cn("px-2 py-1 rounded text-[9px] font-bold tracking-widest uppercase border inline-flex items-center gap-1", priorityColors[g.priority as keyof typeof priorityColors])}>
                        {priorityLabels[g.priority as keyof typeof priorityLabels]}
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4">
                     {g.category && (
                      <div className="px-2 py-1 rounded bg-apple-secondary text-apple-text-secondary text-[9px] font-bold tracking-widest uppercase inline-flex items-center gap-1 border border-apple-separator/50">
                        {g.category}
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2.5">
                       <div className="w-7 h-7 rounded-full bg-apple-blue/10 text-apple-blue flex items-center justify-center text-[10px] font-black uppercase">
                         {g.responsible ? g.responsible.charAt(0) : 'E'}
                       </div>
                       <span className="text-[12px] font-bold text-apple-text-secondary truncate">{g.responsible || 'Equipo'}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                     <div className={cn("flex items-center gap-1.5 text-[11px] font-bold uppercase", g.status === 'achieved' ? "text-apple-green" : "text-apple-text-secondary")}>
                       <Calendar className="w-3.5 h-3.5" />
                       {g.targetDate || 'Sin Fecha'}
                     </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col items-center gap-1.5">
                      <span className={cn("text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full border", 
                         g.status === 'achieved' ? "bg-apple-green/10 text-apple-green border-apple-green/20" : 
                         g.status === 'in_progress' ? "bg-apple-blue/10 text-apple-blue border-apple-blue/20" : 
                         "bg-apple-secondary text-apple-text-tertiary border-apple-separator/50"
                       )}>
                         {g.status === 'achieved' ? 'Lograda' : g.status === 'in_progress' ? 'En Progreso' : 'Por Hacer'}
                       </span>
                      <div className="flex items-center gap-2 w-full mt-0.5">
                        <div className="flex-1 h-1.5 bg-apple-secondary rounded-full overflow-hidden">
                          <div className={cn("h-full transition-all", g.status === 'achieved' ? 'bg-apple-green' : 'bg-apple-blue')} style={{ width: `${g.progress}%` }} />
                        </div>
                        <span className="text-[10px] font-black tabular-nums text-apple-text">{g.progress}%</span>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const GoalTaskCard = ({ goal, onDragStart, onToggle, onClick, onDelete, onToggleSubtask }: any) => {
  const completedSubtasks = goal.subtasks?.filter((st: any) => st.completed).length || 0;
  const totalSubtasks = goal.subtasks?.length || 0;

  return (
    <div 
      draggable
      onDragStart={(e) => onDragStart(e, goal.id)}
      className="bg-apple-bg border border-apple-separator rounded-[16px] p-4 shadow-sm hover:shadow-apple-soft transition-all cursor-grab active:cursor-grabbing group relative flex flex-col min-h-[140px]"
    >
      <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 z-10">
        <button onClick={(e) => { e.stopPropagation(); onDelete(goal.id, goal.title); }} className="p-1.5 text-apple-text-tertiary hover:text-apple-red hover:bg-apple-red/10 rounded-lg">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex items-center gap-2 mb-3" onClick={() => onClick(goal)}>
        {goal.priority && (
          <div className={cn("px-2 py-0.5 rounded text-[9px] font-bold tracking-widest uppercase border flex items-center gap-1", priorityColors[goal.priority as keyof typeof priorityColors])}>
            <Flag className="w-2.5 h-2.5" />
            {priorityLabels[goal.priority as keyof typeof priorityLabels]}
          </div>
        )}
        {goal.category && (
          <div className="px-2 py-0.5 rounded bg-apple-slate text-apple-text-secondary text-[9px] font-bold tracking-widest uppercase flex items-center gap-1">
            <Tag className="w-2.5 h-2.5" />
            {goal.category}
          </div>
        )}
      </div>

      <div className="flex items-start gap-3 mb-3 pr-8 cursor-pointer" onClick={() => onClick(goal)}>
         <button 
           onClick={(e) => { e.stopPropagation(); onToggle(goal); }} 
           className="mt-0.5 shrink-0 text-apple-text-tertiary hover:text-apple-green transition-colors"
         >
           {goal.status === 'achieved' ? (
             <CheckCircle2 className="w-5 h-5 text-apple-green" />
           ) : (
             <Circle className="w-5 h-5" />
           )}
         </button>
         <div>
           <h4 className={cn(
             "text-[13px] font-bold leading-snug transition-colors",
             goal.status === 'achieved' ? "text-apple-text-tertiary line-through" : "text-apple-text"
           )}>{goal.title}</h4>
           {goal.indicator && (
             <p className="text-[11px] font-medium text-apple-text-tertiary mt-1 line-clamp-2">{goal.indicator}</p>
           )}
         </div>
      </div>
      
      {/* Subtasks Preview */}
      {goal.subtasks && goal.subtasks.length > 0 && (
        <div className="mb-4 pl-8 space-y-1.5">
          {goal.subtasks.slice(0, 3).map((st: any) => (
             <div key={st.id} className="flex items-start gap-2 group/st" onClick={(e) => { e.stopPropagation(); onToggleSubtask(goal, st.id); }}>
               <button className="mt-[2px] text-apple-text-tertiary hover:text-apple-blue transition-colors">
                 {st.completed ? <CheckCircle2 className="w-3.5 h-3.5 text-apple-blue" /> : <Circle className="w-3.5 h-3.5" />}
               </button>
               <span className={cn("text-[11px] font-medium leading-tight cursor-pointer", st.completed ? "text-apple-text-tertiary line-through" : "text-apple-text-secondary group-hover/st:text-apple-black")}>
                 {st.title || 'Nueva subtarea'}
               </span>
             </div>
          ))}
          {goal.subtasks.length > 3 && (
            <div className="text-[10px] font-bold text-apple-text-tertiary pl-5 pt-1">
              + {goal.subtasks.length - 3} subtareas más
            </div>
          )}
        </div>
      )}

      {/* Progress Bar (only if no subtasks and partial progress) */}
      {goal.progress > 0 && goal.progress < 100 && totalSubtasks === 0 && (
        <div className="mb-4 pl-8 cursor-pointer" onClick={() => onClick(goal)}>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-apple-secondary rounded-full overflow-hidden">
              <div className="h-full bg-apple-blue transition-all" style={{ width: `${goal.progress}%` }} />
            </div>
            <span className="text-[10px] font-bold text-apple-text-tertiary tabular-nums">{goal.progress}%</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mt-auto pt-3 border-t border-apple-separator/40 cursor-pointer" onClick={() => onClick(goal)}>
        <div className="flex items-center gap-2 overflow-hidden flex-1 pr-2">
          {totalSubtasks > 0 && (
            <div className="flex items-center gap-1 text-[10px] font-bold text-apple-text-secondary bg-apple-secondary px-1.5 py-0.5 rounded shrink-0">
              <ListChecks className="w-3 h-3" />
              <span>{completedSubtasks}/{totalSubtasks}</span>
            </div>
          )}
          {goal.comments && goal.comments.length > 0 && (
            <div className="flex items-center gap-1 text-[10px] font-bold text-apple-text-secondary bg-apple-secondary px-1.5 py-0.5 rounded shrink-0">
              <MessageSquare className="w-3 h-3" />
              <span>{goal.comments.length}</span>
            </div>
          )}
          {goal.attachments && goal.attachments.length > 0 && (
            <div className="flex items-center gap-1 text-[10px] font-bold text-apple-text-secondary bg-apple-secondary px-1.5 py-0.5 rounded shrink-0">
              <Paperclip className="w-3 h-3" />
              <span>{goal.attachments.length}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 min-w-0">
             <div className="w-5 h-5 rounded-full bg-apple-blue/10 text-apple-blue flex items-center justify-center text-[8px] font-black uppercase ring-2 ring-apple-bg shrink-0">
               {goal.responsible ? goal.responsible.charAt(0) : 'E'}
             </div>
             <span className="text-[10px] font-bold text-apple-text-secondary truncate">{goal.responsible || 'Equipo'}</span>
          </div>
        </div>
        
        <div className={cn(
          "flex items-center gap-1 text-[9px] font-bold tracking-widest uppercase px-1.5 py-1 rounded-md shrink-0 whitespace-nowrap",
          goal.status === 'achieved' ? "bg-apple-green/10 text-apple-green" : "bg-apple-secondary text-apple-text-tertiary"
        )}>
          <Calendar className="w-2.5 h-2.5 shrink-0" />
          <span>{goal.targetDate || 'Sin Fecha'}</span>
        </div>
      </div>
    </div>
  );
};

const KanbanColumn = ({ id, title, count, colorClass, children, onDragOver, onDrop, onAdd }: any) => (
  <div 
    className="flex-1 min-w-[280px] max-w-[350px] bg-apple-secondary/60 rounded-[24px] p-4 flex flex-col gap-3 shrink-0 border border-apple-separator/50"
    onDragOver={onDragOver}
    onDrop={(e) => onDrop(e, id)}
  >
    <div className="flex items-center justify-between px-2 mb-2">
      <div className="flex items-center gap-2">
        <div className={cn("w-2 h-2 rounded-full shadow-sm", colorClass)} />
        <h3 className="text-[12px] font-black tracking-widest uppercase text-apple-text">{title}</h3>
      </div>
      <div className="px-2 py-0.5 bg-apple-separator/50 rounded-full text-[11px] font-bold text-apple-text-secondary">
        {count}
      </div>
    </div>
    
    <div className="flex flex-col gap-3 min-h-[150px]">
      {children}
    </div>
    
    <button 
      onClick={onAdd} 
      className="mt-2 w-full py-3 rounded-xl border-2 border-dashed border-apple-separator/60 text-apple-text-tertiary hover:text-apple-text hover:border-apple-text-tertiary hover:bg-apple-separator/20 transition-all text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-2"
    >
       <Plus className="w-4 h-4" /> Añadir Tarea
    </button>
  </div>
);

const GoalModal = ({ isOpen, onClose, onSave, initialData, specialists }: any) => {
  const [form, setForm] = useState({ 
    title: '', indicator: '', responsible: '', targetDate: '', progress: 0, subtasks: [] as any[],
    priority: 'medium', category: 'Administración', comments: [] as any[], attachments: [] as any[], status: 'pending'
  });
  const [newComment, setNewComment] = useState('');
  const { profile, user } = useAuthStore();
  const userName = profile?.full_name || user?.email?.split('@')[0] || 'Usuario';
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      if (initialData && initialData.id) {
        setForm({
          title: initialData.title || '',
          indicator: initialData.indicator || '',
          responsible: initialData.responsible || '',
          targetDate: initialData.targetDate || '',
          progress: initialData.progress || 0,
          subtasks: initialData.subtasks || [],
          priority: initialData.priority || 'medium',
          category: initialData.category || 'Administración',
          comments: initialData.comments || [],
          attachments: initialData.attachments || [],
          status: initialData.status || (initialData.progress === 100 ? 'achieved' : (initialData.progress > 0 ? 'in_progress' : 'pending'))
        });
      } else {
        setForm({ 
          title: '', indicator: '', responsible: '', targetDate: '', progress: initialData?.progress || 0, subtasks: [],
          priority: 'medium', category: 'Administración', comments: [], attachments: [], status: initialData?.status || 'pending'
        });
      }
      setNewComment('');
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!form.title) return;
    let finalProgress = form.progress;
    if (form.subtasks && form.subtasks.length > 0) {
      const completed = form.subtasks.filter((st: any) => st.completed).length;
      finalProgress = Math.round((completed / form.subtasks.length) * 100);
    }
    
    let finalStatus = form.status || 'pending';
    if (finalProgress === 100) finalStatus = 'achieved';
    else if (finalStatus === 'achieved' && finalProgress < 100) finalStatus = 'in_progress';
    else if (finalStatus === 'pending' && finalProgress > 0) finalStatus = 'in_progress';

    onSave({ ...form, progress: finalProgress, status: finalStatus });
    onClose();
  };

  const handleAddSubtask = () => {
    setForm({ 
      ...form, 
      subtasks: [...form.subtasks, { id: crypto.randomUUID(), title: '', completed: false }] 
    });
  };

  const handleSubtaskChange = (id: string, title: string) => {
    setForm({ 
      ...form, 
      subtasks: form.subtasks.map(st => st.id === id ? { ...st, title } : st) 
    });
  };

  const handleRemoveSubtask = (id: string) => {
    const newSubtasks = form.subtasks.filter(st => st.id !== id);
    let newProgress = form.progress;
    if (newSubtasks.length > 0) {
       const completed = newSubtasks.filter(st => st.completed).length;
       newProgress = Math.round((completed / newSubtasks.length) * 100);
    }
    setForm({ ...form, subtasks: newSubtasks, progress: newProgress });
  };

  const handleToggleSubtaskInModal = (id: string) => {
     const newSubtasks = form.subtasks.map(st => st.id === id ? { ...st, completed: !st.completed } : st);
     const completed = newSubtasks.filter(st => st.completed).length;
     const total = newSubtasks.length;
     const newProgress = total > 0 ? Math.round((completed / total) * 100) : form.progress;
     setForm({ ...form, subtasks: newSubtasks, progress: newProgress });
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    const comment = {
      id: crypto.randomUUID(),
      text: newComment,
      author: userName,
      date: new Date().toISOString()
    };
    setForm({ ...form, comments: [...form.comments, comment] });
    setNewComment('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      // Solo guardar Base64 si es imagen y menor a 2MB para no saturar localStorage
      const dataUrl = file.type.startsWith('image/') && file.size < 2 * 1024 * 1024 
        ? event.target?.result as string 
        : undefined;

      const newAttachment = {
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        type: file.type,
        dataUrl
      };

      setForm(prev => ({ ...prev, attachments: [...prev.attachments, newAttachment] }));
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveAttachment = (id: string) => {
    setForm(prev => ({ ...prev, attachments: prev.attachments.filter((a: any) => a.id !== id) }));
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-apple">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="bg-apple-bg w-full max-w-[500px] flex flex-col rounded-apple shadow-2xl relative z-10 overflow-hidden border border-apple-separator">
        <div className="px-8 py-6 border-b border-apple-separator flex items-center justify-between bg-apple-secondary/30 shrink-0">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-apple-blue/10 rounded-lg flex items-center justify-center">
                <Briefcase className="text-apple-blue w-5 h-5" strokeWidth={1.5} />
             </div>
             <div>
               <h2 className="text-xl font-bold tracking-tight text-apple-text">
                 {initialData && initialData.id ? 'Editar Meta' : 'Nueva Meta de Equipo'}
               </h2>
               <p className="description-small uppercase tracking-widest mt-0.5 text-apple-blue font-bold">Iniciativa Interna</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 text-apple-text-tertiary hover:text-apple-text rounded-full hover:bg-apple-bg transition-all">
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        <div className="p-8 space-y-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
           <div className="space-y-1.5">
             <label className="text-[10px] uppercase font-bold text-apple-text-tertiary ml-1 tracking-widest">Título de la Meta</label>
             <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Ej: Renovar material didáctico" className="w-full bg-apple-tertiary border border-apple-separator/50 rounded-xl py-3 px-4 text-[13px] font-medium text-apple-text focus:ring-1 focus:ring-apple-blue/30 outline-none" />
           </div>

           <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1.5">
               <label className="text-[10px] uppercase font-bold text-apple-text-tertiary ml-1 tracking-widest">Categoría</label>
               <select 
                 value={form.category} 
                 onChange={e => setForm({...form, category: e.target.value})} 
                 className="w-full bg-apple-tertiary border border-apple-separator/50 rounded-xl py-3 px-4 text-[13px] font-medium text-apple-text focus:ring-1 focus:ring-apple-blue/30 outline-none appearance-none"
               >
                 <option value="Administración">Administración</option>
                 <option value="Capacitación">Capacitación</option>
                 <option value="Infraestructura">Infraestructura</option>
                 <option value="Innovación">Innovación</option>
                 <option value="Clínico">Clínico</option>
               </select>
             </div>
             <div className="space-y-1.5">
               <label className="text-[10px] uppercase font-bold text-apple-text-tertiary ml-1 tracking-widest">Prioridad</label>
               <select 
                 value={form.priority} 
                 onChange={e => setForm({...form, priority: e.target.value})} 
                 className="w-full bg-apple-tertiary border border-apple-separator/50 rounded-xl py-3 px-4 text-[13px] font-medium text-apple-text focus:ring-1 focus:ring-apple-blue/30 outline-none appearance-none"
               >
                 <option value="low">Baja</option>
                 <option value="medium">Media</option>
                 <option value="high">Alta</option>
               </select>
             </div>
           </div>
           
           <div className="space-y-1.5">
             <div className="flex items-center justify-between ml-1 mb-1">
               <label className="text-[10px] uppercase font-bold text-apple-text-tertiary tracking-widest">Subtareas (Checklist)</label>
               {form.subtasks.length > 0 && (
                 <span className="text-[10px] font-bold text-apple-blue tabular-nums">
                   {form.subtasks.filter(st => st.completed).length} / {form.subtasks.length} completadas
                 </span>
               )}
             </div>
             
             <div className="space-y-2">
               {form.subtasks.map(st => (
                 <div key={st.id} className="flex items-center gap-2">
                   <button 
                     onClick={() => handleToggleSubtaskInModal(st.id)}
                     className="text-apple-text-tertiary hover:text-apple-blue transition-colors shrink-0"
                   >
                     {st.completed ? <CheckCircle2 className="w-5 h-5 text-apple-blue" /> : <Circle className="w-5 h-5" />}
                   </button>
                   <input 
                     type="text" 
                     value={st.title} 
                     onChange={(e) => handleSubtaskChange(st.id, e.target.value)}
                     placeholder="Nueva subtarea..." 
                     className={cn(
                       "flex-1 bg-transparent border-b border-apple-separator/50 py-1.5 text-[13px] outline-none focus:border-apple-blue/50 transition-colors",
                       st.completed ? "text-apple-text-tertiary line-through" : "text-apple-text"
                     )}
                   />
                   <button 
                     onClick={() => handleRemoveSubtask(st.id)}
                     className="p-1.5 text-apple-text-tertiary hover:text-apple-red transition-colors rounded-md"
                   >
                     <X className="w-4 h-4" />
                   </button>
                 </div>
               ))}
               <button 
                 onClick={handleAddSubtask}
                 className="flex items-center gap-2 text-[11px] font-bold text-apple-blue hover:bg-apple-blue/10 px-3 py-2 rounded-lg transition-colors mt-2"
               >
                 <Plus className="w-4 h-4" /> Añadir subtarea
               </button>
             </div>
           </div>

           <div className="space-y-1.5">
             <label className="text-[10px] uppercase font-bold text-apple-text-tertiary ml-1 tracking-widest">Descripción Adicional</label>
             <textarea value={form.indicator} onChange={e => setForm({...form, indicator: e.target.value})} placeholder="Notas extras..." className="w-full bg-apple-tertiary border border-apple-separator/50 rounded-xl py-3 px-4 text-[13px] font-medium text-apple-text focus:ring-1 focus:ring-apple-blue/30 outline-none min-h-[60px] resize-none" />
           </div>
           
           <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1.5">
               <label className="text-[10px] uppercase font-bold text-apple-text-tertiary ml-1 tracking-widest">Asignado a</label>
               <select 
                 value={form.responsible} 
                 onChange={e => setForm({...form, responsible: e.target.value})} 
                 className="w-full bg-apple-tertiary border border-apple-separator/50 rounded-xl py-3 px-4 text-[13px] font-medium text-apple-text focus:ring-1 focus:ring-apple-blue/30 outline-none appearance-none"
               >
                 <option value="">Selecciona responsable...</option>
                 <option value="Equipo Directivo">Equipo Directivo</option>
                 {specialists.map((s: any) => (
                   <option key={s.id} value={s.name}>{s.name}</option>
                 ))}
               </select>
             </div>
             <div className="space-y-1.5">
               <label className="text-[10px] uppercase font-bold text-apple-text-tertiary ml-1 tracking-widest">Fecha Límite</label>
               <input type="date" value={form.targetDate} onChange={e => setForm({...form, targetDate: e.target.value})} className="w-full bg-apple-tertiary border border-apple-separator/50 rounded-xl py-3 px-4 text-[13px] font-medium text-apple-text focus:ring-1 focus:ring-apple-blue/30 outline-none" />
             </div>
           </div>

           {form.subtasks.length === 0 && (
             <div className="space-y-4 pt-4 border-t border-apple-separator/50">
               <div className="flex items-center justify-between">
                  <label className="text-[10px] uppercase font-bold text-apple-text-tertiary ml-1 tracking-widest">Progreso Manual</label>
                  <div className={cn(
                    "px-3 py-1.5 rounded-full text-[11px] font-bold tabular-nums border",
                    form.progress === 100 ? "bg-apple-green text-white border-apple-green" : "bg-apple-bg text-apple-blue border-apple-blue/20"
                  )}>
                    {form.progress}%
                  </div>
               </div>
               <input 
                 type="range" 
                 min="0" 
                 max="100" 
                 step="5"
                 value={form.progress} 
                 onChange={(e) => setForm({...form, progress: parseInt(e.target.value)})}
                 className="w-full h-2 bg-apple-secondary rounded-full appearance-none cursor-pointer accent-apple-blue"
               />
               <p className="text-[9px] font-medium text-apple-text-tertiary text-center mt-1">
                 Usa subtareas para que el progreso se calcule automáticamente.
               </p>
             </div>
           )}

           {/* Attachments Section */}
           <div className="space-y-3 pt-4 border-t border-apple-separator/50">
             <div className="flex items-center justify-between">
               <h3 className="text-[11px] uppercase font-bold text-apple-text-tertiary tracking-widest flex items-center gap-2 ml-1">
                 <Paperclip className="w-3.5 h-3.5" /> Archivos Adjuntos
               </h3>
               <button 
                 onClick={() => fileInputRef.current?.click()}
                 className="flex items-center gap-1 text-[11px] font-bold text-apple-blue hover:bg-apple-blue/10 px-3 py-1.5 rounded-lg transition-colors"
               >
                 <Plus className="w-3 h-3" /> Añadir Archivo
               </button>
               <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
             </div>

             {form.attachments.length > 0 && (
               <div className="grid grid-cols-2 gap-3">
                 {form.attachments.map((file: any) => (
                   <div key={file.id} className="bg-apple-secondary/50 border border-apple-separator/40 rounded-xl p-3 flex items-start gap-3 relative group">
                     <button 
                       onClick={() => handleRemoveAttachment(file.id)}
                       className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-apple-red text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                     >
                       <X className="w-3 h-3" />
                     </button>
                     
                     <div className="w-10 h-10 rounded-lg bg-apple-bg border border-apple-separator/50 flex items-center justify-center shrink-0 overflow-hidden">
                       {file.dataUrl ? (
                         <img src={file.dataUrl} alt={file.name} className="w-full h-full object-cover" />
                       ) : file.type.includes('image') ? (
                         <ImageIcon className="w-5 h-5 text-apple-blue" />
                       ) : (
                         <File className="w-5 h-5 text-apple-text-tertiary" />
                       )}
                     </div>
                     <div className="flex-1 min-w-0">
                       <p className="text-[11px] font-bold text-apple-black truncate leading-tight mb-0.5" title={file.name}>{file.name}</p>
                       <p className="text-[9px] font-bold text-apple-text-tertiary uppercase">{(file.size / 1024).toFixed(1)} KB</p>
                     </div>
                   </div>
                 ))}
               </div>
             )}
           </div>

           {/* Comments Section */}
           <div className="space-y-4 pt-4 border-t border-apple-separator/50">
             <h3 className="text-[11px] uppercase font-bold text-apple-text-tertiary tracking-widest flex items-center gap-2 ml-1">
               <MessageSquare className="w-3.5 h-3.5" /> Bitácora / Comentarios
             </h3>
             
             <div className="space-y-3">
               {form.comments.map((c: any) => (
                 <div key={c.id} className="bg-apple-secondary/50 rounded-2xl p-4 flex gap-3 border border-apple-separator/40">
                   <div className="w-8 h-8 rounded-full bg-apple-blue/10 text-apple-blue flex items-center justify-center text-[11px] font-black uppercase shrink-0">
                     {c.author.charAt(0)}
                   </div>
                   <div className="flex-1">
                     <div className="flex items-center justify-between mb-1.5">
                       <span className="text-[12px] font-bold text-apple-black">{c.author}</span>
                       <span className="text-[10px] font-bold text-apple-text-tertiary">
                         {new Date(c.date).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })}
                       </span>
                     </div>
                     <p className="text-[13px] text-apple-text-secondary leading-snug">{c.text}</p>
                   </div>
                 </div>
               ))}
               
               <div className="flex gap-2 pt-2">
                 <input 
                   type="text" 
                   value={newComment} 
                   onChange={e => setNewComment(e.target.value)}
                   onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                   placeholder="Escribe una actualización o comentario..." 
                   className="flex-1 bg-apple-tertiary border border-apple-separator/50 rounded-xl py-3 px-4 text-[13px] font-medium text-apple-text focus:ring-1 focus:ring-apple-blue/30 outline-none" 
                 />
                 <button 
                   onClick={handleAddComment}
                   disabled={!newComment.trim()}
                   className="w-11 h-11 bg-apple-blue text-white rounded-xl flex items-center justify-center hover:bg-blue-600 transition-colors disabled:opacity-50 shrink-0 shadow-sm"
                 >
                   <Send className="w-4 h-4" />
                 </button>
               </div>
             </div>
           </div>

        </div>

        <div className="px-8 py-5 flex gap-4 bg-apple-bg border-t border-apple-separator shrink-0">
            <button onClick={onClose} className="flex-1 px-8 py-2.5 text-[11px] font-bold tracking-widest uppercase text-apple-text-secondary hover:text-apple-text transition-all">Cancelar</button>
            <button onClick={handleSave} disabled={!form.title} className="flex-1 apple-button bg-apple-blue text-white disabled:opacity-50 hover:bg-blue-600 py-3 text-[11px] uppercase tracking-widest font-bold flex items-center justify-center gap-2 shadow-sm">
              <Check className="w-4 h-4" /> {initialData && initialData.id ? 'Guardar Cambios' : 'Crear Meta'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default function TeamGoalsMain() {
  const [modalState, setModalState] = useState<{isOpen: boolean, data: any}>({ isOpen: false, data: null });
  const [draggedGoalId, setDraggedGoalId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('list');
  const [listFilter, setListFilter] = useState('all');
  
  const teamGoals = useTeamGoalStore(s => s.teamGoals);
  const addGoal = useTeamGoalStore(s => s.addTeamGoal);
  const updateGoal = useTeamGoalStore(s => s.updateTeamGoal);
  const deleteGoal = useTeamGoalStore(s => s.deleteTeamGoal);

  const { specialists, fetchSpecialists } = useSpecialistStore();

  useEffect(() => {
    if (specialists.length === 0) {
      fetchSpecialists();
    }
  }, [specialists.length, fetchSpecialists]);

  // Derived columns based on actual status, falling back to progress to support legacy data gracefully
  const pendingGoals = teamGoals.filter(g => g.status === 'pending' || (!g.status && g.progress === 0));
  const inProgressGoals = teamGoals.filter(g => g.status === 'in_progress' || (!g.status && g.progress > 0 && g.progress < 100));
  const achievedGoals = teamGoals.filter(g => g.status === 'achieved' || (!g.status && g.progress === 100));

  const globalProgress = teamGoals.length > 0 
    ? Math.round(teamGoals.reduce((acc, g) => acc + g.progress, 0) / teamGoals.length)
    : 0;

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('goalId', id);
    setDraggedGoalId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('goalId');
    if (!id) return;

    let newStatus = 'pending';
    if (columnId === 'progress') newStatus = 'in_progress';
    if (columnId === 'achieved') newStatus = 'achieved';

    const goal = teamGoals.find(g => g.id === id);
    if (goal && goal.status !== newStatus) {
      let updatedProgress = goal.progress;
      let updatedSubtasks = goal.subtasks || [];
      
      if (newStatus === 'achieved') {
        updatedProgress = 100;
        updatedSubtasks = updatedSubtasks.map(st => ({ ...st, completed: true }));
      } else if (goal.status === 'achieved' && newStatus !== 'achieved') {
        // Moving back from achieved
        if (updatedSubtasks.length > 0) {
          const completedCount = updatedSubtasks.filter(st => st.completed).length;
          updatedProgress = Math.round((completedCount / updatedSubtasks.length) * 100);
        } else {
          updatedProgress = newStatus === 'in_progress' ? 50 : 0;
        }
      }

      updateGoal(id, { 
        status: newStatus as any,
        progress: updatedProgress,
        subtasks: updatedSubtasks
      });
    }
    setDraggedGoalId(null);
  };

  const handleToggleAchieved = (goal: any) => {
    const isAchieved = goal.status === 'achieved' || goal.progress === 100;
    const newStatus = isAchieved ? 'in_progress' : 'achieved';
    let newProgress = isAchieved ? 0 : 100;
    
    const updatedSubtasks = goal.subtasks?.map((st: any) => ({
      ...st,
      completed: !isAchieved
    })) || [];

    if (isAchieved && updatedSubtasks.length > 0) {
       // if they were all completed, and we toggle off, progress goes to 0
       newProgress = 0;
    } else if (isAchieved && updatedSubtasks.length === 0) {
       // if moving back and no subtasks, put it in progress 50%
       newProgress = 50;
    }

    updateGoal(goal.id, { 
      status: newStatus as any,
      progress: newProgress,
      subtasks: updatedSubtasks
    });
  };

  const handleToggleSubtaskDirectly = (goal: any, subtaskId: string) => {
    if (!goal.subtasks) return;
    
    const updatedSubtasks = goal.subtasks.map((st: any) => 
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    const completedCount = updatedSubtasks.filter((st: any) => st.completed).length;
    const totalCount = updatedSubtasks.length;
    const newProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : goal.progress;
    
    let newStatus = goal.status;
    if (newProgress === 100) newStatus = 'achieved';
    else if (newStatus === 'achieved' && newProgress < 100) newStatus = 'in_progress';
    else if (newStatus === 'pending' && newProgress > 0) newStatus = 'in_progress';

    updateGoal(goal.id, { 
      subtasks: updatedSubtasks,
      progress: newProgress,
      status: newStatus
    });
  };

  const handleDeleteGoal = (id: string, title: string) => {
    if (window.confirm(`¿Eliminar la meta "${title}"?`)) {
      deleteGoal(id);
    }
  };

  const handleSaveGoal = (formData: any) => {
    if (modalState.data && modalState.data.id) {
      updateGoal(modalState.data.id, formData);
    } else {
      addGoal(formData);
    }
  };

  return (
    <div className="space-y-8 animate-apple pb-20 h-full flex flex-col max-w-[1400px] mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-apple-text mb-0.5">Metas del Equipo</h2>
          <p className="description-small font-bold text-apple-text-secondary uppercase tracking-widest">Gestor de Iniciativas de Colaboradores</p>
        </div>
        <div className="flex items-center gap-4">
          
          <div className="bg-apple-secondary/50 p-1 rounded-xl flex items-center border border-apple-separator/30">
            <button 
              onClick={() => setViewMode('kanban')}
              className={cn("px-4 py-2 rounded-lg text-[11px] font-bold tracking-widest uppercase transition-all flex items-center gap-2", viewMode === 'kanban' ? "bg-apple-text text-apple-bg shadow-sm" : "text-apple-text-tertiary hover:text-apple-text")}
            >
              <LayoutDashboard className="w-4 h-4" /> Tablero
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={cn("px-4 py-2 rounded-lg text-[11px] font-bold tracking-widest uppercase transition-all flex items-center gap-2", viewMode === 'list' ? "bg-apple-text text-apple-bg shadow-sm" : "text-apple-text-tertiary hover:text-apple-text")}
            >
              <List className="w-4 h-4" /> Lista
            </button>
          </div>

          <button 
            onClick={() => setModalState({ isOpen: true, data: { status: 'pending' } })} 
            className="apple-button apple-button-primary flex items-center gap-2 px-6 py-2.5 text-[11px] uppercase tracking-widest font-bold w-full sm:w-auto justify-center"
          >
            <Plus className="w-4 h-4" strokeWidth={2} /> Nueva Meta
          </button>
        </div>
      </header>

      {/* Banner */}
      <div className="bg-gradient-to-r from-apple-blue/10 to-indigo-500/10 border border-apple-blue/20 rounded-[24px] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden shadow-apple-soft shrink-0">
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 bg-apple-bg rounded-2xl flex items-center justify-center shadow-sm shrink-0 border border-apple-separator/40">
            <Target className="text-apple-blue w-6 h-6" strokeWidth={2} />
          </div>
          <div>
            <div className="text-[10px] font-black tracking-widest text-apple-blue uppercase mb-1">Iniciativas Institucionales</div>
            <div className="flex items-center gap-3">
              <div className="w-32 h-2 bg-apple-bg/50 border border-apple-separator/50 rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-apple-blue rounded-full shadow-[0_0_8px_rgba(19,88,255,0.5)] transition-all duration-1000" style={{ width: `${globalProgress}%` }} />
              </div>
              <span className="text-[14px] font-black text-apple-blue tabular-nums">{globalProgress}%</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 text-apple-text-secondary relative z-10 w-full sm:w-auto">
          <div className="bg-apple-bg/80 border border-apple-separator/40 px-4 py-2.5 rounded-xl flex-1 sm:flex-none">
            <div className="text-[9px] uppercase tracking-widest font-bold text-apple-text-tertiary mb-0.5">Total Metas</div>
            <div className="text-[14px] font-black text-apple-text tabular-nums">{teamGoals.length}</div>
          </div>
        </div>
      </div>

      {viewMode === 'kanban' ? (
        <div className="flex-1 overflow-x-auto custom-scrollbar pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 mt-2">
          <div className="flex gap-4 sm:gap-6 h-full min-h-[500px]">
            <KanbanColumn 
              id="pending" 
              title="Por Hacer" 
              count={pendingGoals.length} 
              colorClass="bg-apple-text-tertiary"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onAdd={() => setModalState({ isOpen: true, data: { status: 'pending', progress: 0 } })}
            >
              {pendingGoals.map(g => (
                <GoalTaskCard 
                  key={g.id} goal={g} 
                  onDragStart={handleDragStart} 
                  onToggle={handleToggleAchieved}
                  onClick={() => setModalState({ isOpen: true, data: g })}
                  onDelete={handleDeleteGoal}
                  onToggleSubtask={handleToggleSubtaskDirectly}
                />
              ))}
            </KanbanColumn>

            <KanbanColumn 
              id="progress" 
              title="En Progreso" 
              count={inProgressGoals.length} 
              colorClass="bg-apple-blue"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onAdd={() => setModalState({ isOpen: true, data: { status: 'in_progress', progress: 0 } })}
            >
              {inProgressGoals.map(g => (
                <GoalTaskCard 
                  key={g.id} goal={g} 
                  onDragStart={handleDragStart} 
                  onToggle={handleToggleAchieved}
                  onClick={() => setModalState({ isOpen: true, data: g })}
                  onDelete={handleDeleteGoal}
                  onToggleSubtask={handleToggleSubtaskDirectly}
                />
              ))}
            </KanbanColumn>

            <KanbanColumn 
              id="achieved" 
              title="Logradas" 
              count={achievedGoals.length} 
              colorClass="bg-apple-green"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onAdd={() => setModalState({ isOpen: true, data: { status: 'achieved', progress: 100 } })}
            >
              {achievedGoals.map(g => (
                <GoalTaskCard 
                  key={g.id} goal={g} 
                  onDragStart={handleDragStart} 
                  onToggle={handleToggleAchieved}
                  onClick={() => setModalState({ isOpen: true, data: g })}
                  onDelete={handleDeleteGoal}
                  onToggleSubtask={handleToggleSubtaskDirectly}
                />
              ))}
            </KanbanColumn>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto custom-scrollbar mt-2 pb-4">
          <GoalsListView goals={teamGoals} onGoalClick={(g: any) => setModalState({ isOpen: true, data: g })} filter={listFilter} setFilter={setListFilter} />
        </div>
      )}

      <GoalModal 
        isOpen={modalState.isOpen} 
        onClose={() => setModalState({ isOpen: false, data: null })} 
        onSave={handleSaveGoal}
        initialData={modalState.data}
        specialists={specialists}
      />
    </div>
  );
}
