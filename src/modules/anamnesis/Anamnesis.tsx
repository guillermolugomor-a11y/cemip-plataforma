import React, { useState } from 'react';
import { 
  ClipboardList, 
  Stethoscope, 
  Activity, 
  School, 
  Save, 
  ChevronRight,
  Info,
  Users,
  BrainCircuit,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { cn } from '../../lib/utils';

// Constantes de las pestañas
const TABS = [
  { id: 'motivo', label: 'Motivo', icon: ClipboardList },
  { id: 'antecedentes', label: 'Antecedentes', icon: Stethoscope },
  { id: 'desarrollo', label: 'Desarrollo', icon: Activity },
  { id: 'escolar', label: 'Escolar', icon: School },
  { id: 'familiar', label: 'Familiar', icon: Users },
  { id: 'sensorial', label: 'Sensorial / Juego', icon: BrainCircuit },
];

const InputField = ({ label, placeholder, type = "text" }: any) => (
  <div className="space-y-2">
    <label className="text-[11px] font-bold tracking-widest text-apple-text-secondary uppercase px-1">{label}</label>
    <input 
      type={type} 
      placeholder={placeholder}
      className="w-full bg-apple-tertiary border border-apple-separator/50 rounded-lg py-3 px-4 text-[13px] font-medium text-apple-text focus:ring-1 focus:ring-apple-blue/30 transition-all outline-none placeholder:text-apple-text-tertiary"
    />
  </div>
);

const TextAreaField = ({ label, placeholder, rows = 4 }: any) => (
  <div className="space-y-2 col-span-1 md:col-span-2">
    <label className="text-[11px] font-bold tracking-widest text-apple-text-secondary uppercase px-1">{label}</label>
    <textarea 
      rows={rows}
      placeholder={placeholder}
      className="w-full bg-apple-tertiary border border-apple-separator/50 rounded-xl py-3 px-4 text-[13px] font-medium text-apple-text focus:ring-1 focus:ring-apple-blue/30 transition-all outline-none resize-none custom-scrollbar placeholder:text-apple-text-tertiary"
    />
  </div>
);

export default function Anamnesis({ patientId }: { patientId?: string }) {
  const [activeTab, setActiveTab] = useState(TABS[0].id);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const renderTabContent = () => {
    switch(activeTab) {
      case 'motivo':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-apple">
            <TextAreaField 
              label="Descripción del Motivo de Consulta" 
              placeholder="Describe detalladamente la razón por la cual acude a consulta, desde la perspectiva de los padres..." 
            />
            <InputField label="Referencia" placeholder="¿Quién lo refiere? (Colegio, Pediatra...)" />
            <InputField label="Fecha de Identificación" placeholder="¿Cuándo notaron el problema?" type="date" />
            <TextAreaField 
              label="Historia de Intervenciones Previas" 
              placeholder="¿Ha recibido terapia anteriormente? ¿Con qué resultados?" 
              rows={3}
            />
            <TextAreaField 
              label="Evaluaciones Psicométricas Previas" 
              placeholder="WISC, ADOS, Conners... Indique fecha y conclusión general si aplica." 
              rows={3}
            />
          </div>
        );
      case 'antecedentes':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-apple">
            <TextAreaField 
              label="Antecedentes Perinatales" 
              placeholder="Desarrollo del embarazo, semanas de gestación, tipo de parto, APGAR si se conoce..." 
            />
            <InputField label="Enfermedades Relevantes" placeholder="Epilepsia, asma, etc." />
            <InputField label="Medicación Actual" placeholder="Especificar dosis si aplica" />
            <TextAreaField 
              label="Antecedentes Heredofamiliares" 
              placeholder="Diagnósticos psiquiátricos o del desarrollo en la familia..." 
              rows={3}
            />
          </div>
        );
      case 'desarrollo':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-apple">
            <InputField label="Sostén cefálico (meses)" type="number" placeholder="Ej: 3" />
            <InputField label="Sedestación (meses)" type="number" placeholder="Ej: 6" />
            <InputField label="Marcha Indep. (meses)" type="number" placeholder="Ej: 12" />
            <InputField label="Control de esfínteres (meses)" type="number" placeholder="Ej: 24" />
            <InputField label="Balbuceo (meses)" type="number" placeholder="Ej: 6" />
            <InputField label="Primeras Palabras (meses)" type="number" placeholder="Ej: 12" />
            <TextAreaField 
              label="Observaciones Hitos del Desarrollo" 
              placeholder="Regresiones, demoras específicas..." 
            />
          </div>
        );
      case 'escolar':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-apple">
            <InputField label="Grado Escolar Actual" placeholder="Ej: 2do de Primaria" />
            <InputField label="Institución" placeholder="Nombre del colegio" />
            <TextAreaField 
              label="Adaptación Escolar y Conducta" 
              placeholder="Relación con pares, seguimiento de normas, participación..." 
            />
            <TextAreaField 
              label="Desempeño Académico" 
              placeholder="Materias de dificultad, métodos de aprendizaje que le favorecen..." 
            />
          </div>
        );
      case 'familiar':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-apple">
            <TextAreaField 
              label="Dinámica Familiar" 
              placeholder="¿Con quién vive el niño? Estilo de crianza (autoritario, permisivo...)" 
            />
            <InputField label="Ocupación Cuidador Principal" placeholder="..." />
            <InputField label="Horas al día con el menor" type="number" placeholder="Ej: 5" />
            <TextAreaField 
              label="Reglas y Límites en Casa" 
              placeholder="¿Cómo se maneja la disciplina? ¿Hay rutinas establecidas?" 
            />
          </div>
        );
      case 'sensorial':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-apple">
            <TextAreaField 
              label="Preferencias Sensoriales" 
              placeholder="Hipersensibilidad a ruidos, texturas de ropa, texturas de alimento, luces..." 
            />
            <TextAreaField 
              label="Patrones de Juego" 
              placeholder="¿Juego simbólico, alineación de objetos, juego solitario o interactivo?" 
            />
            <TextAreaField 
              label="Regulación Emocional" 
              placeholder="¿Cómo se calma cuando está alterado? Existencia de berrinches frecuentes..." 
            />
          </div>
        );
      default:
        return null;
    }
  };

  const activeTabData = TABS.find(t => t.id === activeTab);
  const ActiveIcon = activeTabData?.icon || HelpCircle;

  return (
    <div className="space-y-10 animate-apple pb-20 max-w-5xl mx-auto">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-apple-text mb-0.5">Anamnesis Clínica</h2>
          <p className="description-small font-bold text-apple-text-secondary uppercase tracking-widest">Historial, antecedentes y entorno</p>
        </div>
        <button 
          onClick={handleSave}
          className={cn(
            "apple-button flex items-center gap-2 px-6 py-2.5 text-[11px] uppercase tracking-widest font-bold transition-all",
            saved ? "bg-apple-green/10 text-apple-green border border-apple-green/20" : "apple-button-primary"
          )}
        >
          {saved ? <CheckCircle2 className="w-4 h-4" strokeWidth={2} /> : <Save className="w-4 h-4" strokeWidth={2} />}
          {saved ? "Guardado" : "Guardar Cambios"}
        </button>
      </header>
      
      {/* Tab Navigation Menu */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex justify-center items-center gap-2 px-5 py-2.5 rounded-full transition-all text-[11px] font-bold tracking-widest uppercase whitespace-nowrap border shrink-0",
                isActive 
                  ? "bg-apple-blue text-white shadow-sm border-apple-blue ring-2 ring-apple-blue/20" 
                  : "bg-apple-bg text-apple-text-secondary border-apple-separator/50 hover:border-apple-separator hover:bg-apple-secondary"
              )}
            >
              <tab.icon className="w-3.5 h-3.5" strokeWidth={isActive ? 2.5 : 2} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="bg-apple-bg border border-apple-separator rounded-apple p-8 sm:p-10 shadow-sm relative overflow-hidden min-h-[400px]">
         <div className="flex items-center gap-4 mb-8 pb-6 border-b border-apple-separator/50">
            <div className="w-12 h-12 bg-apple-blue/10 rounded-2xl flex items-center justify-center text-apple-blue shrink-0 shadow-sm">
               <ActiveIcon className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <div>
               <h3 className="text-[18px] font-bold tracking-tight text-apple-text leading-none mb-1">
                 {activeTabData?.label}
               </h3>
               <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-apple-text-secondary uppercase">
                 <span>Formulario en progreso</span>
               </div>
            </div>
         </div>

         {renderTabContent()}
      </div>

      <div className="bg-apple-secondary/50 border border-apple-blue/20 p-8 rounded-apple flex flex-col md:flex-row gap-6 items-start shadow-sm mt-8 relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-64 h-64 bg-apple-blue/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
         <div className="w-12 h-12 bg-apple-blue/10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-apple-blue/20 text-apple-blue group-hover:scale-105 transition-transform">
           <Info className="w-6 h-6" strokeWidth={1.5} />
         </div>
         <div className="relative z-10 pt-1">
           <h4 className="font-bold text-apple-blue text-[14px] leading-none mb-2">Importancia Clínica</h4>
           <p className="text-apple-text-secondary text-[13px] font-medium leading-relaxed max-w-3xl">
             Toda la información registrada fluirá inteligentemente como base para generar los futuros **Objetivos del Plan de Intervención** y como antecedente crucial para el Módulo de Evaluación Diagnóstica. Asegúrate de compilar información con gran nivel de detalle neuropsicológico.
           </p>
         </div>
      </div>
    </div>
  );
}
