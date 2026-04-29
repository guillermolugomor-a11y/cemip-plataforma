import React, { useState } from 'react';
import { 
  School, 
  UserCircle, 
  ClipboardCheck, 
  BookOpen, 
  PenTool, 
  Calculator, 
  Brain, 
  Users, 
  Zap, 
  Star,
  Save,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Phone,
  MessageCircle,
  Globe
} from 'lucide-react';
import { cn } from '../../lib/utils';

const VALORACION = [
  { val: 1, label: 'Por debajo de lo esperado', color: 'bg-apple-red' },
  { val: 2, label: 'En proceso de logro', color: 'bg-apple-orange' },
  { val: 3, label: 'Adecuado al grado escolar', color: 'bg-apple-green' }
];

interface RatingRowProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
}

const RatingRow = ({ label, value, onChange }: RatingRowProps) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between py-5 border-b border-apple-separator/20 group hover:bg-apple-slate/20 px-4 rounded-2xl transition-all duration-300">
    <span className="text-[14px] font-bold text-apple-text-secondary group-hover:text-apple-black transition-colors">{label}</span>
    <div className="flex gap-4 mt-3 sm:mt-0">
      {[1, 2, 3].map((v) => {
        const isActive = value === v;
        const color = VALORACION.find(item => item.val === v)?.color;
        return (
          <button
            key={v}
            onClick={() => onChange(v)}
            className={cn(
              "w-12 h-12 rounded-2xl border-2 flex flex-col items-center justify-center transition-all duration-500 relative overflow-hidden",
              isActive 
                ? `${color} border-transparent text-white shadow-apple-soft scale-110 z-10` 
                : "bg-apple-bg border-apple-separator/40 text-apple-text-tertiary hover:border-apple-blue/30 hover:bg-apple-slate/10"
            )}
          >
            <span className="text-[16px] font-black">{v}</span>
            {isActive && <div className="absolute inset-0 bg-apple-bg/10 animate-pulse pointer-events-none" />}
          </button>
        );
      })}
    </div>
  </div>
);

const SectionHeader = ({ icon: Icon, title, subtitle, color = "bg-apple-blue" }: any) => (
  <div className="flex items-center gap-5 mb-8 pb-4 border-b border-apple-separator/30">
    <div className={cn("w-12 h-12 rounded-[18px] flex items-center justify-center text-white shrink-0 shadow-lg", color)}>
      <Icon className="w-6 h-6" strokeWidth={2} />
    </div>
    <div>
      <h3 className="text-[18px] font-black tracking-tight text-apple-text leading-none mb-1.5">{title}</h3>
      <p className="text-[11px] font-black uppercase tracking-[0.15em] text-apple-text-tertiary">{subtitle}</p>
    </div>
  </div>
);

