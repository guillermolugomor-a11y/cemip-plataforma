import React, { useState } from 'react';
import { FileOutput, PhoneCall, Mail, MessageCircle, Plus, CalendarDays, FileCheck, CheckCircle2, Settings2, Loader2, X, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useClinicalStore } from '../clinical/ClinicalStore';
import { jsPDF } from 'jspdf';

const LogCard = ({ date, type, entity, description, by }: any) => {
  const Icon = type === 'llamada' ? PhoneCall : type === 'email' ? Mail : MessageCircle;
  const iconColor = type === 'llamada' ? "text-apple-green" : type === 'email' ? "text-apple-blue" : "text-apple-orange";
  const bgIconColor = type === 'llamada' ? "bg-apple-green/10 border-apple-green/20" : type === 'email' ? "bg-apple-blue/10 border-apple-blue/20" : "bg-apple-orange/10 border-apple-orange/20";

  return (
    <div className="bg-apple-bg border border-apple-separator rounded-apple p-5 flex items-start gap-5 hover:shadow-apple-soft transition-all">
       <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border", bgIconColor, iconColor)}>
         <Icon className="w-4 h-4" strokeWidth={2} />
       </div>
       <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-bold text-[13px] text-apple-text">{entity}</h4>
            <span className="text-[10px] font-bold tracking-widest text-apple-text-tertiary uppercase">{date}</span>
          </div>
          <p className="text-[12px] font-medium text-apple-text-secondary leading-relaxed mb-3">
            {description}
          </p>
          <div className="text-[10px] font-bold tracking-widest uppercase text-apple-text-tertiary flex flex-col gap-1 sm:flex-row sm:gap-2">
            <span>REGISTRADO POR: {by}</span>
          </div>
       </div>
    </div>
  );
};

const NewLogModal = ({ isOpen, onClose, onSave }: any) => {
  const [form, setForm] = useState({ entity: '', description: '', type: 'llamada' });

  if (!isOpen) return null;

  const handleSave = () => {
    if (!form.entity || !form.description) return;
    onSave(form);
    setForm({ entity: '', description: '', type: 'llamada' });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-apple">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="bg-apple-bg w-full max-w-[500px] flex flex-col rounded-apple shadow-2xl relative z-10 overflow-hidden border border-apple-separator">
        <div className="px-8 py-6 border-b border-apple-separator flex items-center justify-between bg-apple-secondary/30 shrink-0">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-apple-orange/10 rounded-lg flex items-center justify-center">
                <MessageCircle className="text-apple-orange w-5 h-5" strokeWidth={1.5} />
             </div>
             <div>
               <h2 className="text-xl font-bold tracking-tight text-apple-text">Nueva Bitácora</h2>
               <p className="description-small uppercase tracking-widest mt-0.5 text-apple-orange font-bold">Contacto Clínico</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 text-apple-text-tertiary hover:text-apple-text rounded-full hover:bg-apple-bg transition-all">
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        <div className="p-8 space-y-5 overflow-y-auto">
           <div className="space-y-1.5">
             <label className="text-[10px] uppercase font-bold text-apple-text-tertiary ml-1 tracking-widest">Atención o Entidad</label>
             <input type="text" value={form.entity} onChange={e => setForm({...form, entity: e.target.value})} placeholder="Ej: Colegio Bilingüe Newton" className="w-full bg-apple-tertiary border border-apple-separator/50 rounded-xl py-3 px-4 text-[13px] font-medium text-apple-text focus:ring-1 focus:ring-apple-blue/30 outline-none" />
           </div>
           
           <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-apple-text-tertiary ml-1 tracking-widest">Vía de Contacto</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full bg-apple-tertiary border border-apple-separator/50 rounded-xl py-3 px-4 text-[13px] font-medium text-apple-text focus:ring-1 focus:ring-apple-blue/30 outline-none appearance-none">
                <option value="llamada">Llamada Telefónica</option>
                <option value="email">Correo Electrónico</option>
                <option value="reunion">Reunión Presencial / Virtual</option>
              </select>
           </div>

           <div className="space-y-1.5">
             <label className="text-[10px] uppercase font-bold text-apple-text-tertiary ml-1 tracking-widest">Descripción / Acuerdos</label>
             <textarea rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Resumen del contacto..." className="w-full bg-apple-tertiary border border-apple-separator/50 rounded-xl py-3 px-4 text-[13px] font-medium text-apple-text focus:ring-1 focus:ring-apple-blue/30 outline-none resize-none custom-scrollbar" />
           </div>
        </div>

        <div className="px-8 py-5 flex gap-4 bg-apple-bg border-t border-apple-separator shrink-0">
            <button onClick={onClose} className="flex-1 px-8 py-2.5 text-[11px] font-bold tracking-widest uppercase text-apple-text-secondary hover:text-apple-text transition-all">Cancelar</button>
            <button onClick={handleSave} disabled={!form.entity || !form.description} className="flex-1 apple-button bg-apple-blue text-white disabled:opacity-50 hover:bg-blue-600 py-3 text-[11px] uppercase tracking-widest font-bold flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Registrar
            </button>
        </div>
      </div>
    </div>
  );
};

