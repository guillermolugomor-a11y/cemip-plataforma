import React, { useState } from 'react';
import { FileSignature, FileText, Plus, X, CheckCircle2, AlertCircle, FileOutput, Loader2, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useClinicalStore } from '../clinical/ClinicalStore';

const TEST_TYPES = [
  { id: 'wisc', name: 'WISC-V (Wechsler Intelligence Scale)' },
  { id: 'ados', name: 'ADOS-2 (Autism Diagnostic Observation)' },
  { id: 'cars', name: 'CARS-2 (Childhood Autism Rating)' },
  { id: 'peabody', name: 'Peabody (Motor Development)' },
  { id: 'conners', name: 'Conners-3 (TDAH)' },
  { id: 'otro', name: 'Otra Evaluación Libre' }
];

const EvaluationCard = ({ title, date, score, conclusion, status }: any) => (
  <div className="bg-apple-secondary border border-apple-separator rounded-apple p-6 sm:p-8 flex flex-col gap-4 relative overflow-hidden group hover:shadow-apple-soft transition-all cursor-pointer">
     <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="text-[10px] font-bold text-apple-blue uppercase tracking-widest bg-apple-bg border border-apple-separator px-3 py-1.5 rounded-lg shadow-sm">Ver Detalle</button>
     </div>
     <div className="flex items-center gap-4 mb-2">
        <div className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border shadow-sm",
          status === 'completed' ? "bg-apple-bg text-apple-text border-apple-separator" : "bg-apple-blue/10 text-apple-blue border-apple-blue/20"
        )}>
          {status === 'completed' ? <FileSignature className="w-5 h-5" strokeWidth={1.5} /> : <AlertCircle className="w-5 h-5" strokeWidth={1.5} />}
        </div>
        <div>
           <h3 className="text-[15px] font-bold text-apple-text leading-tight">{title}</h3>
           <div className="text-[10px] font-bold tracking-widest text-apple-text-secondary uppercase mt-0.5">{date}</div>
        </div>
     </div>

     {score && (
        <div className="inline-block self-start px-3 py-1.5 bg-apple-bg border border-apple-separator rounded-lg text-[11px] font-bold text-apple-text tabular-nums shadow-sm mb-1">
          Puntuación / Percentil: {score}
        </div>
     )}

     <p className="text-[13px] font-medium text-apple-text-secondary leading-relaxed line-clamp-3">
       {conclusion}
     </p>
  </div>
);

