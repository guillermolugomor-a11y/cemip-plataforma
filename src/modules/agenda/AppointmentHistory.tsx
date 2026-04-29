import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  User, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  FileText,
  Download,
  CalendarDays,
  ArrowUpDown,
  History
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAgendaStore } from './AgendaStore';
import { usePatientStore } from '../patients/PatientStore';
import { useSpecialistStore } from '../specialists/SpecialistStore';
import { formatDisplayDate, formatTime } from '../../lib/dateUtils';
import type { Appointment } from '../../types/clinical';
import { toast } from 'sonner';

const statusConfig: any = {
  confirmed: { 
    label: 'Confirmada', 
    cls: 'bg-apple-blue/10 text-apple-blue border-apple-blue/20', 
    icon: CheckCircle2 
  },
  pending: { 
    label: 'Pendiente', 
    cls: 'bg-amber-500/10 text-amber-500 border-amber-500/20', 
    icon: Clock 
  },
  completed: { 
    label: 'Asistió', 
    cls: 'bg-apple-green/10 text-apple-green border-apple-green/20', 
    icon: CheckCircle2 
  },
  cancelled: { 
    label: 'Cancelada', 
    cls: 'bg-apple-slate text-apple-text-tertiary border-apple-separator/50', 
    icon: XCircle 
  },
};

