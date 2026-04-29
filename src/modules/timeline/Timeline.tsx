import React, { useState } from 'react';
import { Clock, MessageSquare, User, Plus, MoreHorizontal, Calendar, X, Check, Stethoscope, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useClinicalStore } from '../clinical/ClinicalStore';

const NoteCard = ({ date, specialist, content, type }: any) => (
  <div className="flex gap-6 sm:gap-10 group relative">
    <div className="flex flex-col items-center">
      <div className="w-10 h-10 bg-apple-bg rounded-xl flex items-center justify-center border border-apple-separator/40 group-hover:bg-apple-blue group-hover:border-apple-blue shadow-apple-soft transition-all duration-500 z-10 shrink-0">
        <Clock className="w-4 h-4 text-apple-blue transition-colors group-hover:text-white" strokeWidth={2} />
      </div>
      <div className="w-[1px] flex-1 bg-apple-separator/30 my-2 group-last:bg-transparent" />
    </div>
    
    <div className="flex-1 pb-12">
      <div className="bg-apple-bg border border-apple-separator/30 p-6 sm:p-8 rounded-apple-xl shadow-apple-soft group-hover:shadow-apple-medium transition-all duration-500 border-l-4 border-l-transparent hover:border-l-apple-blue">
        <div className="flex justify-between items-start mb-5">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-apple-slate rounded-xl flex items-center justify-center border border-apple-separator/30">
              <User className="w-4 h-4 text-apple-text-tertiary" strokeWidth={1.5} />
            </div>
            <div>
              <div className="text-[14px] font-bold text-apple-black leading-tight tracking-tight">{specialist}</div>
              <div className="text-[10px] font-bold tracking-[0.1em] text-apple-text-tertiary uppercase mt-1 opacity-70 italic">{date}</div>
            </div>
          </div>
        </div>
        
        <p className="text-[14px] sm:text-[15px] text-apple-text-secondary leading-relaxed font-medium whitespace-pre-wrap">
          {content}
        </p>

        <div className="flex flex-wrap gap-2 mt-6">
          <span className="px-3 py-1 bg-apple-blue/5 text-apple-blue border border-apple-blue/10 rounded-lg text-[9px] font-bold tracking-widest uppercase">Canto Terapéutico</span>
          <span className="px-3 py-1 bg-apple-slate text-apple-text-tertiary border border-apple-separator/20 rounded-lg text-[9px] font-bold tracking-widest uppercase">Módulo 4</span>
        </div>
      </div>
    </div>
  </div>
);

const NewNoteModal = ({ isOpen, onClose, onSave, lastNoteContent }: any) => {
  const [content, setContent] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    if (!content.trim()) return;
    onSave(content);
    setContent('');
    onClose();
  };

  const applyTemplate = (type: string) => {
    switch(type) {
      case 'individual':
        setContent("OBJETIVO TRABAJADO:\n\nOBSERVACIONES CLÍNICAS:\n\nAVANCE / BARRERAS:\n\nPLAN PARA PRÓXIMA SESIÓN:");
        break;
      case 'grupo':
        setContent("DINÁMICA DE GRUPO:\n\nINTERACCIÓN CON PARES:\n\nPARTICIPACIÓN:\n");
        break;
      case 'padres':
        setContent("ACUERDOS CON FAMILIA:\n\nREPORTE DE CONDUCTA EN CASA:\n\nRECOMENDACIONES BRINDADAS:\n");
        break;
      case 'copy':
        if(lastNoteContent) setContent(lastNoteContent);
        break;
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 animate-apple">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-md transition-opacity" onClick={onClose} />
      
      <div className="bg-apple-bg w-full max-w-[700px] flex flex-col rounded-apple-xl shadow-apple-huge relative z-10 overflow-hidden border border-apple-separator/30">
        <div className="px-8 py-6 border-b border-apple-separator/30 flex items-center justify-between bg-apple-slate/30">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-apple-black rounded-xl flex items-center justify-center shadow-apple-medium">
                <Stethoscope className="text-white w-5 h-5" strokeWidth={2} />
             </div>
             <div>
               <h2 className="text-xl font-bold tracking-tight text-apple-black">Nueva Nota de Evolución</h2>
               <p className="text-[10px] font-bold uppercase tracking-[0.2em] mt-1 text-apple-blue">Seguimiento Clínico</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 text-apple-text-tertiary hover:text-apple-red rounded-full hover:bg-apple-red/5 transition-all">
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>

        <div className="p-8 space-y-6">
           <div className="flex flex-wrap items-center gap-2 p-4 bg-apple-slate rounded-2xl border border-apple-separator/20">
             <div className="text-[9px] font-bold text-apple-text-tertiary uppercase tracking-widest block w-full mb-2 opacity-50">Seleccionar Plantilla Estratégica:</div>
             <button onClick={() => applyTemplate('individual')} className="px-4 py-2 bg-apple-bg border border-apple-separator/30 rounded-xl text-[10px] font-bold text-apple-black hover:text-apple-blue hover:shadow-apple-soft transition-all">Individual</button>
             <button onClick={() => applyTemplate('grupo')} className="px-4 py-2 bg-apple-bg border border-apple-separator/30 rounded-xl text-[10px] font-bold text-apple-black hover:text-apple-blue hover:shadow-apple-soft transition-all">Grupo</button>
             <button onClick={() => applyTemplate('padres')} className="px-4 py-2 bg-apple-bg border border-apple-separator/30 rounded-xl text-[10px] font-bold text-apple-black hover:text-apple-blue hover:shadow-apple-soft transition-all">Padres</button>
             <div className="w-[1px] h-6 bg-apple-separator/30 mx-2 hidden md:block" />
             <button 
               onClick={() => applyTemplate('copy')}
               disabled={!lastNoteContent}
               className={cn("px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all shadow-apple-soft", 
                 lastNoteContent ? "bg-apple-blue/10 text-apple-blue hover:bg-apple-blue/20" : "bg-apple-slate text-apple-text-tertiary opacity-40 cursor-not-allowed")}
             >
               Duplicar Anterior
             </button>
           </div>

           <div className="space-y-3">
             <div className="flex items-center gap-2 px-1">
                <MessageSquare className="w-3.5 h-3.5 text-apple-blue" />
                <label className="text-[11px] font-bold text-apple-text-tertiary uppercase tracking-widest">Observaciones de Sesión</label>
             </div>
             <textarea 
               value={content}
               onChange={(e) => setContent(e.target.value)}
               placeholder="Registra los avances, comportamientos y objetivos trabajados en la sesión..."
               className="w-full h-56 bg-apple-slate border border-apple-separator/30 rounded-2xl py-5 px-6 text-[14px] font-medium text-apple-black focus:bg-apple-bg focus:ring-4 focus:ring-apple-blue/5 outline-none transition-all resize-none custom-scrollbar placeholder:text-apple-text-tertiary/50"
               autoFocus
             />
           </div>
        </div>

        <div className="px-8 py-6 flex gap-4 bg-apple-slate/20 border-t border-apple-separator/30">
            <button onClick={onClose} className="flex-1 px-8 py-3 text-[11px] font-bold tracking-widest uppercase text-apple-text-tertiary hover:text-apple-black transition-all">Descartar</button>
            <button 
              onClick={handleSave}
              disabled={!content.trim()}
              className={cn(
                "flex-2 apple-button-primary bg-apple-black shadow-apple-medium py-3 px-10 text-[11px] uppercase tracking-widest font-bold",
                !content.trim() && "opacity-50 cursor-not-allowed"
              )}
            >
              Guardar en Historial
            </button>
        </div>
      </div>
    </div>
  );
};