export default function Reports({ patientId }: { patientId: string }) {
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const allLogs = useClinicalStore(s => s.logs);
  const logs = allLogs.filter(l => l.patientId === patientId);

  const addLog = useClinicalStore(s => s.addLog);
  const deleteLog = useClinicalStore(s => s.deleteLog);

  const handleDeleteLog = (id: string) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este registro de la bitácora?")) {
      deleteLog(id);
    }
  };

  const allGoals = useClinicalStore(s => s.goals);
  const goals = allGoals.filter(g => g.patientId === patientId);

  const allEvals = useClinicalStore(s => s.evaluations);
  const evals = allEvals.filter(e => e.patientId === patientId);

  const handleCompiler = () => {
    setIsGenerating(true);
    
    // Simulate compilation delay
    setTimeout(() => {
      const doc = new jsPDF();
      const margin = 20;
      let y = 20;

      // Header
      doc.setFontSize(18);
      doc.setTextColor(28, 28, 30); // Apple dark text
      doc.text('CEMIP - Informe de Seguimiento Clínico', margin, y);
      y += 10;
      
      doc.setFontSize(10);
      doc.setTextColor(142, 142, 147); // Secondary text
      doc.text(`Fecha de emisión: ${new Date().toLocaleDateString()}`, margin, y);
      y += 15;

      // Section: Evaluations
      doc.setFontSize(14);
      doc.setTextColor(0, 122, 255); // Apple Blue
      doc.text('1. Evaluaciones y Pruebas Aplicadas', margin, y);
      y += 8;
      
      doc.setFontSize(10);
      doc.setTextColor(28, 28, 30);
      evals.forEach(ev => {
        doc.setFont('helvetica', 'bold');
        doc.text(`• ${ev.title} (${ev.date})`, margin + 5, y);
        y += 5;
        doc.setFont('helvetica', 'normal');
        doc.text(`Resultado: ${ev.score || 'N/A'}`, margin + 10, y);
        y += 5;
        const conclusion = doc.splitTextToSize(`Conclusión: ${ev.conclusion}`, 160);
        doc.text(conclusion, margin + 10, y);
        y += conclusion.length * 5 + 5;
      });

      if (y > 250) { doc.addPage(); y = 20; }

      // Section: Goals
      doc.setFontSize(14);
      doc.setTextColor(0, 122, 255);
      doc.text('2. Objetivos y Plan de Intervención', margin, y);
      y += 8;

      goals.forEach(g => {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(28, 28, 30);
        doc.text(`• ${g.title}`, margin + 5, y);
        doc.setTextColor(g.progress === 100 ? 52 : 0, g.progress === 100 ? 199 : 122, g.progress === 100 ? 89 : 255);
        doc.text(`${g.progress}%`, margin + 140, y);
        y += 5;

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(142, 142, 147);
        doc.text(`Indicador: ${g.indicator}`, margin + 10, y);
        y += 7;
      });

      // Bitácora logic
      if (logs.length > 0) {
        if (y > 230) { doc.addPage(); y = 20; }
        doc.setFontSize(14);
        doc.setTextColor(0, 122, 255);
        doc.text('3. Bitácora de Contacto', margin, y);
        y += 8;

        logs.forEach(l => {
          doc.setFontSize(9);
          doc.setTextColor(28, 28, 30);
          doc.setFont('helvetica', 'bold');
          doc.text(`${l.date} - ${l.entity}`, margin + 5, y);
          y += 4;
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(142, 142, 147);
          const desc = doc.splitTextToSize(l.description, 160);
          doc.text(desc, margin + 10, y);
          y += desc.length * 4 + 4;
        });
      }

      doc.save(`Informe_CEMIP_${patientId}_${Date.now()}.pdf`);
      setIsGenerating(false);
    }, 1500);
  };

  const handleAddLog = (data: any) => {
    addLog({
      patientId,
      date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(),
      type: data.type,
      entity: data.entity,
      description: data.description,
      by: "Dr. Magno"
    });
  };

  return (
    <div className="space-y-10 animate-apple pb-20 max-w-5xl mx-auto">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-apple-text mb-0.5">Informes y Comunicaciones</h2>
          <p className="description-small font-bold text-apple-text-secondary uppercase tracking-widest">Generación automática y bitácora clínica</p>
        </div>
      </header>

      {/* Report Generator */}
      <div className="bg-apple-blue border border-apple-blue/20 rounded-[24px] p-8 sm:p-10 relative overflow-hidden shadow-lg shadow-apple-blue/20 group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-apple-bg/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none transition-all group-hover:scale-110" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 w-full">
           <div className="max-w-xl">
             <div className="w-12 h-12 bg-apple-bg/10 text-white rounded-2xl flex items-center justify-center border border-white/20 mb-6 backdrop-blur-md">
               <FileOutput className="w-6 h-6" strokeWidth={1.5} />
             </div>
             <h3 className="text-2xl font-bold text-white tracking-tight mb-2">Informe Clínico Trimestral</h3>
             <p className="text-white/80 text-[14px] font-medium leading-relaxed mb-6">
               El sistema de Auto-Compilado extrae automáticamente las metas SMART logradas, los resultados de la batería de evaluaciones y el gráfico de radar del Área de Desarrollo para construir el informe en formato institucional (PDF).
             </p>
             <div className="flex gap-4">
                <div className="flex items-center gap-2 text-white/90 text-[11px] font-bold uppercase tracking-widest bg-apple-bg/10 px-3 py-1.5 rounded-lg border border-white/20">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Metas Integradas
                </div>
                <div className="flex items-center gap-2 text-white/90 text-[11px] font-bold uppercase tracking-widest bg-apple-bg/10 px-3 py-1.5 rounded-lg border border-white/20">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Gráficos Listos
                </div>
             </div>
           </div>

           <div className="flex flex-col gap-3 w-full lg:w-auto shrink-0">
             <button onClick={handleCompiler} className="apple-button bg-apple-bg text-apple-blue hover:bg-apple-slate flex items-center justify-center gap-2 px-8 py-3.5 text-[12px] uppercase tracking-widest font-bold shadow-sm whitespace-nowrap w-full">
               {isGenerating ? <Loader2 className="w-4 h-4 animate-spin text-apple-blue" /> : <FileCheck className="w-4 h-4" />} 
               {isGenerating ? "Compilando PDF..." : "Autocompilar Informe"}
             </button>
             <button className="apple-button bg-apple-bg/10 text-white hover:bg-apple-bg/20 flex items-center justify-center gap-2 px-8 py-3.5 text-[12px] uppercase tracking-widest border border-white/30 font-bold whitespace-nowrap w-full">
               <Settings2 className="w-4 h-4" /> Personalizar Secciones
             </button>
           </div>
        </div>
      </div>

      {/* Communication Log */}
      <div className="bg-apple-secondary border border-apple-separator rounded-apple p-8 shadow-sm">
         <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-apple-tertiary rounded-xl border border-apple-separator flex items-center justify-center text-apple-text">
                <MessageCircle className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-[16px] font-bold text-apple-text tracking-tight">Bitácora Interdisciplinaria</h3>
                <p className="text-[10px] font-bold tracking-widest text-apple-text-tertiary uppercase mt-0.5">Control de contacto Escuela / Familia</p>
              </div>
            </div>
            <button onClick={() => setIsLogModalOpen(true)} className="apple-button apple-button-secondary bg-apple-bg flex items-center gap-2 px-4 py-2 text-[10px] uppercase tracking-widest font-bold shadow-sm">
               <Plus className="w-3.5 h-3.5" strokeWidth={2} /> 
               <span className="hidden sm:inline">Nuevo Registro</span>
            </button>
         </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {logs.map(log => (
              <div key={log.id} className="relative group">
                <LogCard {...log} />
                <button 
                  onClick={() => handleDeleteLog(log.id)}
                  className="absolute top-6 right-6 p-2 text-apple-text-tertiary hover:text-apple-red transition-all rounded-lg opacity-0 group-hover:opacity-100 bg-apple-bg shadow-sm border border-apple-separator/50"
                  title="Eliminar Registro"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
      </div>

      <NewLogModal 
        isOpen={isLogModalOpen} 
        onClose={() => setIsLogModalOpen(false)} 
        onSave={handleAddLog} 
      />
    </div>
  );
}