export default function AppointmentHistory({ patientId }: { patientId?: string }) {
  const appointments = useAgendaStore(state => state.appointments);
  const updateStatus = useAgendaStore(state => state.updateStatus);
  const { patients } = usePatientStore();
  const { specialists } = useSpecialistStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateSort, setDateSort] = useState<'desc' | 'asc'>('desc');
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const resolvedAppointments = useMemo(() => {
    return appointments.map(apt => {
      const patient = patients.find(p => p.id === apt.patientId);
      const specialist = specialists.find(s => s.id === apt.specialistId);
      return {
        ...apt,
        patientName: patient?.name || 'Paciente',
        specialistName: specialist?.name || 'Especialista'
      };
    });
  }, [appointments, patients, specialists]);

  const filteredAppointments = useMemo(() => {
    return resolvedAppointments
      .filter(apt => {
        const matchesPatient = !patientId || apt.patientId === patientId;
        const matchesSearch = 
          apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          apt.specialistName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          apt.type.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
        
        return matchesPatient && matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`).getTime();
        const dateB = new Date(`${b.date}T${b.time}`).getTime();
        return dateSort === 'desc' ? dateB - dateA : dateA - dateB;
      });
  }, [resolvedAppointments, searchQuery, statusFilter, dateSort, patientId]);

  const stats = useMemo(() => {
    return {
      total: filteredAppointments.length,
      completed: filteredAppointments.filter(a => a.status === 'completed').length,
      confirmed: filteredAppointments.filter(a => a.status === 'confirmed').length,
      pending: filteredAppointments.filter(a => a.status === 'pending').length,
      cancelled: filteredAppointments.filter(a => a.status === 'cancelled').length,
    };
  }, [filteredAppointments]);

  return (
    <div className={cn("animate-apple space-y-6 pb-20 max-w-7xl mx-auto", !patientId && "px-4 sm:px-6")}>
      {/* Header Section */}
      {!patientId && (
        <>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-apple-black rounded-2xl flex items-center justify-center shadow-apple-medium">
                <History className="text-apple-bg w-6 h-6" />
              </div>
              <div>
                <h1 className="text-[28px] font-black tracking-tight text-apple-text">Historial de Citas</h1>
                <p className="text-[14px] font-medium text-apple-text-tertiary">Registro completo de sesiones y asistencias</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-4 py-2.5 bg-apple-bg border border-apple-separator rounded-xl text-[12px] font-bold text-apple-text-secondary hover:bg-apple-tertiary transition-all shadow-apple-soft">
                <Download className="w-4 h-4" /> Exportar Reporte
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: 'Total', value: stats.total, color: 'text-apple-text', bg: 'bg-apple-bg' },
              { label: 'Asistidas', value: stats.completed, color: 'text-apple-green', bg: 'bg-apple-green/10' },
              { label: 'Confirmadas', value: stats.confirmed, color: 'text-apple-blue', bg: 'bg-apple-blue/10' },
              { label: 'Pendientes', value: stats.pending, color: 'text-amber-500', bg: 'bg-amber-500/10' },
              { label: 'Canceladas', value: stats.cancelled, color: 'text-apple-text-tertiary', bg: 'bg-apple-slate' },
            ].map((s) => (
              <div key={s.label} className={cn("p-4 rounded-2xl border border-apple-separator/50 shadow-apple-soft transition-all hover:scale-[1.02]", s.bg)}>
                <div className="text-[10px] font-black tracking-widest uppercase text-apple-text-tertiary opacity-60 mb-1">{s.label}</div>
                <div className={cn("text-[24px] font-black tracking-tight tabular-nums", s.color)}>{s.value}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Filters Bar */}
      <div className="bg-apple-bg/80 backdrop-blur-xl border border-apple-separator/30 rounded-2xl p-4 shadow-apple-soft space-y-4 md:space-y-0 md:flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-apple-text-tertiary w-4 h-4" />
          <input 
            type="text" 
            placeholder="Buscar por paciente, especialista o tipo de cita..."
            className="w-full bg-apple-slate/50 border border-apple-separator/30 rounded-xl py-2.5 pl-11 pr-4 text-[13px] font-medium focus:bg-apple-bg focus:ring-4 focus:ring-apple-blue/5 outline-none transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-apple-slate/50 p-1 rounded-xl border border-apple-separator/30">
            <button 
              onClick={() => setStatusFilter('all')}
              className={cn("px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all", statusFilter === 'all' ? "bg-apple-bg text-apple-black shadow-sm" : "text-apple-text-tertiary hover:text-apple-black")}
            >
              Todos
            </button>
            <button 
              onClick={() => setStatusFilter('completed')}
              className={cn("px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all", statusFilter === 'completed' ? "bg-apple-bg text-emerald-600 shadow-sm" : "text-apple-text-tertiary hover:text-emerald-600")}
            >
              Asistió
            </button>
            <button 
              onClick={() => setStatusFilter('cancelled')}
              className={cn("px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all", statusFilter === 'cancelled' ? "bg-apple-bg text-apple-red shadow-sm" : "text-apple-text-tertiary hover:text-apple-red")}
            >
              Cancelada
            </button>
          </div>

          <button 
            onClick={() => setDateSort(v => v === 'desc' ? 'asc' : 'desc')}
            className="flex items-center gap-2 px-4 py-2.5 bg-apple-bg border border-apple-separator rounded-xl text-[12px] font-bold text-apple-text-secondary hover:bg-apple-tertiary transition-all shadow-sm"
          >
            <ArrowUpDown className="w-4 h-4" /> 
            {dateSort === 'desc' ? 'Más recientes' : 'Más antiguas'}
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-apple-bg border border-apple-separator/30 rounded-[24px] overflow-hidden shadow-apple-huge animate-apple">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-apple-slate/30 border-b border-apple-separator/20">
                <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-[0.1em] text-apple-text-tertiary">Fecha y Hora</th>
                <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-[0.1em] text-apple-text-tertiary">Paciente</th>
                <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-[0.1em] text-apple-text-tertiary">Especialista</th>
                <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-[0.1em] text-apple-text-tertiary">Servicio</th>
                <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-[0.1em] text-apple-text-tertiary">Estado</th>
                <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-[0.1em] text-apple-text-tertiary">Pago</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-apple-separator/10">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <CalendarDays className="w-12 h-12 text-apple-separator mx-auto mb-4" />
                    <p className="text-[15px] font-bold text-apple-text-tertiary">No se encontraron citas con estos filtros</p>
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((apt) => {
                  const sc = statusConfig[apt.status] || statusConfig.pending;
                  const Icon = sc.icon;
                  
                  return (
                    <tr key={apt.id} className="hover:bg-apple-slate/20 transition-all group">
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="text-[14px] font-bold text-apple-black tabular-nums">{formatDisplayDate(apt.date)}</span>
                          <span className="text-[11px] font-bold text-apple-text-tertiary opacity-70 uppercase flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {formatTime(apt.time)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-apple-blue/10 text-apple-blue flex items-center justify-center text-[11px] font-black transition-transform group-hover:scale-110">
                            {apt.patientName.charAt(0)}
                          </div>
                          <span className="text-[14px] font-bold text-apple-black tracking-tight">{apt.patientName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-apple-text-tertiary opacity-40" />
                          <span className="text-[13px] font-medium text-apple-text-secondary">{apt.specialistName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="px-2 py-1 bg-apple-slate text-[10px] font-bold uppercase tracking-widest text-apple-text-tertiary rounded-lg border border-apple-separator/30">
                          {apt.type}
                        </span>
                      </td>
                      <td className="px-6 py-5 relative">
                        <button 
                          onClick={() => setOpenDropdownId(openDropdownId === apt.id ? null : apt.id)}
                          className={cn(
                            "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[11px] font-bold hover:scale-[1.02] active:scale-[0.98] transition-all", 
                            sc.cls
                          )}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          {sc.label}
                        </button>

                        {openDropdownId === apt.id && (
                          <>
                            <div 
                              className="fixed inset-0 z-50" 
                              onClick={() => setOpenDropdownId(null)} 
                            />
                            <div className="absolute left-6 top-[70%] z-[60] min-w-[160px] bg-white rounded-2xl border border-apple-separator/30 shadow-apple-huge p-2 animate-apple">
                              <div className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-apple-text-tertiary border-b border-apple-separator/20 mb-1">
                                Cambiar Estado
                              </div>
                              {Object.entries(statusConfig).map(([key, config]: [string, any]) => {
                                const StatusIcon = config.icon;
                                return (
                                  <button
                                    key={key}
                                    onClick={async () => {
                                      try {
                                        await updateStatus(apt.id, key as any);
                                        toast.success('Estado actualizado correctamente');
                                        setOpenDropdownId(null);
                                      } catch (error) {
                                        toast.error('No se pudo actualizar el estado');
                                        console.error(error);
                                      }
                                    }}
                                    className={cn(
                                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[12px] font-bold transition-all text-left",
                                      apt.status === key ? "bg-apple-slate text-apple-black" : "text-apple-text-secondary hover:bg-apple-slate"
                                    )}
                                  >
                                    <div className={cn("w-5 h-5 rounded-lg flex items-center justify-center bg-white border border-apple-separator/20 shadow-sm", config.cls.split(' ')[1])}>
                                      <StatusIcon className="w-3 h-3" />
                                    </div>
                                    {config.label}
                                  </button>
                                );
                              })}
                            </div>
                          </>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        {apt.isPaid || apt.isAccountingLogged ? (
                          <div className="flex items-center gap-2 text-emerald-600">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="text-[11px] font-bold uppercase tracking-widest">Pagado</span>
                          </div>
                        ) : apt.status === 'completed' ? (
                          <div className="flex items-center gap-2 text-apple-red">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-[11px] font-bold uppercase tracking-widest">Pendiente Pago</span>
                          </div>
                        ) : (
                          <span className="text-[11px] font-bold text-apple-text-tertiary opacity-40 italic">--</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer info */}
        <div className="bg-apple-slate/20 px-6 py-4 flex items-center justify-between border-t border-apple-separator/10">
          <p className="text-[11px] font-bold text-apple-text-tertiary uppercase tracking-widest">
            Mostrando {filteredAppointments.length} de {appointments.length} registros
          </p>
          <div className="flex items-center gap-4">
            <button className="text-[11px] font-bold text-apple-blue hover:underline uppercase tracking-widest">Ver todo el historial</button>
          </div>
        </div>
      </div>
    </div>
  );
}