export default function Timeline({ patientId }: { patientId: string }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const allNotes = useClinicalStore(s => s.notes);
  const notes = allNotes.filter(n => n.patientId === patientId);

  const addNote = useClinicalStore(s => s.addNote);
  const deleteNote = useClinicalStore(s => s.deleteNote);

  const handleDeleteNote = (id: string) => {
    if (window.confirm("¿Seguro que deseas eliminar esta nota del historial?")) {
      deleteNote(id);
    }
  };

  const handleAddNote = (content: string) => {
    addNote({
      patientId,
      date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }),
      time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      type: 'Sesión',
      content,
      author: "Dr. Alejandro"
    });
  };

  return (
    <div className="space-y-10 animate-apple pb-24 max-w-5xl mx-auto px-4 sm:px-0">
      <header className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 border-b border-apple-separator/30 pb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-apple-blue" />
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-apple-text-tertiary">Historial Evolutivo</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-apple-black">Notas de Evolución</h2>
          <p className="text-[14px] font-medium text-apple-text-secondary mt-1">Crónica detallada del progreso clínico del paciente.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="apple-button-primary bg-apple-black/90 hover:bg-black shadow-apple-soft flex items-center gap-2 px-8"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} /> Nueva Nota
        </button>
      </header>

      <div className="flex flex-col mt-4">
        {notes.length === 0 ? (
          <div className="text-center py-32 bg-apple-bg/40 border border-dashed border-apple-separator/50 rounded-apple-xl">
             <MessageSquare className="w-12 h-12 text-apple-text-tertiary/20 mx-auto mb-4" />
             <p className="text-[15px] font-bold text-apple-black tracking-tight">Sin notas registradas</p>
             <p className="text-[13px] text-apple-text-tertiary mt-1">Comienza registrando la primera sesión terapéutica.</p>
          </div>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="relative group">
              <NoteCard date={note.date} specialist={note.author} content={note.content} type={note.type} />
              <button 
                onClick={() => handleDeleteNote(note.id)}
                className="absolute top-2 right-0 p-2 text-transparent group-hover:text-apple-red/30 hover:text-apple-red hover:bg-apple-red/5 transition-all rounded-lg"
                title="Eliminar"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
      
      {notes.length > 0 && (
        <div className="text-center pt-8">
          <button className="px-8 py-3 bg-apple-bg border border-apple-separator/30 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase text-apple-text-tertiary hover:text-apple-blue hover:shadow-apple-soft transition-all">
            Ver notas anteriores
          </button>
        </div>
      )}

      <NewNoteModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddNote}
        lastNoteContent={notes.length > 0 ? notes[0].content : null}
      />
    </div>
  );
}