export default function SchoolFollowUp({ patient }: { patient: any }) {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    fecha: new Date().toISOString().split('T')[0],
    grade: patient?.schoolGrade || '',
    group: patient?.schoolGroup || '',
    school: patient?.schoolName || '',

    respondentName: '',
    respondentRole: '',
    respondentTimeKnown: '',
    respondentSubjects: '',
    
    lectura_acorde: 0, lectura_fluida: 0, lectura_comprende: 0, lectura_explica: 0, lectura_obs: '',
    escritura_acorde: 0, escritura_legible: 0, escritura_ideas: 0, escritura_ortografia: 0, escritura_obs: '',
    mates_acorde: 0, mates_problemas: 0, mates_razonamiento: 0, mates_autonomo: 0, mates_obs: '',
    cog_atencion: 0, cog_instrucciones: 0, cog_memoria: 0, cog_autonomia: 0, cog_obs: '',
    soc_companeros: 0, soc_normas: 0, soc_grupo: 0, soc_obs: '',
    cond_indicaciones: 0, cond_lugar: 0, cond_impulsos: 0, cond_disruptivas: 0, cond_obs: '',
    est_apoyo_visual: false, est_paso_paso: false, est_repeticion: false, est_trabajo_guiado: false, est_material_concreto: false, est_refuerzo_positivo: false, est_otras: '',
    fortalezas: ''
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateField = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-12 animate-apple pb-32 max-w-5xl mx-auto">
      
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-apple-black to-[#2C2C2E] p-8 sm:p-12 shadow-apple-huge border border-white/5">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-apple-blue/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-apple-bg rounded-3xl flex items-center justify-center p-3 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
               <img src="https://i.postimg.cc/k47tV18T/CEMIP-LOGO.png" alt="CEMIP" className="w-full h-full object-contain" onError={(e: any) => e.target.src = 'https://placehold.co/100x100?text=CEMIP'} />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tighter mb-2">Seguimiento Escolar</h1>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-apple-blue/20 text-apple-blue text-[11px] font-black uppercase tracking-widest rounded-lg border border-apple-blue/30">Formato Oficial</span>
                <span className="text-white/40 text-[11px] font-bold uppercase tracking-widest">Observación Docente</span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={handleSave}
            className={cn(
              "h-16 px-10 rounded-2xl flex items-center gap-4 text-[14px] font-black uppercase tracking-widest transition-all duration-500 shadow-apple-soft active:scale-[0.98]",
              saved ? "bg-apple-green text-white" : "bg-apple-bg text-apple-black hover:bg-apple-blue hover:text-white"
            )}
          >
            {saved ? <CheckCircle2 className="w-6 h-6" /> : <Save className="w-6 h-6" />}
            {saved ? "Guardado" : "Guardar Registro"}
          </button>
        </div>
      </div>

      {/* Legend Card */}
      <div className="bg-apple-bg/70 backdrop-blur-xl border border-apple-separator/50 rounded-[28px] p-8 flex flex-wrap gap-8 items-center shadow-apple-soft justify-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-apple-blue/5 rounded-xl flex items-center justify-center text-apple-blue">
            <AlertCircle className="w-5 h-5" />
          </div>
          <span className="text-[13px] font-black uppercase tracking-widest text-apple-text">Escala de Valoración</span>
        </div>
        <div className="flex flex-wrap gap-6">
          {VALORACION.map(v => (
            <div key={v.val} className="flex items-center gap-3 group">
              <span className={cn("w-8 h-8 rounded-xl flex items-center justify-center text-[14px] font-black text-white shadow-sm transition-transform group-hover:scale-110", v.color)}>{v.val}</span>
              <span className="text-[12px] font-black text-apple-text-secondary uppercase tracking-tight opacity-70">{v.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-12">
        
        {/* DATOS GENERALES */}
        <div className="glass-effect rounded-[32px] p-10 shadow-apple-medium border border-apple-separator/30 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-apple-blue/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <SectionHeader icon={ClipboardCheck} title="Datos Generales" subtitle="Información del Alumno" color="bg-apple-blue" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-2">
              <label className="text-[11px] font-black uppercase tracking-[0.15em] text-apple-text-tertiary px-1">Nombre del Alumno</label>
              <div className="w-full bg-apple-slate/40 border border-apple-separator/20 rounded-[20px] py-4 px-6 text-[16px] font-black text-apple-text flex items-center gap-3">
                <UserCircle className="w-5 h-5 text-apple-blue/50" />
                {patient?.name}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-[0.15em] text-apple-text-tertiary px-1">Edad</label>
              <div className="w-full bg-apple-slate/40 border border-apple-separator/20 rounded-[20px] py-4 px-6 text-[16px] font-black text-apple-text">
                {patient?.age} años
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-[0.15em] text-apple-text-tertiary px-1">Grado</label>
              <input type="text" value={form.grade} onChange={e => updateField('grade', e.target.value)}
                className="w-full bg-apple-bg border border-apple-separator/40 rounded-[20px] py-4 px-6 text-[15px] font-bold outline-none focus:border-apple-blue focus:ring-4 focus:ring-apple-blue/5 transition-all" placeholder="Ej: 2do Primaria" />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-[0.15em] text-apple-text-tertiary px-1">Grupo</label>
              <input type="text" value={form.group} onChange={e => updateField('group', e.target.value)}
                className="w-full bg-apple-bg border border-apple-separator/40 rounded-[20px] py-4 px-6 text-[15px] font-bold outline-none focus:border-apple-blue focus:ring-4 focus:ring-apple-blue/5 transition-all" placeholder="Ej: B" />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-[0.15em] text-apple-text-tertiary px-1">Escuela</label>
              <input type="text" value={form.school} onChange={e => updateField('school', e.target.value)}
                className="w-full bg-apple-bg border border-apple-separator/40 rounded-[20px] py-4 px-6 text-[15px] font-bold outline-none focus:border-apple-blue focus:ring-4 focus:ring-apple-blue/5 transition-all" placeholder="Nombre del colegio" />
            </div>
            <div className="md:col-span-3 space-y-2">
              <label className="text-[11px] font-black uppercase tracking-[0.15em] text-apple-text-tertiary px-1">Fecha de Registro</label>
              <input type="date" value={form.fecha} onChange={e => updateField('fecha', e.target.value)}
                className="w-full bg-apple-bg border border-apple-separator/40 rounded-[20px] py-4 px-6 text-[15px] font-bold outline-none focus:border-apple-blue focus:ring-4 focus:ring-apple-blue/5 transition-all" />
            </div>
          </div>
        </div>

        {/* DATOS DE QUIEN RESPONDE */}
        <div className="glass-effect rounded-[32px] p-10 shadow-apple-medium border border-apple-separator/30">
          <SectionHeader icon={UserCircle} title="Datos del Informante" subtitle="Quien responde el formato" color="bg-apple-purple" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-[0.15em] text-apple-text-tertiary px-1">Nombre Completo</label>
              <input type="text" value={form.respondentName} onChange={e => updateField('respondentName', e.target.value)}
                className="w-full bg-apple-bg border border-apple-separator/40 rounded-[20px] py-4 px-6 text-[15px] font-bold outline-none focus:border-apple-purple focus:ring-4 focus:ring-apple-purple/5 transition-all" placeholder="Ej: Prof. María Pérez" />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-[0.15em] text-apple-text-tertiary px-1">Cargo</label>
              <input type="text" value={form.respondentRole} onChange={e => updateField('respondentRole', e.target.value)}
                className="w-full bg-apple-bg border border-apple-separator/40 rounded-[20px] py-4 px-6 text-[15px] font-bold outline-none focus:border-apple-purple focus:ring-4 focus:ring-apple-purple/5 transition-all" placeholder="Ej: Titular de Grupo" />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-[0.15em] text-apple-text-tertiary px-1">Tiempo de conocer al alumno</label>
              <input type="text" value={form.respondentTimeKnown} onChange={e => updateField('respondentTimeKnown', e.target.value)}
                className="w-full bg-apple-bg border border-apple-separator/40 rounded-[20px] py-4 px-6 text-[15px] font-bold outline-none focus:border-apple-purple focus:ring-4 focus:ring-apple-purple/5 transition-all" placeholder="Ej: 6 meses" />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-[0.15em] text-apple-text-tertiary px-1">Asignaturas que imparte</label>
              <input type="text" value={form.respondentSubjects} onChange={e => updateField('respondentSubjects', e.target.value)}
                className="w-full bg-apple-bg border border-apple-separator/40 rounded-[20px] py-4 px-6 text-[15px] font-bold outline-none focus:border-apple-purple focus:ring-4 focus:ring-apple-purple/5 transition-all" placeholder="Ej: Español y Matemáticas" />
            </div>
          </div>
        </div>

        {/* LECTURA, ESCRITURA, MATES */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* LECTURA */}
            <div className="glass-effect rounded-[32px] p-10 shadow-apple-medium border border-apple-separator/30">
                <SectionHeader icon={BookOpen} title="Lectura" subtitle="Habilidades Lectoras" color="bg-apple-red" />
                <div className="space-y-3">
                    <RatingRow label="Lee acorde a su edad y grado" value={form.lectura_acorde} onChange={v => updateField('lectura_acorde', v)} />
                    <RatingRow label="Lectura fluida" value={form.lectura_fluida} onChange={v => updateField('lectura_fluida', v)} />
                    <RatingRow label="Comprende lo que lee" value={form.lectura_comprende} onChange={v => updateField('lectura_comprende', v)} />
                    <RatingRow label="Explica lo leído" value={form.lectura_explica} onChange={v => updateField('lectura_explica', v)} />
                </div>
                <textarea rows={3} value={form.lectura_obs} onChange={e => updateField('lectura_obs', e.target.value)}
                    className="mt-8 w-full bg-apple-slate/30 border border-apple-separator/20 rounded-[20px] py-4 px-6 text-[14px] font-medium outline-none focus:bg-apple-bg focus:ring-4 focus:ring-apple-red/5 transition-all resize-none" placeholder="Observaciones de lectura..." />
            </div>

            {/* ESCRITURA */}
            <div className="glass-effect rounded-[32px] p-10 shadow-apple-medium border border-apple-separator/30">
                <SectionHeader icon={PenTool} title="Escritura" subtitle="Habilidades Grafomotoras" color="bg-apple-orange" />
                <div className="space-y-3">
                    <RatingRow label="Escribe acorde a su grado" value={form.escritura_acorde} onChange={v => updateField('escritura_acorde', v)} />
                    <RatingRow label="Escritura legible" value={form.escritura_legible} onChange={v => updateField('escritura_legible', v)} />
                    <RatingRow label="Organiza ideas" value={form.escritura_ideas} onChange={v => updateField('escritura_ideas', v)} />
                    <RatingRow label="Ortografía adecuada" value={form.escritura_ortografia} onChange={v => updateField('escritura_ortografia', v)} />
                </div>
                <textarea rows={3} value={form.escritura_obs} onChange={e => updateField('escritura_obs', e.target.value)}
                    className="mt-8 w-full bg-apple-slate/30 border border-apple-separator/20 rounded-[20px] py-4 px-6 text-[14px] font-medium outline-none focus:bg-apple-bg focus:ring-4 focus:ring-apple-orange/5 transition-all resize-none" placeholder="Observaciones de escritura..." />
            </div>

            {/* MATEMÁTICAS */}
            <div className="glass-effect rounded-[32px] p-10 shadow-apple-medium border border-apple-separator/30">
                <SectionHeader icon={Calculator} title="Matemáticas" subtitle="Razonamiento Lógico" color="bg-apple-green" />
                <div className="space-y-3">
                    <RatingRow label="Operaciones acorde al grado" value={form.mates_acorde} onChange={v => updateField('mates_acorde', v)} />
                    <RatingRow label="Comprende problemas" value={form.mates_problemas} onChange={v => updateField('mates_problemas', v)} />
                    <RatingRow label="Razonamiento lógico" value={form.mates_razonamiento} onChange={v => updateField('mates_razonamiento', v)} />
                    <RatingRow label="Trabajo autónomo" value={form.mates_autonomo} onChange={v => updateField('mates_autonomo', v)} />
                </div>
                <textarea rows={3} value={form.mates_obs} onChange={e => updateField('mates_obs', e.target.value)}
                    className="mt-8 w-full bg-apple-slate/30 border border-apple-separator/20 rounded-[20px] py-4 px-6 text-[14px] font-medium outline-none focus:bg-apple-bg focus:ring-4 focus:ring-apple-green/5 transition-all resize-none" placeholder="Observaciones de matemáticas..." />
            </div>

            {/* ÁREA COGNITIVA */}
            <div className="glass-effect rounded-[32px] p-10 shadow-apple-medium border border-apple-separator/30">
                <SectionHeader icon={Brain} title="Área Cognitiva" subtitle="Funciones Ejecutivas" color="bg-apple-blue" />
                <div className="space-y-3">
                    <RatingRow label="Atención" value={form.cog_atencion} onChange={v => updateField('cog_atencion', v)} />
                    <RatingRow label="Comprende instrucciones" value={form.cog_instrucciones} onChange={v => updateField('cog_instrucciones', v)} />
                    <RatingRow label="Memoria" value={form.cog_memoria} onChange={v => updateField('cog_memoria', v)} />
                    <RatingRow label="Autonomía" value={form.cog_autonomia} onChange={v => updateField('cog_autonomia', v)} />
                </div>
                <textarea rows={3} value={form.cog_obs} onChange={e => updateField('cog_obs', e.target.value)}
                    className="mt-8 w-full bg-apple-slate/30 border border-apple-separator/20 rounded-[20px] py-4 px-6 text-[14px] font-medium outline-none focus:bg-apple-bg focus:ring-4 focus:ring-apple-blue/5 transition-all resize-none" placeholder="Observaciones cognitivas..." />
            </div>
        </div>

        {/* ÁREA SOCIAL Y CONDUCTUAL */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="glass-effect rounded-[32px] p-10 shadow-apple-medium border border-apple-separator/30">
            <SectionHeader icon={Users} title="Área Social" subtitle="Interacción Social" color="bg-teal-500" />
            <div className="space-y-3">
              <RatingRow label="Relación con compañeros" value={form.soc_companeros} onChange={v => updateField('soc_companeros', v)} />
              <RatingRow label="Respeta normas" value={form.soc_normas} onChange={v => updateField('soc_normas', v)} />
              <RatingRow label="Participa en grupo" value={form.soc_grupo} onChange={v => updateField('soc_grupo', v)} />
            </div>
          </div>
          <div className="glass-effect rounded-[32px] p-10 shadow-apple-medium border border-apple-separator/30">
            <SectionHeader icon={ClipboardCheck} title="Área Conductual" subtitle="Conducta en Aula" color="bg-rose-500" />
            <div className="space-y-3">
              <RatingRow label="Sigue indicaciones" value={form.cond_indicaciones} onChange={v => updateField('cond_indicaciones', v)} />
              <RatingRow label="Permanecer en su lugar" value={form.cond_lugar} onChange={v => updateField('cond_lugar', v)} />
              <RatingRow label="Control de impulsos" value={form.cond_impulsos} onChange={v => updateField('cond_impulsos', v)} />
              <RatingRow label="Evitar conductas disruptivas" value={form.cond_disruptivas} onChange={v => updateField('cond_disruptivas', v)} />
            </div>
          </div>
        </div>

        {/* ESTRATEGIAS Y FORTALEZAS */}
        <div className="bg-apple-black text-apple-bg rounded-[40px] p-10 sm:p-14 shadow-apple-huge border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-apple-blue/20 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />
          
          <SectionHeader icon={Zap} title="Estrategias de Intervención" subtitle="Metodologías Sugeridas" color="bg-apple-blue" />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
            {[
              { id: 'est_apoyo_visual', label: 'Apoyo visual' },
              { id: 'est_paso_paso', label: 'Paso a paso' },
              { id: 'est_repeticion', label: 'Repetición' },
              { id: 'est_trabajo_guiado', label: 'Trabajo guiado' },
              { id: 'est_material_concreto', label: 'Material concreto' },
              { id: 'est_refuerzo_positivo', label: 'Refuerzo positivo' },
            ].map((est) => (
              <label key={est.id} className="flex items-center gap-4 p-5 bg-apple-bg/5 border border-white/10 rounded-2xl cursor-pointer hover:bg-apple-bg/15 hover:border-white/20 transition-all duration-300">
                <input type="checkbox" checked={(form as any)[est.id]} onChange={e => updateField(est.id, e.target.checked)}
                  className="w-5 h-5 rounded-lg accent-apple-blue border-white/30 bg-transparent" />
                <span className="text-[14px] font-bold text-white/90">{est.label}</span>
              </label>
            ))}
          </div>

          <div className="space-y-10 relative z-10">
            <div className="space-y-3">
              <label className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40 px-1">Otras estrategias específicas</label>
              <textarea rows={2} value={form.est_otras} onChange={e => updateField('est_otras', e.target.value)}
                className="w-full bg-apple-bg/5 border border-white/10 rounded-[24px] py-5 px-7 text-[15px] font-medium outline-none focus:border-apple-blue/50 focus:bg-apple-bg/10 transition-all text-white placeholder:text-white/20" placeholder="Escribe aquí otras herramientas..." />
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-apple-blue rounded-xl flex items-center justify-center text-white shadow-lg">
                  <Star className="w-5 h-5" fill="currentColor" />
                </div>
                <label className="text-[14px] font-black uppercase tracking-[0.1em] text-white">Fortalezas Detectadas</label>
              </div>
              <textarea rows={4} value={form.fortalezas} onChange={e => updateField('fortalezas', e.target.value)}
                className="w-full bg-apple-bg/5 border border-white/10 rounded-[28px] py-6 px-8 text-[16px] font-medium outline-none focus:border-apple-blue/50 focus:bg-apple-bg/10 transition-all text-white placeholder:text-white/20" 
                placeholder="Describe las áreas de brillantez y potencial del alumno..." />
            </div>
          </div>
        </div>

        {/* Branding Footer Mockup */}
        <div className="bg-apple-bg border border-apple-separator/50 rounded-[40px] p-12 shadow-apple-soft flex flex-col md:flex-row items-center justify-between gap-10 opacity-70 grayscale hover:grayscale-0 transition-all duration-700">
            <div className="flex flex-col items-center md:items-start gap-4">
               <img src="https://i.postimg.cc/k47tV18T/CEMIP-LOGO.png" alt="CEMIP" className="h-10 object-contain opacity-40" />
               <div className="flex gap-4">
                  <div className="w-10 h-10 bg-apple-slate rounded-full flex items-center justify-center text-apple-text-tertiary"><Globe className="w-4 h-4" /></div>
                  <div className="w-10 h-10 bg-apple-slate rounded-full flex items-center justify-center text-apple-text-tertiary"><MessageCircle className="w-4 h-4" /></div>
               </div>
            </div>
            <div className="flex flex-col md:flex-row gap-10 text-center md:text-left">
               <div className="space-y-1.5">
                  <div className="flex items-center gap-2 justify-center md:justify-start text-apple-blue"><MapPin className="w-3.5 h-3.5" /> <span className="text-[10px] font-black uppercase tracking-widest">Ubicación</span></div>
                  <p className="text-[11px] font-bold text-apple-text-tertiary leading-tight">Gobernador de Jalisco 78,<br />Lomas del Mirador, Cuernavaca.</p>
               </div>
               <div className="space-y-1.5">
                  <div className="flex items-center gap-2 justify-center md:justify-start text-apple-blue"><Phone className="w-3.5 h-3.5" /> <span className="text-[10px] font-black uppercase tracking-widest">Contacto</span></div>
                  <p className="text-[11px] font-black text-apple-text-tertiary">(777) 787 6994</p>
               </div>
            </div>
            <div className="text-[10px] font-black text-apple-text-tertiary/40 uppercase tracking-[0.2em] [writing-mode:vertical-lr] hidden lg:block">CEMIP CLINIQUE 2026</div>
        </div>

      </div>
    </div>
  );
}
