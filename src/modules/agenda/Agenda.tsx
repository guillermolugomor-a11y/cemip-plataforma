import React, { useState, useRef } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  User,
  MoreVertical,
  CheckCircle2,
  Printer,
  Camera,
  CalendarDays,
  X,
  LayoutGrid,
  List,
  Trash2,
  Edit2,
  Loader2
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAgendaStore } from './AgendaStore';
import type { Appointment, Patient } from '../../types/clinical';
import { getLocalDateString, formatDisplayDate, getDayNameES, formatTime } from '../../lib/dateUtils';
import AppointmentModal from './modals/AppointmentModal';
import { toJpeg } from 'html-to-image';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useAccountingStore } from '../accounting/AccountingStore';

// Helper: Convert human-readable time ("11 am", "04:30 p.m.") to HH:MM format
function parseTimeToHHMM(raw: string): string {
  if (!raw) return '09:00';
  // Already in HH:MM format?
  if (/^\d{1,2}:\d{2}$/.test(raw.trim())) return raw.trim().padStart(5, '0');
  
  const cleaned = raw.toLowerCase().replace(/\./g, '').trim();
  const match = cleaned.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/);
  if (!match) return '09:00';
  
  let hours = parseInt(match[1], 10);
  const minutes = match[2] || '00';
  const period = match[3];
  
  if (period === 'pm' && hours < 12) hours += 12;
  if (period === 'am' && hours === 12) hours = 0;
  
  return `${hours.toString().padStart(2, '0')}:${minutes}`;
}

// ────────────────────────────────────────────
// Appointment Card (mobile-friendly)
// ────────────────────────────────────────────
const statusConfig: any = {
  confirmed: { label: 'Confirmada', cls: 'bg-blue-50 text-apple-blue border-apple-blue/20', dot: 'bg-apple-blue' },
  pending: { label: 'Pendiente', cls: 'bg-orange-50 text-orange-500 border-orange-200', dot: 'bg-orange-400' },
  completed: { label: 'Asistió', cls: 'bg-apple-green/10 text-apple-green border-apple-green/20', dot: 'bg-apple-green' },
  cancelled: { label: 'Cancelada', cls: 'bg-apple-secondary text-apple-text-tertiary border-apple-separator', dot: 'bg-apple-text-tertiary' },
};

