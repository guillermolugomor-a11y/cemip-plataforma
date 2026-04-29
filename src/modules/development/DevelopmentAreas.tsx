import React, { useState } from 'react';
import { Activity, Brain, Users, MessageCircle, AlertCircle, Save, CheckCircle2, Timer } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { cn } from '../../lib/utils';

const AREAS = [
  { key: 'cognitivo', label: 'Cognitivo', icon: Brain, colorClass: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100' }, radarKey: 'Cognitivo' },
  { key: 'lenguaje', label: 'Lenguaje Expr. / Recep.', icon: MessageCircle, colorClass: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' }, radarKey: 'Lenguaje' },
  { key: 'social', label: 'Socialización y Juego', icon: Users, colorClass: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100' }, radarKey: 'Social' },
  { key: 'motor', label: 'Motor Fino / Grueso', icon: Activity, colorClass: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' }, radarKey: 'Motor' },
  { key: 'sensorial', label: 'Regulación Sensorial', icon: AlertCircle, colorClass: { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-100' }, radarKey: 'Sensorial' },
  { key: 'avd', label: 'Vida Diaria (AVD)', icon: Timer, colorClass: { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-100' }, radarKey: 'A.V.D.' },
];

export default function DevelopmentAreas({ patientId }: { patientId?: string }) {
  const [saved, setSaved] = useState(false);
  const [values, setValues] = useState<Record<string, number>>({
    cognitivo: 4, lenguaje: 2, social: 2, motor: 4, sensorial: 2, avd: 3
  });

  const radarData = AREAS.map(area => ({
    subject: area.radarKey,
    A: values[area.key],
    fullMark: 5
  }));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-8 animate-apple pb-20 max-w-6xl mx-auto">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-apple-text mb-0.5">Áreas de Desarrollo Clínico</h2>
          <p className="description-small font-bold text-apple-text-secondary uppercase tracking-widest">Mapeo Neuropsicológico (1 al 5)</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar */}
        <div className="bg-apple-bg border border-apple-separator rounded-2xl p-6 flex flex-col items-center shadow-sm relative overflow-hidden">
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-apple-blue/5 rounded-full blur-3xl" />

          <div className="w-full flex items-center justify-between mb-6 relative z-10">
            <div>
              <h3 className="text-[16px] font-bold text-apple-text">Diagrama Araña</h3>
              <p className="text-[11px] font-bold tracking-widest text-apple-text-secondary uppercase mt-0.5">Reactivo en tiempo real</p>
            </div>
            <div className="w-10 h-10 bg-apple-tertiary rounded-xl flex items-center justify-center border border-apple-separator">
              <Activity className="w-5 h-5 text-apple-text" strokeWidth={1.5} />
            </div>
          </div>

          <div className="w-full h-[320px] relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="72%" data={radarData}>
                <PolarGrid stroke="#E5E5EA" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#8E8E93', fontSize: 10, fontWeight: 'bold' }} />
                <PolarRadiusAxis angle={30} domain={[0, 5]} tick={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255,255,255,0.98)',
                    borderRadius: '12px',
                    border: '1px solid #E5E5EA',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.10)',
                    color: '#1C1C1E',
                    fontWeight: 'bold',
                    fontSize: '12px'
                  }}
                  itemStyle={{ color: '#007AFF' }}
                />
                <Radar name="Paciente" dataKey="A" stroke="#007AFF" strokeWidth={2.5} fill="#007AFF" fillOpacity={0.15} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sliders */}
        <div className="space-y-3">
          {AREAS.map(area => (
            <div key={area.key} className="bg-apple-bg border border-apple-separator rounded-2xl p-4 hover:shadow-sm transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border", area.colorClass.bg, area.colorClass.text, area.colorClass.border)}>
                    <area.icon className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <span className="text-[13px] font-bold text-apple-text">{area.label}</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-apple-bg border border-apple-separator flex items-center justify-center text-[13px] font-black tabular-nums text-apple-text">
                  {values[area.key]}
                </div>
              </div>

              <input
                type="range"
                min="1" max="5" step="1"
                value={values[area.key]}
                onChange={e => setValues(v => ({ ...v, [area.key]: Number(e.target.value) }))}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-[9px] font-bold tracking-widest text-apple-text-tertiary mt-1.5">
                <span>DEFICIENTE</span>
                <span>ÓPTIMO</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alert */}
      <div className="bg-apple-red/5 border border-apple-red/15 p-5 rounded-2xl flex items-start gap-4">
        <div className="p-2 bg-apple-bg rounded-lg shadow-sm shrink-0 mt-0.5 border border-apple-red/10">
          <AlertCircle className="w-5 h-5 text-apple-red" strokeWidth={2} />
        </div>
        <div>
          <h4 className="text-[13px] font-bold text-apple-red mb-1">Indicador de Alerta Sensorial/Social</h4>
          <p className="text-[13px] font-medium text-apple-text-secondary leading-relaxed">
            El desfase superior a 2 puntos entre el desarrollo Cognitivo/Motor y las áreas Sensorial/Social sugiere la necesidad de priorizar contención emocional y terapia integrativa.
          </p>
        </div>
      </div>
    </div>
  );
}
