import React, { useState } from 'react';
import { Target, Flag, CheckCircle2, Circle, Plus, TrendingUp, X, Check, Trash2, Calendar, GripVertical, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useClinicalStore } from '../clinical/ClinicalStore';

const GoalTaskCard = ({ goal, onDragStart, onToggle, onClick, onDelete }: any) => {
  return (
    <div 
      draggable
      onDragStart={(e) => onDragStart(e, goal.id)}
      className="bg-apple-bg border border-apple-separator rounded-[16px] p-4 shadow-sm hover:shadow-apple-soft transition-all cursor-grab active:cursor-grabbing group relative"
    >
      <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 z-10">
        <button onClick={(e) => { e.stopPropagation(); onDelete(goal.id, goal.title); }} className="p-1.5 text-apple-text-tertiary hover:text-apple-red hover:bg-apple-red/10 rounded-lg">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex items-start gap-3 mb-3 pr-8 cursor-pointer" onClick={() => onClick(goal)}>
         <button 
           onClick={(e) => { e.stopPropagation(); onToggle(goal); }} 
           className="mt-0.5 shrink-0 text-apple-text-tertiary hover:text-apple-green transition-colors"
         >
           {goal.progress === 100 ? (
             <CheckCircle2 className="w-5 h-5 text-apple-green" />
           ) : (
             <Circle className="w-5 h-5" />
           )}
         </button>
         <div>
           <h4 className={cn(
             "text-[13px] font-bold leading-snug transition-colors",
             goal.progress === 100 ? "text-apple-text-tertiary line-through" : "text-apple-text"
           )}>{goal.title}</h4>
           <p className="text-[11px] font-medium text-apple-text-tertiary mt-1 line-clamp-2">{goal.indicator}</p>
         </div>
      </div>
      
      {goal.progress > 0 && goal.progress < 100 && (
        <div className="mb-4 pl-8 cursor-pointer" onClick={() => onClick(goal)}>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-apple-secondary rounded-full overflow-hidden">
              <div className="h-full bg-apple-blue transition-all" style={{ width: `${goal.progress}%` }} />
            </div>
            <span className="text-[10px] font-bold text-apple-text-tertiary tabular-nums">{goal.progress}%</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pl-8 cursor-pointer" onClick={() => onClick(goal)}>
        <div className="flex items-center gap-1.5">
           <div className="w-5 h-5 rounded-full bg-apple-blue/10 text-apple-blue flex items-center justify-center text-[8px] font-black uppercase ring-2 ring-apple-bg">
             {goal.responsible ? goal.responsible.charAt(0) : 'E'}
           </div>
           <span className="text-[10px] font-bold text-apple-text-secondary max-w-[80px] truncate">{goal.responsible || 'Especialista'}</span>
        </div>
        
        <div className={cn(
          "flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase px-2 py-1 rounded-md",
          goal.progress === 100 ? "bg-apple-green/10 text-apple-green" : "bg-apple-secondary text-apple-text-tertiary"
        )}>
          <Calendar className="w-3 h-3" />
          {goal.targetDate || 'Sin Fecha'}
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

const GoalModal = ({ isOpen, onClose, onSave, initialData }: any) => {
  const [form, setForm] = useState({ title: '', indicator: '', responsible: '', targetDate: '', progress: 0 });

  React.useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setForm({
          title: initialData.title || '',
          indicator: initialData.indicator || '',
          responsible: initialData.responsible || '',
          targetDate: initialData.targetDate || '',
          progress: initialData.progress || 0
        });
      } else {
        setForm({ title: '', indicator: '', responsible: '', targetDate: '', progress: 0 });
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!form.title) return;
    onSave(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-apple">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="bg-apple-bg w-full max-w-[500px] flex flex-col rounded-apple shadow-2xl relative z-10 overflow-hidden border border-apple-separator">
        <div className="px-8 py-6 border-b border-apple-separator flex items-center justify-between bg-apple-secondary/30 shrink-0">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-apple-blue/10 rounded-lg flex items-center justify-center">
                <Target className="text-apple-blue w-5 h-5" strokeWidth={1.5} />
             </div>
             <div>
               <h2 className="text-xl font-bold tracking-tight text-apple-text">
                 {initialData && initialData.id ? 'Editar Meta' : 'Nueva Meta'}
               </h2>
               <p className="description-small uppercase tracking-widest mt-0.5 text-apple-blue font-bold">Detalles de la tarea</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 text-apple-text-tertiary hover:text-apple-text rounded-full hover:bg-apple-bg transition-all">
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        <div className="p-8 space-y-5 overflow-y-auto max-h-[65vh] custom-scrollbar">
           <div className="space-y-1.5">
             <label className="text-[10px] uppercase font-bold text-apple-text-tertiary ml-1 tracking-widest">Título de la Meta</label>
             <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Ej: Seguir instrucciones de 2 pasos" className="w-full bg-apple-tertiary border border-apple-separator/50 rounded-xl py-3 px-4 text-[13px] font-medium text-apple-text focus:ring-1 focus:ring-apple-blue/30 outline-none" />
           </div>
           <div className="space-y-1.5">
             <label className="text-[10px] uppercase font-bold text-apple-text-tertiary ml-1 tracking-widest">Indicador (Medible)</label>
             <textarea value={form.indicator} onChange={e => setForm({...form, indicator: e.target.value})} placeholder="Ej: Logro independiente 4/5" className="w-full bg-apple-tertiary border border-apple-separator/50 rounded-xl py-3 px-4 text-[13px] font-medium text-apple-text focus:ring-1 focus:ring-apple-blue/30 outline-none min-h-[80px] resize-none" />
           </div>
           
           <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1.5">
               <label className="text-[10px] uppercase font-bold text-apple-text-tertiary ml-1 tracking-widest">Responsable</label>
               <input type="text" value={form.responsible} onChange={e => setForm({...form, responsible: e.target.value})} placeholder="Especialista" className="w-full bg-apple-tertiary border border-apple-separator/50 rounded-xl py-3 px-4 text-[13px] font-medium text-apple-text focus:ring-1 focus:ring-apple-blue/30 outline-none" />
             </div>
             <div className="space-y-1.5">
               <label className="text-[10px] uppercase font-bold text-apple-text-tertiary ml-1 tracking-widest">Revisión (T)</label>
               <input type="date" value={form.targetDate} onChange={e => setForm({...form, targetDate: e.target.value})} className="w-full bg-apple-tertiary border border-apple-separator/50 rounded-xl py-3 px-4 text-[13px] font-medium text-apple-text focus:ring-1 focus:ring-apple-blue/30 outline-none" />
             </div>
           </div>

           <div className="space-y-4 pt-4 border-t border-apple-separator/50">
             <div className="flex items-center justify-between">
                <label className="text-[10px] uppercase font-bold text-apple-text-tertiary ml-1 tracking-widest">Progreso de la Meta</label>
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
             <div className="flex justify-between text-[10px] font-bold tracking-widest text-apple-text-tertiary mt-2 px-1">
               <span>0% (Pendiente)</span>
               <span>100% (Logrado)</span>
             </div>
           </div>
        </div>

        <div className="px-8 py-5 flex gap-4 bg-apple-bg border-t border-apple-separator shrink-0">
            <button onClick={onClose} className="flex-1 px-8 py-2.5 text-[11px] font-bold tracking-widest uppercase text-apple-text-secondary hover:text-apple-text transition-all">Cancelar</button>
            <button onClick={handleSave} disabled={!form.title} className="flex-1 apple-button bg-apple-blue text-white disabled:opacity-50 hover:bg-blue-600 py-3 text-[11px] uppercase tracking-widest font-bold flex items-center justify-center gap-2">
              <Check className="w-4 h-4" /> {initialData && initialData.id ? 'Guardar Cambios' : 'Crear Meta'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default function InterventionPlan({ patientId }: { patientId: string }) {
  const [modalState, setModalState] = useState<{isOpen: boolean, data: any}>({ isOpen: false, data: null });
  const [draggedGoalId, setDraggedGoalId] = useState<string | null>(null);
  
  const allGoals = useClinicalStore(s => s.goals);
  const goals = allGoals.filter(g => g.patientId === patientId);

  const addGoal = useClinicalStore(s => s.addGoal);
  const updateGoal = useClinicalStore(s => s.updateGoal);
  const deleteGoal = useClinicalStore(s => s.deleteGoal);

  const pendingGoals = goals.filter(g => g.progress === 0);
  const inProgressGoals = goals.filter(g => g.progress > 0 && g.progress < 100);
  const achievedGoals = goals.filter(g => g.progress === 100);

  const globalProgress = goals.length > 0 
    ? Math.round(goals.reduce((acc, g) => acc + g.progress, 0) / goals.length)
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

    let newProgress = 0;
    if (columnId === 'pending') newProgress = 0;
    if (columnId === 'progress') newProgress = 50; // default for in progress if moved from pending
    if (columnId === 'achieved') newProgress = 100;

    const goal = goals.find(g => g.id === id);
    if (goal && goal.progress !== newProgress) {
      if (columnId === 'progress' && goal.progress > 0 && goal.progress < 100) {
        // Do nothing, it's already in progress
      } else {
        updateGoal(id, { 
          progress: newProgress,
          status: newProgress === 100 ? 'achieved' : 'pending'
        });
      }
    }
    setDraggedGoalId(null);
  };

  const handleToggleAchieved = (goal: any) => {
    const newProgress = goal.progress === 100 ? 0 : 100;
    updateGoal(goal.id, { 
      progress: newProgress,
      status: newProgress === 100 ? 'achieved' : 'pending'
    });
  };

  const handleDeleteGoal = (id: string, title: string) => {
    if (window.confirm(`¿Eliminar la meta "${title}"?`)) {
      deleteGoal(id);
    }
  };

  const handleSaveGoal = (formData: any) => {
    const payload = {
      ...formData,
      status: formData.progress === 100 ? 'achieved' : 'pending'
    };
    
    if (modalState.data && modalState.data.id) {
      updateGoal(modalState.data.id, payload);
    } else {
      addGoal({ ...payload, patientId });
    }
  };

  return (
    <div className="space-y-8 animate-apple pb-20 h-full flex flex-col">
      <header className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-apple-text mb-0.5">Plan de Intervención</h2>
          <p className="description-small font-bold text-apple-text-secondary uppercase tracking-widest">Tablero Kanban de Metas (Tipo Asana)</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3 mr-4">
            <span className="text-[11px] font-bold tracking-widest text-apple-text uppercase">Avance Global:</span>
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-apple-bg border border-apple-separator/50 rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-apple-green rounded-full shadow-[0_0_8px_rgba(52,199,89,0.5)] transition-all duration-1000" style={{ width: `${globalProgress}%` }} />
              </div>
              <span className="text-[12px] font-black text-apple-green tabular-nums">{globalProgress}%</span>
            </div>
          </div>
          <button 
            onClick={() => setModalState({ isOpen: true, data: null })} 
            className="apple-button apple-button-primary flex items-center gap-2 px-6 py-2.5 text-[11px] uppercase tracking-widest font-bold"
          >
            <Plus className="w-4 h-4" strokeWidth={2} /> Nueva Meta
          </button>
        </div>
      </header>

      {/* Objetivo General Banner */}
      <div className="bg-apple-black rounded-[24px] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden shadow-apple-medium shrink-0">
        <div className="absolute top-0 right-0 w-64 h-64 bg-apple-blue/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shadow-lg backdrop-blur-md border border-white/10 shrink-0">
            <Flag className="text-white w-5 h-5" strokeWidth={2} />
          </div>
          <div>
            <div className="text-[10px] font-black tracking-widest text-apple-blue uppercase mb-1">Objetivo General SMART</div>
            <h3 className="text-[16px] font-bold tracking-tight text-white leading-tight">Impulsar la autorregulación y habilidades sociales</h3>
          </div>
        </div>
        <div className="flex items-center gap-4 text-white/80 relative z-10 w-full sm:w-auto">
          <div className="bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl flex-1 sm:flex-none">
            <div className="text-[9px] uppercase tracking-widest font-bold text-white/50 mb-0.5">Plazo</div>
            <div className="text-[12px] font-bold">6 meses (Oct 2026)</div>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto custom-scrollbar pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 mt-4">
        <div className="flex gap-4 sm:gap-6 h-full min-h-[500px]">
          
          <KanbanColumn 
            id="pending" 
            title="Por Hacer" 
            count={pendingGoals.length} 
            colorClass="bg-apple-text-tertiary"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onAdd={() => setModalState({ isOpen: true, data: { progress: 0 } })}
          >
            {pendingGoals.map(g => (
              <GoalTaskCard 
                key={g.id} goal={g} 
                onDragStart={handleDragStart} 
                onToggle={handleToggleAchieved}
                onClick={() => setModalState({ isOpen: true, data: g })}
                onDelete={handleDeleteGoal}
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
            onAdd={() => setModalState({ isOpen: true, data: { progress: 50 } })}
          >
            {inProgressGoals.map(g => (
              <GoalTaskCard 
                key={g.id} goal={g} 
                onDragStart={handleDragStart} 
                onToggle={handleToggleAchieved}
                onClick={() => setModalState({ isOpen: true, data: g })}
                onDelete={handleDeleteGoal}
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
            onAdd={() => setModalState({ isOpen: true, data: { progress: 100 } })}
          >
            {achievedGoals.map(g => (
              <GoalTaskCard 
                key={g.id} goal={g} 
                onDragStart={handleDragStart} 
                onToggle={handleToggleAchieved}
                onClick={() => setModalState({ isOpen: true, data: g })}
                onDelete={handleDeleteGoal}
              />
            ))}
          </KanbanColumn>

        </div>
      </div>

      <GoalModal 
        isOpen={modalState.isOpen} 
        onClose={() => setModalState({ isOpen: false, data: null })} 
        onSave={handleSaveGoal}
        initialData={modalState.data}
      />
    </div>
  );
}
