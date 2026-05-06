import React, { useState } from 'react';
import {
  Users,
  Calendar,
  Wallet,
  Bell,
  Activity,
  CalendarDays,
  ChevronRight,
  Plus,
  FileOutput,
  Clock,
  ArrowUpRight,
  Target,
  Gift,
  AlertTriangle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell
} from 'recharts';
import { cn } from '../../lib/utils';
import { useAgendaStore } from '../agenda/AgendaStore';
import { useSpecialistStore } from '../specialists/SpecialistStore';
import { useAuthStore } from '../../lib/AuthStore';
import AppointmentModal from '../agenda/modals/AppointmentModal';
import { formatTime, isBirthdayToday, calculateAge } from '../../lib/dateUtils';

const StatCard = ({ icon: Icon, title, value, sub, color, trend }: any) => (
  <div className="bg-apple-bg border border-apple-separator/40 rounded-[24px] p-5 flex flex-col min-w-[160px] sm:min-w-0 sm:flex-row sm:items-start gap-3 sm:gap-4 shadow-apple-soft hover:shadow-apple-medium transition-all group cursor-pointer shrink-0">
    <div className="flex items-center justify-between w-full sm:w-auto">
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 duration-500", color)}>
        <Icon className="w-5 h-5" strokeWidth={1.5} />
      </div>
      <ArrowUpRight className="w-4 h-4 text-apple-text-tertiary sm:hidden" />
    </div>
    <div className="min-w-0 pt-0.5">
      <div className="text-[13px] font-bold text-apple-text truncate">{title}</div>
      <div className="flex items-baseline gap-1 mt-0.5">
        <span className="text-[11px] font-medium text-apple-text-tertiary">Hoy:</span>
        <span className="text-[14px] font-black text-apple-black tabular-nums tracking-tight">{value}</span>
      </div>
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-effect !bg-apple-bg/90 p-4 rounded-2xl border border-apple-separator/30 shadow-apple-huge animate-apple">
          <p className="text-[10px] font-black uppercase tracking-widest text-apple-text-tertiary mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-3 py-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <p className="text-[14px] font-black text-apple-black">
                {entry.name}: <span className="text-apple-blue">{entry.value}</span>
              </p>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

export default function DashboardMain({ patients = [], onNavigate }: { patients?: any[], onNavigate?: (id: string) => void }) {
  const appointments = useAgendaStore(state => state.appointments);
  const updateStatus = useAgendaStore(state => state.updateStatus);
  const { specialists, fetchSpecialists } = useSpecialistStore();
  const { profile, user } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApt, setSelectedApt] = useState<any>(null);

  React.useEffect(() => {
    if (specialists.length === 0) fetchSpecialists();
  }, []);

  const todayDate = new Date().toISOString().split('T')[0];
  const todayApts = (appointments || [])
    .filter(a => a.date === todayDate)
    .sort((a, b) => (a.time || '').localeCompare(b.time || ''));

  // ── Dynamic Chart Data ───────────────────────
  const dynamicChartData = React.useMemo(() => {
    const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 (Sun) to 6 (Sat)
    
    // Calculate Monday of the current week
    const monday = new Date(now);
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    monday.setDate(diff);
    
    return dayNames.map((name, index) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + index);
      const dStr = d.toISOString().split('T')[0];
      
      const count = (appointments || []).filter(a => a.date === dStr).length;
      
      return {
        name,
        value: count,
        isCurrent: dStr === todayDate
      };
    });
  }, [appointments, todayDate]);

  // ── Logic for Notifications ──
  const birthdayPatients = React.useMemo(() => 
    patients.filter(p => p.birthDate && isBirthdayToday(p.birthDate))
  , [patients]);

  // Detect patients with 2+ consecutive absences (absent or cancelled)
  const absenceAlerts = React.useMemo(() => 
    patients.map(p => {
      const patientApts = (appointments || [])
        .filter(a => a.patientId === p.id && a.date && a.date <= todayDate)
        .sort((a, b) => (b.date || '').localeCompare(a.date || '')); // Sort by most recent
      
      let consecutiveAbsences = 0;
      for (const apt of patientApts) {
        if (apt.status === 'absent') {
          consecutiveAbsences++;
        } else if (apt.status === 'confirmed' || apt.status === 'completed') {
          break; // Stop at first attendance
        }
        if (consecutiveAbsences >= 2) break;
      }
      
      return consecutiveAbsences >= 2 ? { patient: p, count: consecutiveAbsences } : null;
    }).filter(Boolean)
  , [patients, appointments, todayDate]);

  // ── Scheduling Suggestions ──
  const schedulingSuggestions = React.useMemo(() => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const getDayName = (d: Date) => d.toLocaleDateString('es-MX', { weekday: 'long' });
    const getLocalDateStr = (d: Date) => d.toISOString().split('T')[0];

    const todayDayName = getDayName(today).toLowerCase();
    const tomorrowDayName = getDayName(tomorrow).toLowerCase();
    const todayStr = getLocalDateStr(today);
    const tomorrowStr = getLocalDateStr(tomorrow);

    let count = 0;
    patients.forEach(patient => {
      const days = (patient.attendanceDays || []).map((d: any) => d.toLowerCase());
      
      // Today
      if (days.includes(todayDayName)) {
        const hasApt = (appointments || []).some(apt => apt.patientId === patient.id && apt.date === todayStr);
        if (!hasApt) count++;
      }
      
      // Tomorrow
      if (days.includes(tomorrowDayName)) {
        const hasApt = (appointments || []).some(apt => apt.patientId === patient.id && apt.date === tomorrowStr);
        if (!hasApt) count++;
      }
    });
    return count;
  }, [patients, appointments]);

  const hasNotifications = birthdayPatients.length > 0 || absenceAlerts.length > 0 || schedulingSuggestions > 0;

  const handleEditApt = (apt: any) => {
    setSelectedApt(apt);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-32 animate-apple max-w-7xl mx-auto px-1 sm:px-0">

      {/* ── Welcome ─────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-[28px] sm:text-[34px] font-bold text-apple-black tracking-tight leading-tight">
            Hola, <span className="text-apple-blue/90">{profile?.full_name || user?.email?.split('@')[0] || 'Especialista'}</span>
          </h1>
          <p className="text-[14px] font-medium text-apple-text-secondary mt-1">Tu resumen clínico del día.</p>
        </div>
        <div className="hidden sm:flex gap-2">
            <button className="apple-button apple-button-secondary border-apple-separator/40 shadow-none hover:border-apple-separator">
                <FileOutput className="w-3.5 h-3.5" /> Exportar
            </button>
            <button className="apple-button apple-button-primary bg-apple-black/90 shadow-lg shadow-black/5">
                <Plus className="w-3.5 h-3.5" /> Nueva Acción
            </button>
        </div>
      </div>

      {/* ── Stat Cards ──────────────────────────── */}
      <div className="flex overflow-x-auto no-scrollbar gap-4 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:pb-0 scroll-smooth snap-x">
        <StatCard icon={Users}       title="Pacientes"     value={patients.length.toString()}  color="bg-indigo-50 text-indigo-500" />
        <StatCard icon={Calendar}    title="Citas Hoy"     value={todayApts.length.toString()}  color="bg-emerald-50 text-emerald-500" />
        <StatCard icon={Target}      title="Nuevos"        value={patients.filter(p => p.caseId?.includes('2026')).length.toString()}   color="bg-amber-50 text-amber-500" />
        <StatCard icon={Bell}        title="Alertas"       value={(absenceAlerts.length + birthdayPatients.length + schedulingSuggestions).toString()}   color="bg-rose-50 text-rose-500" />
      </div>

      {/* ── Chart & Right Section ────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Activity Chart */}
        <div className="lg:col-span-2 bg-apple-bg border border-apple-separator/40 rounded-[28px] p-6 sm:p-8 shadow-apple-soft relative overflow-hidden">
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <h3 className="text-[20px] font-bold text-apple-black tracking-tight">Actividad Semanal</h3>
              <p className="text-[14px] font-medium text-apple-text-tertiary">Volumen de citas por día</p>
            </div>
            <Activity className="w-5 h-5 text-apple-blue/50" />
          </div>

          <div className="h-[240px] sm:h-[300px] w-full relative z-10 px-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dynamicChartData} margin={{ top: 10, right: 10, left: -25, bottom: 35 }}>
                <CartesianGrid vertical={false} stroke="#F2F2F7" strokeDasharray="3 3" strokeWidth={0.5} fill="transparent" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#8E8E93', fontSize: 11, fontWeight: 600 }} 
                  dy={10} 
                  interval={0}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#8E8E93', fontSize: 11, fontWeight: 600 }} 
                  ticks={[0, 0.5, 1, 1.5, 2]} 
                />
                <Tooltip 
                  cursor={false}
                  content={<CustomTooltip />} 
                />
                <Bar 
                  dataKey="value" 
                  radius={[6, 6, 0, 0]}
                  maxBarSize={32}
                >
                  {dynamicChartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.isCurrent ? '#1358FF' : '#E5E5EA'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-apple-bg border border-apple-separator/40 rounded-[28px] p-6 sm:p-8 shadow-apple-soft flex flex-col h-full max-h-[550px]">
          <div className="flex items-center gap-2 mb-8">
            <Clock className="w-5 h-5 text-apple-blue" strokeWidth={2.5} />
            <h3 className="text-[20px] font-bold text-apple-black tracking-tight">Próximas Citas</h3>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar pr-1 relative">
            {/* Timeline connector line */}
            <div className="absolute left-[7px] top-2 bottom-4 w-[1px] bg-apple-separator/40" />

            <div className="space-y-6">
              {todayApts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-10 opacity-40">
                   <CalendarDays className="w-10 h-10 mb-2" />
                   <p className="text-[14px] font-bold">Sin citas</p>
                </div>
              ) : (
                todayApts.map((apt, idx) => {
                  const patient = patients.find(p => p.id === apt.patientId);
                  const specialist = specialists.find(s => s.id === apt.specialistId);
                  return (
                    <div key={apt.id} className="relative pl-8 group cursor-pointer">
                      <div className="absolute left-0 top-[6px] w-[15px] h-[15px] bg-apple-bg border-[3px] border-apple-blue rounded-full z-10" />
                      <div className="text-[10px] font-black uppercase tracking-wider text-apple-text-tertiary mb-0.5">
                        HOY • {formatTime(apt.time)}
                      </div>
                      <div className="text-[14px] font-bold text-apple-black group-hover:text-apple-blue transition-colors leading-tight">
                        {patient ? `${patient.name} ${patient.lastNamePaterno}` : apt.patientName}
                      </div>
                      <div className="text-[11px] font-medium text-apple-text-secondary mt-0.5">
                         {specialist?.name || apt.specialistName || 'Especialista General'}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="mt-8 w-full h-14 bg-apple-slate/40 hover:bg-apple-slate/60 rounded-[18px] flex items-center justify-center gap-2 text-[14px] font-bold text-apple-black transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" strokeWidth={3} />
            Agendar Nueva
          </button>
        </div>
      </div>

      {/* ── Notification Center ────────────────────── */}
      {hasNotifications && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
             <Bell className="w-5 h-5 text-apple-red animate-bounce" strokeWidth={2.5} />
             <h3 className="text-[17px] font-bold text-apple-black tracking-tight">Centro de Alertas</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {birthdayPatients.map(p => (
              <div key={`bday-${p.id}`} className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-[24px] p-5 flex items-center gap-4 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-700">
                  <Gift className="w-16 h-16 text-purple-500" />
                </div>
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm shrink-0">
                  <Gift className="w-6 h-6 text-purple-500" strokeWidth={2} />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-purple-600 mb-1">¡Cumpleaños Hoy! 🎂</div>
                  <div className="text-[15px] font-bold text-apple-black leading-tight">
                    {p.name} {p.lastNamePaterno}
                  </div>
                  <div className="text-[12px] font-medium text-apple-text-secondary mt-0.5">
                    Cumple {calculateAge(p.birthDate)} años hoy.
                  </div>
                </div>
              </div>
            ))}

            {absenceAlerts.map(alert => (
              <div key={`abs-${alert!.patient.id}`} className="bg-gradient-to-br from-apple-red/10 to-orange-500/10 border border-apple-red/20 rounded-[24px] p-5 flex items-center gap-4 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-700">
                  <AlertTriangle className="w-16 h-16 text-apple-red" />
                </div>
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm shrink-0">
                  <AlertTriangle className="w-6 h-6 text-apple-red" strokeWidth={2} />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-apple-red mb-1">Alerta de Inasistencia ⚠️</div>
                  <div className="text-[15px] font-bold text-apple-black leading-tight">
                    {alert!.patient.name} {alert!.patient.lastNamePaterno}
                  </div>
                  <div className="text-[12px] font-medium text-apple-text-secondary mt-0.5">
                    Ha faltado a {alert!.count} sesiones consecutivas.
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Action Grid ─────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 sm:gap-6">
        <button 
          onClick={() => onNavigate && onNavigate('MetasEquipo')}
          className="bg-apple-blue/5 hover:bg-apple-blue/10 border border-apple-blue/10 rounded-[32px] p-8 flex flex-col items-center justify-center gap-4 transition-all group active:scale-[0.98]"
        >
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-apple-soft group-hover:scale-110 transition-transform duration-500">
            <Target className="w-7 h-7 text-apple-blue" strokeWidth={2.5} />
          </div>
          <span className="text-[13px] font-black tracking-[0.1em] text-apple-blue uppercase">Metas</span>
        </button>

        <button className="bg-apple-green/5 hover:bg-apple-green/10 border border-apple-green/10 rounded-[32px] p-8 flex flex-col items-center justify-center gap-4 transition-all group active:scale-[0.98]">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-apple-soft group-hover:scale-110 transition-transform duration-500">
            <FileOutput className="w-7 h-7 text-apple-green" strokeWidth={2.5} />
          </div>
          <span className="text-[13px] font-black tracking-[0.1em] text-apple-green uppercase">Informes</span>
        </button>
      </div>

      <button className="fixed bottom-24 right-6 sm:hidden w-[160px] h-12 bg-apple-blue text-white rounded-full shadow-apple-huge flex items-center justify-center gap-2 font-bold text-[14px] active:scale-95 transition-all z-40">
        <Plus className="w-5 h-5" strokeWidth={3} />
        Nueva Acción
      </button>

      <AppointmentModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        patients={patients}
        appointment={selectedApt}
      />
    </div>
  );
}
