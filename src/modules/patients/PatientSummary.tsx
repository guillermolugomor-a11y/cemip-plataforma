import React from 'react';
import { Calendar, TrendingUp, Clock, Target, AlertCircle, ChevronRight, Activity, Stethoscope, FileText, FileSignature, School } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { useAgendaStore } from '../agenda/AgendaStore';
import { useSpecialistStore } from '../specialists/SpecialistStore';
import { useClinicalStore } from '../clinical/ClinicalStore';
import { calculateAge, formatTime } from '../../lib/dateUtils';

const mockProgressData = [
  { month: 'Ene', score: 35 },
  { month: 'Feb', score: 45 },
  { month: 'Mar', score: 52 },
  { month: 'Abr', score: 65 },
];

const StatCard = ({ label, value, sub, color }: any) => (
  <div className="bg-apple-bg border border-apple-separator rounded-2xl p-5 flex flex-col gap-1 shadow-sm hover:shadow-md transition-all">
    <div className={`text-[10px] font-bold tracking-widest uppercase ${color || 'text-apple-text-tertiary'}`}>{label}</div>
    <div className="text-[28px] font-black text-apple-text tabular-nums leading-none">{value}</div>
    {sub && <div className="text-[11px] font-medium text-apple-text-secondary mt-0.5">{sub}</div>}
  </div>
);

const QuickLink = ({ label, content, accent }: any) => (
  <div className="bg-apple-bg border border-apple-separator rounded-2xl p-5 hover:shadow-md transition-all cursor-pointer group flex flex-col gap-3">
    <div className="flex items-center justify-between">
      <div className={`text-[10px] font-bold tracking-widest uppercase ${accent || 'text-apple-text-tertiary'}`}>{label}</div>
      <ChevronRight className="w-3.5 h-3.5 text-apple-text-tertiary group-hover:text-apple-blue transition-colors" />
    </div>
    <div className={`text-[13px] font-semibold leading-relaxed line-clamp-2 ${accent ? 'text-apple-red' : 'text-apple-text'}`}>{content}</div>
  </div>
);