const AppointmentCard = ({ appointment, onStatusChange, onDelete, onEdit, menuAlign = 'right' }: { appointment: Appointment; onStatusChange: (id: string, s: any) => void; onDelete: (id: string) => void; onEdit: (apt: Appointment) => void; menuAlign?: 'left' | 'right' }) => {
  const [showActions, setShowActions] = useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const sc = statusConfig[appointment.status] || statusConfig.pending;

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowActions(false);
      }
    };
    if (showActions) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showActions]);

  return (
    <div className={cn(
      "bg-apple-bg border border-apple-separator/30 rounded-xl p-4 transition-all duration-300 hover:shadow-apple-soft relative group border-l-4",
      appointment.status === 'cancelled' ? "opacity-40 grayscale border-l-apple-text-tertiary" : "border-l-apple-blue",
      appointment.status === 'completed' && "border-l-apple-green"
    )}>
      {/* Top row: time + actions */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", sc.dot)} />
          <span className="text-[11px] font-bold text-apple-black tabular-nums truncate">{formatTime(appointment.time)}</span>
        </div>
        <div className="relative shrink-0" ref={menuRef}>
          <button onClick={() => setShowActions(v => !v)} className="p-1 hover:bg-apple-slate rounded-lg transition-colors text-apple-text-tertiary no-print opacity-0 group-hover:opacity-100">
            <MoreVertical className="w-3.5 h-3.5" />
          </button>
          {showActions && (
            <div className={cn(
              "absolute mt-1 w-48 glass-effect !bg-apple-bg/98 border border-apple-separator/30 rounded-xl shadow-apple-huge p-1 z-[100] animate-apple",
              menuAlign === 'right' ? "right-0" : "left-0"
            )}>
              {appointment.status === 'completed' && appointment.isAccountingLogged ? (
                <div className="w-full text-left px-2 py-1.5 text-[10px] font-bold text-apple-green/50 rounded-lg flex items-center gap-2 cursor-not-allowed">
                  <CheckCircle2 className="w-3 h-3" /> Pago Registrado
                </div>
              ) : (
                <button onClick={() => { onStatusChange(appointment.id, 'completed'); setShowActions(false); }} className="w-full text-left px-2 py-1.5 text-[10px] font-bold hover:bg-apple-green/10 text-apple-green rounded-lg transition-colors flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3" /> Asistió (Registrar Pago)
                </button>
              )}
              <button onClick={() => { onStatusChange(appointment.id, 'confirmed'); setShowActions(false); }} className="w-full text-left px-2 py-1.5 text-[10px] font-bold hover:bg-apple-blue/10 text-apple-blue rounded-lg transition-colors flex items-center gap-2"><CheckCircle2 className="w-3 h-3" /> Confirmar Cita</button>
              <button onClick={() => { onStatusChange(appointment.id, 'pending'); setShowActions(false); }} className="w-full text-left px-2 py-1.5 text-[10px] font-bold hover:bg-orange-50 text-orange-500 rounded-lg transition-colors flex items-center gap-2"><Clock className="w-3 h-3" /> Pendiente</button>
              <button onClick={() => { onStatusChange(appointment.id, 'cancelled'); setShowActions(false); }} className="w-full text-left px-2 py-1.5 text-[10px] font-bold hover:bg-apple-red/5 text-apple-red rounded-lg transition-colors flex items-center gap-2"><X className="w-3 h-3" /> Cancelar</button>
              <div className="h-px bg-apple-separator/30 my-1" />
              <button
                onClick={() => { onEdit(appointment); setShowActions(false); }}
                className="w-full text-left px-2 py-1.5 text-[10px] font-bold hover:bg-apple-blue/5 text-apple-blue rounded-lg transition-colors flex items-center gap-2"
              >
                <Edit2 className="w-3 h-3" /> Editar Datos
              </button>
              <button
                onClick={() => { if (window.confirm('¿Eliminar cita?')) { onDelete(appointment.id); } setShowActions(false); }}
                className="w-full text-left px-2 py-1.5 text-[10px] font-bold hover:bg-apple-red/5 text-apple-red rounded-lg transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-3 h-3" /> Eliminar Cita
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="space-y-0.5 mb-3">
        <div className="text-[8px] font-black tracking-[0.05em] text-apple-blue uppercase opacity-70 leading-none truncate">{appointment.type}</div>
        <div className="font-bold text-apple-black text-[13px] leading-tight transition-colors group-hover:text-apple-blue truncate">{appointment.patientName}</div>
        <div className="text-[10px] font-medium text-apple-text-tertiary flex items-center gap-1.5 italic truncate">
          <User className="w-2.5 h-2.5 opacity-50" /> {appointment.specialistName}
        </div>
      </div>

      {/* Selection footer on hover */}
      <div className="pt-2 border-t border-apple-separator/10 flex items-center justify-between pointer-events-none">
        <span className={cn("text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded", sc.cls.replace('bg-', 'bg-opacity-20 bg-'))}>{sc.label}</span>
        <ChevronRight className="w-2.5 h-2.5 text-apple-text-tertiary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
      </div>
    </div>
  );
};

// ────────────────────────────────────────────
// Mobile Day Picker strip
// ────────────────────────────────────────────
const DayStrip = ({ days, selectedDate, onSelect }: any) => (
  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
    {days.map((d: any) => (
      <button
        key={d.full}
        onClick={() => onSelect(d.full)}
        className={cn(
          "flex flex-col items-center gap-1 px-4 py-3 rounded-2xl transition-all shrink-0 min-w-[60px] border border-transparent",
          selectedDate === d.full
            ? "bg-apple-black text-apple-bg shadow-apple-huge"
            : d.isActive
              ? "bg-apple-blue/10 text-apple-blue border-apple-blue/20"
              : "text-apple-text-secondary hover:bg-apple-slate"
        )}
      >
        <span className="text-[9px] font-bold uppercase tracking-widest mb-1 opacity-70">{d.day.slice(0, 3)}</span>
        <span className="text-[18px] font-black tabular-nums leading-none tracking-tighter">{d.date}</span>
      </button>
    ))}
  </div>
);

// ────────────────────────────────────────────
// Desktop Week Column
// ────────────────────────────────────────────

const DayColumn = ({ day, date, full, fullDate, fullDay, isActive, appointments, onStatusChange, onDelete, onEdit, onAddClick, patients, onQuickAdd, isFirst, isLast }: any) => {
  const menuAlign = isFirst ? 'left' : 'right';
  // Encontrar pacientes que asisten este día de la semana
  // Usamos 'fullDay' que ya viene calculado ("Lunes", "Martes", etc)
  const currentDayName = fullDay || (fullDate ? getDayNameES(fullDate) : getDayNameES(new Date()));

  const suggestions = (patients || []).filter((p: any) => {
    const attendsToday = p.attendanceDays?.some((d: string) => d.toLowerCase() === currentDayName.toLowerCase());
    const alreadyScheduled = appointments?.some((a: any) => a.patientId === p.id);
    return attendsToday && !alreadyScheduled;
  });

  return (
    <div className={cn("flex-1 flex flex-col min-w-[200px] border-r border-apple-separator/30 last:border-r-0 pb-6 transition-all", !isActive && "bg-apple-slate/10")}>
      <div className={cn("text-center py-5 border-b border-apple-separator/30 mb-5 px-4", isActive && "bg-apple-blue/5")}>
        <div className={cn("text-[10px] font-black tracking-[0.2em] uppercase mb-2", isActive ? "text-apple-blue" : "text-apple-text-tertiary")}>{day}</div>
        <div className={cn(
          "w-10 h-10 mx-auto rounded-xl flex items-center justify-center font-bold text-[16px] transition-all tracking-tighter",
          isActive ? "bg-apple-blue text-white shadow-apple-huge" : "bg-apple-bg border border-apple-separator/50 text-apple-black"
        )}>{date}</div>
      </div>

      <div className="space-y-4 px-4 h-full flex flex-col">
        <div className="flex-1 space-y-4">
          {appointments?.map((apt: any) => (
            <AppointmentCard key={apt.id} appointment={apt} onStatusChange={onStatusChange} onDelete={onDelete} onEdit={onEdit} menuAlign={menuAlign} />
          ))}
        </div>

        {/* Sugerencias Inteligentes */}
        {suggestions.length > 0 && (
          <div className="mb-4 space-y-2 animate-apple">
            <div className="flex items-center gap-2 px-1">
              <div className="w-1 h-1 bg-apple-blue rounded-full" />
              <span className="text-[10px] font-black tracking-[0.1em] uppercase text-apple-text-tertiary">Sugerencias {day}</span>
            </div>
            {suggestions.map((p: any) => (
              <button
                key={p.id}
                onClick={() => onQuickAdd(p, getLocalDateString(fullDate))}
                className="w-full flex items-center gap-3 p-2 bg-apple-bg border border-apple-separator/40 rounded-xl hover:border-apple-blue/40 hover:shadow-apple-soft transition-all text-left group"
              >
                <div className="w-8 h-8 rounded-lg bg-apple-blue/10 text-apple-blue flex items-center justify-center text-[11px] font-black transition-colors group-hover:bg-apple-blue group-hover:text-white">
                  {p.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-bold text-apple-text truncate">{p.name}</div>
                  <div className="text-[9px] font-bold text-apple-text-tertiary">{formatTime(p.appointmentTime) || '--:--'}</div>
                </div>
                <Plus className="w-3 h-3 ml-auto text-apple-text-tertiary group-hover:text-apple-blue" />
              </button>
            ))}
          </div>
        )}

        <button
          onClick={() => onAddClick(getLocalDateString(fullDate))}
          className="w-full h-12 border-2 border-dashed border-apple-separator/30 rounded-xl flex items-center justify-center text-apple-text-tertiary hover:bg-apple-bg hover:border-apple-blue/40 hover:text-apple-blue transition-all group no-print shrink-0"
        >
          <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" strokeWidth={3} />
        </button>
      </div>
    </div>
  );
};

// ────────────────────────────────────────────
// Timeline Day View
// ────────────────────────────────────────────
const TimelineView = ({ date, appointments, onStatusChange, onDelete, onEdit, isExporting }: any) => {
  let hours = Array.from({ length: 13 }, (_, i) => i + 8); // 8:00 to 20:00

  if (isExporting && appointments && appointments.length > 0) {
    const minHour = Math.min(...appointments.map((a: any) => parseInt(a.time.split(':')[0], 10)));
    const maxHour = Math.max(...appointments.map((a: any) => parseInt(a.time.split(':')[0], 10)));
    hours = hours.filter(h => h >= minHour && h <= Math.min(20, maxHour + 1));
  }

  const containerRef = React.useRef<HTMLDivElement>(null);

  return (
    <div className="bg-apple-bg rounded-apple-xl border border-apple-separator/40 overflow-hidden flex-1 shadow-apple-soft">
      <div className="flex border-b border-apple-separator/30 bg-apple-slate/50 px-8 py-5 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-apple-black rounded-lg flex items-center justify-center">
            <Clock className="text-white w-4 h-4" />
          </div>
          <h3 className="font-bold text-apple-black text-[15px] tracking-tight">Timeline del Día</h3>
        </div>
        <div className="px-4 py-1.5 bg-apple-bg rounded-xl border border-apple-separator/30 text-[11px] font-bold text-apple-blue shadow-apple-soft cursor-default uppercase tracking-widest">{date}</div>
      </div>
      <div className={cn("p-6 sm:p-10 custom-scrollbar", !isExporting && "overflow-y-auto max-h-[72vh]")} ref={containerRef}>
        <div className="relative">
          {hours.map(hour => {
            const apts = appointments?.filter((a: any) => a.time?.startsWith(hour.toString().padStart(2, '0')));
            return (
              <div key={hour} id={`hour-block-${hour}`} className="flex gap-8 group/hour pb-6">
                <div className="w-16 shrink-0 text-right pt-1">
                  <div className="text-[12px] font-black text-apple-black tabular-nums tracking-tighter group-hover/hour:text-apple-blue transition-colors">
                    {hour.toString().padStart(2, '0')}:00
                  </div>
                  <div className="text-[9px] font-bold text-apple-text-tertiary uppercase tracking-widest opacity-40">AM/PM</div>
                </div>
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 pb-8 border-l border-apple-separator/30 pl-8 relative">
                  <div className="absolute top-2 -left-[4.5px] w-2 h-2 rounded-full bg-apple-separator/50 group-hover/hour:bg-apple-blue transition-colors" />
                  {apts?.length > 0 ? (
                    apts.map((apt: any) => (
                      <AppointmentCard key={apt.id} appointment={apt} onStatusChange={onStatusChange} onDelete={onDelete} onEdit={onEdit} />
                    ))
                  ) : (
                    <div className="h-10 flex items-center">
                      <div className="text-[11px] font-bold text-apple-text-tertiary uppercase tracking-tighter opacity-0 group-hover/hour:opacity-30 transition-opacity">Slot Disponible</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ────────────────────────────────────────────
// Stats sidebar card
// ────────────────────────────────────────────
const StatRow = ({ label, value, color }: any) => (
  <div className="flex items-center justify-between py-4 border-b border-apple-separator/30 last:border-0 hover:bg-apple-slate/30 px-2 rounded-xl transition-colors cursor-default">
    <span className="text-[11px] font-bold text-apple-text-tertiary uppercase tracking-widest">{label}</span>
    <span className={cn("text-[24px] font-bold tabular-nums tracking-tighter", color)}>{value}</span>
  </div>
);

// ────────────────────────────────────────────
// Main
// ────────────────────────────────────────────
export default function Agenda({ patients }: { patients: any[] }) {
  const { appointments, updateStatus, deleteAppointment, addAppointment, updateAppointment } = useAgendaStore();
  const { addTransaction } = useAccountingStore();
  const exportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Find nearest upcoming appointment date
  const getInitialDates = () => {
    if (!appointments || appointments.length === 0) return { d: new Date(), s: new Date().toISOString().split('T')[0] };
    const todayStr = new Date().toISOString().split('T')[0];
    const sorted = [...appointments].sort((a, b) => {
      const c = a.date.localeCompare(b.date);
      if (c !== 0) return c;
      return a.time.localeCompare(b.time);
    });
    let target = sorted.find(a => a.date >= todayStr);
    if (!target) target = sorted[sorted.length - 1];

    const dObj = new Date(target.date + 'T12:00:00');
    return { d: dObj, s: target.date };
  };

  const init = React.useMemo(getInitialDates, []);

  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedDate, setSelectedDate] = useState(init.s);
  const [currentDate, setCurrentDate] = useState(init.d);
  const [suggestionToConfirm, setSuggestionToConfirm] = useState<{ patient: any, date: string } | null>(null);
  const [paymentConfirm, setPaymentConfirm] = useState<Appointment | null>(null);
  const [payForm, setPayForm] = useState({ amount: '800', method: 'Efectivo', expectedMsg: null as string | null });
  const [isSavingPayment, setIsSavingPayment] = useState(false);

  const handleOpenModal = (dateStr: string, apt: Appointment | null = null) => {
    setSelectedDate(dateStr);
    setSelectedAppointment(apt);
    setIsModalOpen(true);
  };

  const handleStatusChange = (id: string, status: any) => {
    const apt = appointments.find(a => a.id === id);
    if (!apt) return;

    if (status === 'completed') {
      // Regla estricta Anti-Duplicados
      if (apt.isAccountingLogged) {
        alert('⚠️ ACCIÓN DENEGADA: Esta cita ya fue cobrada y registrada en Contabilidad previamente. No se pueden duplicar los cobros.');
        updateStatus(id, 'completed'); // Asegurarnos de que visualmente se mantenga en completado
        return;
      }

      // Buscar si el paciente tiene un costo parametrizado en su expediente
      let expectedCost = apt.sessionCost || 800;
      let expectedMsg = null;
      if (patients) {
        const p = patients.find((pat: any) => pat.id === apt.patientId || pat.name === apt.patientName);
        if (p && p.sessionCost) {
          expectedCost = parseFloat(p.sessionCost);
          expectedMsg = `📌 Expediente: Este paciente tiene configurado un pago de $${p.sessionCost}`;
        }
      }

      setPayForm({ amount: expectedCost.toString(), method: 'Efectivo', expectedMsg });
      setPaymentConfirm(apt);
    } else {
      updateStatus(id, status);
    }
  };

  const confirmPaymentAction = (registerInAccounting: boolean) => {
    if (!paymentConfirm || isSavingPayment) return;

    setIsSavingPayment(true);
    
    // Simulación de delay para feedback visual
    setTimeout(() => {
      updateStatus(paymentConfirm.id, 'completed');

      if (registerInAccounting) {
        addTransaction({
          type: 'income',
          amount: parseFloat(payForm.amount),
          concept: `${paymentConfirm.type || 'Consulta'} – ${paymentConfirm.patientName}`,
          category: 'Consulta',
          date: getLocalDateString(),
          method: payForm.method as any,
          patientName: paymentConfirm.patientName,
          specialistName: paymentConfirm.specialistName,
          nota: `Pago registrado desde Agenda`,
        });
        updateAppointment(paymentConfirm.id, { isAccountingLogged: true, isPaid: true });
      }

      setIsSavingPayment(false);
      setPaymentConfirm(null);
    }, 600);
  };

  const getWeekDates = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    return Array.from({ length: 6 }, (_, i) => {
      const weekDay = new Date(monday);
      weekDay.setDate(monday.getDate() + i);
      return {
        full: weekDay.toISOString().split('T')[0],
        date: weekDay.getDate(),
        day: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][i],
        fullDay: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][i],
        fullDate: weekDay,
        isActive: weekDay.toISOString().split('T')[0] === new Date().toISOString().split('T')[0],
      };
    });
  };

  const weekDays = getWeekDates(currentDate);
  const todayApts = appointments.filter(a => a.date === selectedDate).sort((a, b) => a.time.localeCompare(b.time));
  const weekApts = appointments.filter(a => weekDays.some(d => d.full === a.date));
  const statsApts = viewMode === 'day' ? todayApts : weekApts;

  const navigateWeek = (d: number) => {
    const nd = new Date(currentDate);
    nd.setDate(nd.getDate() + d * 7);
    setCurrentDate(nd);
  };

  const monthLabel = currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  const handleExportPDF = () => {
    try {
      setIsExporting(true);
      const doc = new jsPDF();

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(30, 40, 50);
      doc.text('CEMIP • Instituto Clínico', 14, 25);

      doc.setFontSize(12);
      doc.setTextColor(100, 110, 120);
      doc.text(`Planificación y Estrategia - ${monthLabel}`, 14, 34);

      // Si estamos en vista de día, imprimimos la tabla del día. Si es semana, imprimimos toda la semana
      const dateTitle = viewMode === 'day' ? `Citas del ${selectedDate}` : `Semana de Citas`;
      doc.setFontSize(14);
      doc.setTextColor(20, 20, 20);
      doc.text(dateTitle, 14, 48);

      const tableData = statsApts.map(apt => [
        apt.date,
        apt.time,
        apt.patientName,
        apt.specialistName,
        apt.type,
        apt.status.toUpperCase()
      ]);

      autoTable(doc, {
        startY: 54,
        head: [['Fecha', 'Hora', 'Paciente', 'Especialista', 'Tipo', 'Estado']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [0, 122, 255] },
        styles: { fontSize: 9, cellPadding: 3 },
      });

      // Título estadísticas
      const finalY = (doc as any).lastAutoTable.finalY || 54;
      doc.setFontSize(12);
      doc.text('Resumen de Citas', 14, finalY + 15);

      const countTotal = statsApts.length;
      const countConfirmed = statsApts.filter(a => a.status === 'confirmed').length;
      const countCancelled = statsApts.filter(a => a.status === 'cancelled').length;
      const countCompleted = statsApts.filter(a => a.status === 'completed').length;

      autoTable(doc, {
        startY: finalY + 20,
        head: [['Total Programadas', 'Atendidas/Cobradas', 'Confirmadas', 'Canceladas']],
        body: [[countTotal.toString(), countCompleted.toString(), countConfirmed.toString(), countCancelled.toString()]],
        theme: 'plain',
        styles: { fontSize: 10, halign: 'center' },
        headStyles: { fontStyle: 'bold', textColor: [100, 110, 120] }
      });

      // Forzar descarga con extensión explícita
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Agenda_CEMIP_${viewMode}_${new Date().getTime()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Hubo un error al generar el PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportJPG = async () => {
    if (!exportRef.current) return;
    try {
      setIsExporting(true);
      // Damos un momento para que React re-renderice la UI con headers de impresión visibles
      await new Promise(r => setTimeout(r, 200));
      const dataUrl = await toJpeg(exportRef.current, {
        quality: 0.95,
        backgroundColor: '#ffffff',
      });
      const link = document.createElement('a');
      link.download = `Agenda_CEMIP_${viewMode}_${new Date().getTime()}.jpg`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Error exporting JPG:', error);
      alert('Hubo un error al generar la imagen JPG.');
    } finally {
      setIsExporting(false);
    }
  };


  const handleQuickAdd = (patient: any, date: string) => {
    setSuggestionToConfirm({ patient, date });
  };

  const confirmQuickAddDirectly = () => {
    if (!suggestionToConfirm) return;
    const { patient, date } = suggestionToConfirm;
    addAppointment({
      patientId: patient.id,
      patientName: patient.name,
      specialistId: '',
      specialistName: 'Dr. Alejandro Hernandez',
      date,
      time: parseTimeToHHMM(patient.appointmentTime || '09:00'),
      type: 'Sesión Terapia',
      status: 'pending'
    });
    setSuggestionToConfirm(null);
  };

  const customizeSuggestion = () => {
    if (!suggestionToConfirm) return;
    const { patient, date } = suggestionToConfirm;
    handleOpenModal(date, {
      patientId: patient.id,
      patientName: patient.name,
      specialistId: '',
      specialistName: 'Dr. Alejandro Hernandez',
      date,
      time: parseTimeToHHMM(patient.appointmentTime || '09:00'),
      type: 'Sesión Terapia',
      status: 'pending'
    } as any);
    setSuggestionToConfirm(null);
  };;

  return (
    <div className={cn(
      "animate-apple max-w-[1380px] mx-auto transition-all duration-300",
      isExporting ? "bg-apple-bg p-12 rounded-3xl pb-16 space-y-8" : "space-y-5 pb-20"
    )} ref={exportRef}>

      {/* ── Print Header (ONLY IN EXPORT) ── */}
      {isExporting && (
        <div className="mb-10 text-center border-b border-apple-separator pb-8 opacity-100 animate-in fade-in">
          <div className="mx-auto w-16 h-16 bg-apple-blue rounded-2xl flex items-center justify-center mb-4">
            <CalendarDays className="text-white w-8 h-8" />
          </div>
          <h1 className="text-4xl font-black text-apple-text tracking-tight uppercase">CEMIP • Instituto Clínico</h1>
          <h2 className="text-xl font-bold text-apple-text-secondary mt-2">Planificación y Estrategia de Especialistas</h2>
          <p className="text-sm font-medium text-apple-text-tertiary mt-3 uppercase tracking-widest bg-apple-secondary inline-block px-4 py-1.5 rounded-full">
            {monthLabel}
          </p>
        </div>
      )}

      {/* ── Header ─────────────────────────── */}
      <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between gap-4", isExporting && "hidden")}>
        <div className="flex items-center gap-3">
          <div>
            <span className="text-[10px] font-black tracking-widest uppercase text-apple-blue block mb-0.5">Planificación</span>
            <h2 className="text-[20px] sm:text-[22px] font-bold tracking-tight text-apple-text capitalize">{monthLabel}</h2>
          </div>
          <div className="flex gap-1 ml-2 no-print">
            <button onClick={() => navigateWeek(-1)} className="p-2 bg-apple-bg border border-apple-separator rounded-xl text-apple-text-secondary hover:text-apple-blue transition-all shadow-sm">
              <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
            </button>
            <button onClick={() => navigateWeek(1)} className="p-2 bg-apple-bg border border-apple-separator rounded-xl text-apple-text-secondary hover:text-apple-blue transition-all shadow-sm">
              <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 no-print">
          {/* View mode toggle */}
          <div className="bg-apple-bg border border-apple-separator p-1 rounded-xl flex gap-1 shadow-sm">
            <button
              onClick={() => setViewMode('week')}
              className={cn("p-2 rounded-lg transition-all", viewMode === 'week' ? "bg-apple-blue text-white shadow-sm" : "text-apple-text-secondary hover:bg-apple-tertiary")}
              title="Vista Semana"
            >
              <LayoutGrid className="w-4 h-4" strokeWidth={2} />
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={cn("p-2 rounded-lg transition-all", viewMode === 'day' ? "bg-apple-blue text-white shadow-sm" : "text-apple-text-secondary hover:bg-apple-tertiary")}
              title="Vista Día"
            >
              <List className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
          <div className="hidden sm:flex items-center gap-1">
            <button
              disabled={isExporting}
              onClick={handleExportPDF}
              className="bg-apple-bg border border-apple-separator p-2.5 rounded-xl text-apple-text-secondary hover:text-red-500 hover:border-red-200 transition-all shadow-sm flex items-center justify-center"
              title="Exportar Calendario a PDF"
            >
              {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" strokeWidth={2} />}
            </button>
            <button
              disabled={isExporting}
              onClick={handleExportJPG}
              className="bg-apple-bg border border-apple-separator p-2.5 rounded-xl text-apple-text-secondary hover:text-blue-500 hover:border-blue-200 transition-all shadow-sm flex items-center justify-center"
              title="Exportar Calendario a Imagen (JPG)"
            >
              {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" strokeWidth={2} />}
            </button>
          </div>

          <button
            onClick={() => handleOpenModal(new Date().toISOString().split('T')[0])}
            className="apple-button apple-button-primary flex items-center gap-2 px-5 py-2.5 text-[12px] font-bold"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} /> <span className="hidden sm:inline">Nueva Cita</span><span className="sm:hidden">Cita</span>
          </button>
        </div>
      </div>

      {/* ── Mobile: Day strip + today's list ── */}
      <div className="lg:hidden space-y-4">
        <div className="bg-apple-bg border border-apple-separator rounded-2xl p-4 shadow-sm">
          <DayStrip days={weekDays} selectedDate={selectedDate} onSelect={setSelectedDate} />
        </div>

        {/* Selected day cards */}
        <div className="space-y-3">
          {todayApts.length === 0 ? (
            <div className="bg-apple-bg border border-dashed border-apple-separator rounded-2xl p-8 text-center">
              <CalendarDays className="w-8 h-8 text-apple-text-tertiary mx-auto mb-3 opacity-40" />
              <p className="text-[13px] font-medium text-apple-text-secondary">Sin citas para este día</p>
              <button
                onClick={() => handleOpenModal(selectedDate)}
                className="mt-4 apple-button apple-button-primary px-6 py-2 text-[11px] font-bold no-print"
              >
                <Plus className="w-3.5 h-3.5 inline mr-1.5" strokeWidth={2.5} /> Agendar cita
              </button>
            </div>
          ) : (
            todayApts.map(apt => (
              <AppointmentCard key={apt.id} appointment={apt} onStatusChange={handleStatusChange} onDelete={deleteAppointment} onEdit={(a) => handleOpenModal(selectedDate, a)} />
            ))
          )}
        </div>

        {/* Mobile stats strip */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total', value: appointments.length, color: 'text-apple-text' },
            { label: 'Atendidas', value: appointments.filter(a => a.status === 'confirmed').length, color: 'text-apple-green' },
            { label: 'Canceladas', value: appointments.filter(a => a.status === 'cancelled').length, color: 'text-apple-red' },
          ].map(s => (
            <div key={s.label} className="bg-apple-bg border border-apple-separator rounded-2xl p-4 text-center shadow-sm">
              <div className={cn("text-[26px] font-black tabular-nums", s.color)}>{s.value}</div>
              <div className="text-[10px] font-bold text-apple-text-tertiary uppercase tracking-widest mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Desktop: full calendar grid ─────── */}
      <div className="hidden lg:flex gap-6 items-start">

        {/* Calendar panel */}
        <div className="flex-1 min-w-0">
          {viewMode === 'week' ? (
            <div className="bg-apple-bg border border-apple-separator rounded-2xl shadow-sm">
              <div className={cn("flex gap-px bg-apple-separator", !isExporting && "overflow-x-auto")}>
                {weekDays.map((d: any, idx) => (
                  <div key={idx} className="flex-1 bg-apple-bg min-w-[140px]">
                    <DayColumn
                      {...d}
                      appointments={appointments.filter((a: any) => a.date === d.full).sort((a: any, b: any) => a.time.localeCompare(b.time))}
                      onStatusChange={handleStatusChange}
                      onDelete={deleteAppointment}
                      onEdit={(a: Appointment) => handleOpenModal(d.full, a)}
                      onAddClick={(date: string) => handleOpenModal(date)}
                      patients={patients}
                      onQuickAdd={handleQuickAdd}
                      isFirst={idx === 0}
                      isLast={idx === weekDays.length - 1}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <TimelineView date={selectedDate} appointments={todayApts} onStatusChange={handleStatusChange} onDelete={deleteAppointment} onEdit={(a: Appointment) => handleOpenModal(selectedDate, a)} isExporting={isExporting} />
          )}
        </div>

        {/* Stats sidebar */}
        <div className="w-72 shrink-0 flex flex-col gap-4">
          <div className="bg-apple-bg border border-apple-separator rounded-2xl p-6 shadow-sm relative">
            <div className="mb-4">
              <div className="text-[10px] font-bold tracking-widest uppercase text-apple-text-tertiary mb-0.5">Estadísticas</div>
              <h3 className="text-[16px] font-bold text-apple-text">Resumen de Citas</h3>
            </div>
            <StatRow label="Total" value={statsApts.length} color="text-apple-text" />
            <StatRow label="Atendidas" value={statsApts.filter(a => a.status === 'confirmed').length} color="text-apple-green" />
            <StatRow label="Canceladas" value={statsApts.filter(a => a.status === 'cancelled').length} color="text-apple-red" />

            <div className="no-print pt-4 grid grid-cols-2 gap-2">
              <button
                disabled={isExporting}
                onClick={handleExportPDF}
                className={cn(
                  "w-full apple-button apple-button-secondary flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest font-bold py-2.5",
                  isExporting && "opacity-70 cursor-wait"
                )}>
                {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Printer className="w-3.5 h-3.5" />}
                PDF
              </button>
              <button
                disabled={isExporting}
                onClick={handleExportJPG}
                className={cn(
                  "w-full apple-button apple-button-secondary flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest font-bold py-2.5",
                  isExporting && "opacity-70 cursor-wait"
                )}>
                {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
                Imagen
              </button>
            </div>
          </div>

          <div className={cn("bg-gradient-to-br from-apple-blue to-blue-600 rounded-2xl p-6 text-white shadow-md relative overflow-hidden", isExporting && "hidden")}>
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-apple-bg/10 rounded-full blur-2xl" />
            <div className="relative z-10">
              <div className="w-10 h-10 bg-apple-bg/20 rounded-xl flex items-center justify-center mb-4 border border-white/30">
                <CalendarDays className="w-5 h-5 text-white" strokeWidth={1.5} />
              </div>
              <h4 className="font-bold text-white text-[14px] mb-1">
                Hoy — {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
              </h4>
              <p className="text-[12px] text-white/75 leading-relaxed">
                {todayApts.length > 0
                  ? `${todayApts.length} cita${todayApts.length > 1 ? 's' : ''} programada${todayApts.length > 1 ? 's' : ''} para hoy.`
                  : 'Sin citas programadas para hoy.'}
              </p>
              <button
                onClick={() => handleOpenModal(new Date().toISOString().split('T')[0])}
                className="mt-4 w-full bg-apple-bg/20 hover:bg-apple-bg/30 border border-white/30 text-white font-bold text-[11px] uppercase tracking-widest py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all no-print"
              >
                <Plus className="w-3.5 h-3.5" strokeWidth={2.5} /> Agendar hoy
              </button>
            </div>
          </div>
        </div>
      </div>

      {suggestionToConfirm && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 animate-apple">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSuggestionToConfirm(null)} />
          <div className="bg-apple-bg w-full max-w-[400px] rounded-apple shadow-2xl relative z-10 overflow-hidden border border-apple-separator p-8 space-y-6 text-center">
            <div className="w-16 h-16 bg-apple-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-2 text-apple-blue">
              <CalendarDays className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-apple-text tracking-tight">Sugerencia de Agenda</h3>
              <p className="text-[14px] text-apple-text-tertiary mt-2">
                ¿Deseas agendar a <span className="font-bold text-apple-text">{suggestionToConfirm.patient.name}</span> para el <span className="font-bold text-apple-text">{suggestionToConfirm.date}</span>?
              </p>
            </div>
            <div className="space-y-3 pt-2">
              <button
                onClick={confirmQuickAddDirectly}
                className="w-full apple-button apple-button-primary py-3 flex items-center justify-center gap-2 text-[12px] font-bold"
              >
                <CheckCircle2 className="w-4 h-4" /> Sí, Agendar Directo
              </button>
              <button
                onClick={customizeSuggestion}
                className="w-full bg-apple-slate border border-apple-separator text-apple-text py-3 rounded-xl flex items-center justify-center gap-2 text-[12px] font-bold hover:bg-apple-tertiary transition-all"
              >
                <Edit2 className="w-4 h-4" /> Personalizar / Cambiar
              </button>
              <button
                onClick={() => setSuggestionToConfirm(null)}
                className="w-full py-2 text-[11px] font-bold text-apple-text-tertiary hover:text-apple-red transition-all uppercase tracking-widest"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {paymentConfirm && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-6 animate-apple">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md" onClick={() => setPaymentConfirm(null)} />
          <div className="bg-apple-bg w-full max-w-[440px] rounded-3xl shadow-apple-huge relative z-10 overflow-hidden border border-apple-separator p-0 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-apple-slate/30 px-8 py-6 border-b border-apple-separator/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-apple-green rounded-xl flex items-center justify-center text-white shadow-apple-soft">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[17px] font-bold text-apple-text tracking-tight">Confirmar Asistencia</h3>
                  <p className="text-[11px] text-apple-text-tertiary font-bold uppercase tracking-widest">{paymentConfirm.patientName}</p>
                </div>
              </div>
              <button onClick={() => setPaymentConfirm(null)} className="p-2 hover:bg-apple-bg rounded-full transition-colors text-apple-text-tertiary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-apple-text-tertiary px-1">Monto a Cobrar ($)</label>
                  <input
                    type="number"
                    value={payForm.amount}
                    onChange={(e) => setPayForm(s => ({ ...s, amount: e.target.value }))}
                    className="w-full h-14 bg-apple-slate border-2 border-transparent focus:border-apple-blue focus:bg-apple-bg rounded-2xl px-5 text-[24px] font-black tabular-nums transition-all outline-none"
                  />
                  {payForm.expectedMsg && (
                    <p className="px-2 mt-1 text-[11px] font-bold text-apple-blue">{payForm.expectedMsg}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-apple-text-tertiary px-1">Método de Pago</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Efectivo', 'Tarjeta', 'Transferencia'].map(m => (
                      <button
                        key={m}
                        onClick={() => setPayForm(s => ({ ...s, method: m }))}
                        className={cn(
                          "py-3 rounded-xl border-2 text-[11px] font-bold transition-all",
                          payForm.method === m
                            ? "border-apple-blue bg-apple-blue/5 text-apple-blue"
                            : "border-apple-separator/30 bg-apple-bg text-apple-text-tertiary hover:border-apple-separator"
                        )}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  disabled={isSavingPayment}
                  onClick={() => confirmPaymentAction(true)}
                  className="w-full h-14 bg-apple-blue text-white rounded-2xl flex items-center justify-center gap-3 text-[14px] font-bold shadow-apple-soft hover:bg-blue-600 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {isSavingPayment ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirmar y Registrar Pago'}
                </button>
                <button
                  disabled={isSavingPayment}
                  onClick={() => confirmPaymentAction(false)}
                  className="w-full h-14 bg-apple-slate text-apple-text rounded-2xl flex items-center justify-center gap-3 text-[14px] font-bold hover:bg-apple-tertiary active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  Solo Marcar Asistencia
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        patients={patients}
        initialDate={selectedDate}
        appointment={selectedAppointment}
      />
    </div>
  );
}