// ── Modal de Añadir Test ──────────────────────────────────────────
const AddTestModal = ({ isOpen, onClose, onSave }: any) => {
  const [form, setForm] = useState({ instrument: '', score: '', conclusion: '' });

  if (!isOpen) return null;

  const handleSave = () => {
    if (!form.instrument || !form.conclusion) return;
    onSave(form);
    setForm({ instrument: '', score: '', conclusion: '' });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-apple">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="bg-apple-bg w-full max-w-[520px] flex flex-col rounded-apple shadow-2xl relative z-10 overflow-hidden border border-apple-separator">
        {/* Header */}
        <div className="px-8 py-6 border-b border-apple-separator flex items-center justify-between bg-apple-secondary/30 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-apple-blue/10 rounded-xl flex items-center justify-center">
              <FileText className="text-apple-blue w-5 h-5" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-apple-text">Añadir Evaluación</h2>
              <p className="text-[10px] uppercase tracking-widest mt-0.5 text-apple-blue font-bold">Batería Psicométrica</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-apple-text-tertiary hover:text-apple-text rounded-full hover:bg-apple-bg transition-all">
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 space-y-5 overflow-y-auto">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest font-bold text-apple-text-tertiary ml-1">Instrumento</label>
            <select
              value={form.instrument}
              onChange={(e) => setForm({ ...form, instrument: e.target.value })}
              className="w-full bg-apple-tertiary border border-apple-separator/50 rounded-xl px-4 py-3 text-[13px] font-medium text-apple-text focus:ring-1 focus:ring-apple-blue/30 outline-none appearance-none"
            >
              <option value="">Seleccione el test...</option>
              {TEST_TYPES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest font-bold text-apple-text-tertiary ml-1">Puntuación / Percentil <span className="text-apple-text-tertiary normal-case font-medium">(opcional)</span></label>
            <input
              type="text"
              value={form.score}
              onChange={(e) => setForm({ ...form, score: e.target.value })}
              placeholder="Ej: CIT 105 (Rango Promedio)"
              className="w-full bg-apple-tertiary border border-apple-separator/50 rounded-xl px-4 py-3 text-[13px] font-medium text-apple-text focus:ring-1 focus:ring-apple-blue/30 outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest font-bold text-apple-text-tertiary ml-1">Conclusión Clínica</label>
            <textarea
              rows={5}
              value={form.conclusion}
              onChange={(e) => setForm({ ...form, conclusion: e.target.value })}
              placeholder="Describe los hallazgos principales del instrumento aplicado..."
              className="w-full bg-apple-tertiary border border-apple-separator/50 rounded-xl px-4 py-3 text-[13px] font-medium text-apple-text focus:ring-1 focus:ring-apple-blue/30 outline-none resize-none custom-scrollbar"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 flex gap-4 bg-apple-bg border-t border-apple-separator shrink-0">
          <button onClick={onClose} className="flex-1 py-2.5 text-[11px] font-bold tracking-widest uppercase text-apple-text-secondary hover:text-apple-text transition-all">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!form.instrument || !form.conclusion}
            className="flex-1 apple-button bg-apple-blue text-white disabled:opacity-40 hover:bg-blue-600 py-3 text-[11px] uppercase tracking-widest font-bold flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" strokeWidth={2} /> Registrar Evaluación
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Componente Principal ──────────────────────────────────────────
export default function Evaluations({ patientId }: { patientId: string }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const allEvaluations = useClinicalStore(s => s.evaluations);
  const evaluations = allEvaluations.filter(e => e.patientId === patientId);

  const addEvaluation = useClinicalStore(s => s.addEvaluation);
  const deleteEvaluation = useClinicalStore(s => s.deleteEvaluation);

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar la evaluación "${title}"? esta acción no se puede deshacer.`)) {
      deleteEvaluation(id);
    }
  };

  const handleAddEval = (data: any) => {
    const testDef = TEST_TYPES.find(t => t.id === data.instrument);
    addEvaluation({
      patientId,
      title: testDef?.name || 'Evaluación Clínica',
      date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(),
      score: data.score || null,
      status: 'completed',
      conclusion: data.conclusion
    });
  };

  const handleGeneratePDF = () => {
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 2000);
  };

  return (
    <div className="space-y-10 animate-apple pb-20 max-w-6xl mx-auto">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-apple-text mb-0.5">Evaluaciones y Diagnóstico</h2>
          <p className="description-small font-bold text-apple-text-secondary uppercase tracking-widest">Batería Psicométrica y Clínica</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleGeneratePDF}
            className="apple-button bg-apple-blue/10 text-apple-blue hover:bg-apple-blue/20 flex items-center gap-2 px-5 py-2.5 text-[11px] uppercase tracking-widest font-bold w-36 justify-center"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileOutput className="w-4 h-4" strokeWidth={2} />}
            {isGenerating ? "Generando..." : "Informe PDF"}
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="apple-button apple-button-primary flex items-center gap-2 px-6 py-2.5 text-[11px] uppercase tracking-widest font-bold"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            Añadir Test
          </button>
        </div>
      </header>

      {/* Cards Grid */}
      {evaluations.length === 0 ? (
        <div className="py-24 flex flex-col items-center text-center text-apple-text-tertiary gap-4">
          <FileSignature className="w-10 h-10 opacity-30" />
          <p className="text-[13px] font-medium">No hay evaluaciones registradas.<br />Presiona <strong>Añadir Test</strong> para comenzar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {evaluations.map(ev => (
            <EvaluationCard key={ev.id} {...ev} />
          ))}
        </div>
      )}

      <AddTestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddEval}
      />
    </div>
  );
}