export default function PatientSummary({ patient }: { patient: any }) {
  const appointments = useAgendaStore(s => s.appointments);
  const specialists = useSpecialistStore(s => s.specialists);
  const goals = useClinicalStore(s => s.goals);
  const notes = useClinicalStore(s => s.notes);
  const evals = useClinicalStore(s => s.evaluations);

  const patientGoals = goals.filter(g => g.patientId === patient?.id);
  const patientNotes = notes.filter(n => n.patientId === patient?.id);
  const patientEvals = evals.filter(e => e.patientId === patient?.id);

  const achievedGoals = patientGoals.filter(g => g.progress === 100).length;
  const globalProgress = patientGoals.length > 0 
    ? Math.round(patientGoals.reduce((acc, g) => acc + g.progress, 0) / patientGoals.length) 
    : 0;
  const lastNote = patientNotes.length > 0 ? patientNotes[0] : null;

  const today = new Date().toISOString().split('T')[0];
  const nextAppointments = appointments
    .filter(a => a.patientId === patient?.id && a.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
  const nextApt = nextAppointments.length > 0 ? nextAppointments[0] : null;

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr || 'S/F';
      return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }).toUpperCase();
    } catch (e) {
      return dateStr || 'S/F';
    }
  };

  return (
    <div className="space-y-6 animate-apple pb-20 max-w-6xl mx-auto">

      {/* Hero: Patient Next Session */}
      <div className="bg-gradient-to-br from-[#1C1C1E] to-[#2C2C2E] text-white rounded-[24px] p-6 sm:p-8 relative overflow-hidden shadow-lg">
        <div className="absolute -top-10 -right-10 w-64 h-64 bg-apple-blue/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="text-[10px] font-bold tracking-widest uppercase text-white/50 mb-2">Estado del Expediente</div>
            <h2 className="text-[22px] sm:text-[28px] font-bold tracking-tight leading-tight mb-1">{patient.name}</h2>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[11px] font-bold text-white/60 uppercase tracking-widest">{patient.caseId}</span>
              <span className="px-2.5 py-1 bg-apple-green/20 text-apple-green text-[10px] font-bold tracking-widest uppercase rounded-full border border-apple-green/30">
                Activo
              </span>
              <span className="text-[11px] font-medium text-white/70">
                {patient.birthDate ? calculateAge(patient.birthDate) : patient.age} años · {patient.gender}
              </span>
              {patient.tutor && <span className="text-[11px] font-medium text-white/50">Tutor: {patient.tutor}</span>}
            </div>
          </div>

          {nextApt ? (
            <div className="bg-apple-bg/10 backdrop-blur-sm border border-white/20 rounded-2xl px-6 py-4 flex items-center gap-5 shrink-0">
              <div>
                <div className="text-[10px] font-bold tracking-widest uppercase text-white/50 mb-1">Próxima Sesión</div>
                <div className="text-[22px] font-black tabular-nums leading-none text-white">
                  {formatDate(nextApt.date)}
                </div>
                <div className="flex items-center gap-1.5 text-[12px] font-bold text-white/70 mt-1">
                  <Clock className="w-3.5 h-3.5" /> {formatTime(nextApt.time)} hrs
                </div>
              </div>
              <div className="w-[1px] h-12 bg-apple-bg/20" />
              <div>
                <div className="text-[13px] font-bold text-white">{nextApt.type}</div>
                <div className="text-[11px] font-medium text-white/60">
                  {specialists.find(s => s.id === nextApt.specialistId)?.name || nextApt.specialistName || 'Especialista'}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-apple-bg/5 border border-white/10 rounded-2xl px-6 py-4 flex items-center gap-4">
              <AlertCircle className="w-5 h-5 text-apple-orange shrink-0" />
              <div>
                <div className="text-[12px] font-bold text-white/80">Sin sesión programada</div>
                <button className="text-[11px] font-bold text-apple-blue mt-1 hover:underline">Agendar cita →</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Evaluaciones" value={patientEvals.length.toString()} sub="Pruebas aplicadas" />
        <StatCard label="Asistencia" value="92%" sub="Índice estimado" color="text-apple-green" />
        <StatCard label="Metas Logradas" value={`${achievedGoals}/${patientGoals.length}`} sub="Plan de intervención" color="text-apple-blue" />
        <StatCard label="Notas" value={patientNotes.length.toString()} sub="En línea de tiempo" color="text-apple-blue" />
      </div>

      {/* Progress Chart + Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Area Chart */}
        <div className="col-span-1 lg:col-span-2 bg-apple-bg border border-apple-separator rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-apple-green/10 rounded-xl flex items-center justify-center text-apple-green">
                <TrendingUp className="w-5 h-5" strokeWidth={2} />
              </div>
              <div>
                <div className="text-[10px] font-bold tracking-widest text-apple-text-tertiary uppercase">Evolución Trimestral</div>
                <h3 className="text-[16px] font-bold text-apple-text leading-tight">Progreso Global</h3>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[30px] font-black text-apple-text tabular-nums leading-none">{globalProgress}<span className="text-[18px] text-apple-text-tertiary">%</span></div>
              <div className="text-[10px] font-bold text-apple-green tracking-widest uppercase">Avance Promedio</div>
            </div>
          </div>

          <div className="h-[120px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockProgressData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34C759" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#34C759" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#8E8E93', fontSize: 11, fontWeight: 'bold' }} />
                <Tooltip cursor={{ stroke: '#E5E5EA', strokeWidth: 1 }} contentStyle={{ borderRadius: '10px', border: '1px solid #E5E5EA', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: 12, fontWeight: 'bold' }} />
                <Area type="monotone" dataKey="score" stroke="#34C759" strokeWidth={2.5} fillOpacity={1} fill="url(#colorScore)" dot={{ r: 4, fill: '#34C759', strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col gap-4">
          <QuickLink
            label="Última Nota Clínica"
            content={lastNote ? lastNote.content : "No hay notas registradas."}
          />
          {patientGoals.find(g => g.progress < 50) && (
            <QuickLink
              label="Meta con menor avance"
              content={`${patientGoals.find(g => g.progress < 50)?.title} (${patientGoals.find(g => g.progress < 50)?.progress}%)`}
              accent="text-apple-red"
            />
          )}
          {patient.schoolName && (
            <div className="bg-apple-bg border border-apple-separator rounded-2xl p-5 hover:shadow-md transition-all flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <School className="w-3.5 h-3.5 text-apple-blue" />
                <div className="text-[10px] font-bold tracking-widest text-apple-blue uppercase">Información Escolar</div>
              </div>
              <div className="space-y-1">
                <div className="text-[13px] font-bold text-apple-text">{patient.schoolName}</div>
                {(patient.schoolGrade || patient.schoolGroup) && (
                  <div className="text-[11px] font-medium text-apple-text-tertiary">
                    {patient.schoolGrade && `Grado: ${patient.schoolGrade}`}
                    {patient.schoolGrade && patient.schoolGroup && ' • '}
                    {patient.schoolGroup && `Grupo: ${patient.schoolGroup}`}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Module Quick-Access */}
      <div>
        <div className="text-[10px] font-bold tracking-widest text-apple-text-tertiary uppercase mb-4 px-1">Acceso Rápido al Expediente</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Anamnesis', sub: 'Historial', icon: FileText, color: 'bg-purple-50 text-purple-600 border-purple-100' },
            { label: 'Evaluaciones', sub: 'Tests psicométricos', icon: FileSignature, color: 'bg-blue-50 text-blue-600 border-blue-100' },
            { label: 'Plan', sub: 'Metas SMART', icon: Target, color: 'bg-green-50 text-green-600 border-green-100' },
            { label: 'Notas', sub: 'Evolución clínica', icon: Stethoscope, color: 'bg-orange-50 text-orange-600 border-orange-100' },
          ].map(({ label, sub, icon: Icon, color }) => (
            <div key={label} className="bg-apple-bg border border-apple-separator rounded-2xl p-5 hover:shadow-md transition-all cursor-pointer group flex flex-col gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 ${color}`}>
                <Icon className="w-4 h-4" strokeWidth={1.5} />
              </div>
              <div>
                <div className="text-[13px] font-bold text-apple-text">{label}</div>
                <div className="text-[11px] text-apple-text-tertiary font-medium">{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
