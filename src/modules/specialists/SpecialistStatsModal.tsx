import React, { useState, useMemo } from 'react';
import { 
  X, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Users, 
  Search,
  Filter,
  BarChart3,
  CalendarDays,
  ChevronRight,
  TrendingUp,
  ArrowUpRight
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAgendaStore } from '../agenda/AgendaStore';
import type { Specialist } from './SpecialistStore';
import { formatTime } from '../../lib/dateUtils';

interface SpecialistStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  specialist: Specialist;
}

export default function SpecialistStatsModal({ isOpen, onClose, specialist }: SpecialistStatsModalProps) {
  const { appointments } = useAgendaStore();
  const [filterDate, setFilterDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');

  const specialistAppointments = useMemo(() => {
    return appointments.filter(a => a.specialistId === specialist.id);
  }, [appointments, specialist.id]);

  const totalAttended = useMemo(() => {
    return specialistAppointments.filter(a => a.status === 'completed').length;
  }, [specialistAppointments]);

  const dateAppointments = useMemo(() => {
    return specialistAppointments.filter(a => a.date === filterDate);
  }, [specialistAppointments, filterDate]);

  const filteredDateAppointments = useMemo(() => {
    if (!searchTerm) return dateAppointments;
    return dateAppointments.filter(a => 
      a.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.type || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [dateAppointments, searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div 
        className="absolute inset-0 bg-apple-slate/60 backdrop-blur-md transition-opacity duration-300" 
        onClick={onClose} 
      />
      
      <div className="relative w-full max-w-2xl bg-apple-bg sm:rounded-[32px] rounded-t-[32px] shadow-apple-huge border border-apple-separator/30 overflow-hidden animate-apple flex flex-col max-h-[95vh] sm:max-h-[90vh] ring-1 ring-black/5">
        
        {/* Header Decorator */}
        <div className="h-1.5 w-full bg-gradient-to-r from-apple-blue via-indigo-500 to-purple-500 shrink-0" />

        {/* Header */}
        <div className="px-6 py-6 border-b border-apple-separator/20 bg-apple-slate/5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-apple-blue to-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-lg shadow-apple-blue/20">
                {specialist.name.charAt(0)}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-apple-green rounded-full border-4 border-apple-bg shadow-sm flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              </div>
            </div>
            <div>
              <h3 className="text-[17px] font-bold text-apple-text tracking-tight leading-tight">{specialist.name}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-apple-blue bg-apple-blue/10 px-2 py-0.5 rounded-md">{specialist.specialty}</span>
                <span className="w-1 h-1 bg-apple-separator/40 rounded-full" />
                <span className="text-[10px] font-bold text-apple-text-tertiary">Actividad Clínica</span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2.5 hover:bg-apple-slate/50 rounded-2xl transition-all text-apple-text-tertiary active:scale-95 group"
          >
            <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar space-y-8 flex-1">
          
          {/* Dashboard Style Stats */}
          <div className="flex overflow-x-auto no-scrollbar gap-4 pb-2 -mx-6 px-6 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 sm:gap-4 snap-x">
            {[
              { 
                label: 'Total Sesiones', 
                value: totalAttended, 
                sub: 'Histórico', 
                icon: BarChart3, 
                color: 'text-apple-blue', 
                bg: 'bg-apple-blue/5', 
                border: 'border-apple-blue/10' 
              },
              { 
                label: 'Hoy', 
                value: specialistAppointments.filter(a => a.date === new Date().toISOString().split('T')[0]).length, 
                sub: 'Programadas', 
                icon: CalendarDays, 
                color: 'text-emerald-500', 
                bg: 'bg-emerald-50', 
                border: 'border-emerald-100' 
              },
              { 
                label: 'Pacientes', 
                value: new Set(specialistAppointments.map(a => a.patientId)).size, 
                sub: 'Únicos', 
                icon: Users, 
                color: 'text-amber-500', 
                bg: 'bg-amber-50', 
                border: 'border-amber-100' 
              }
            ].map((stat, idx) => (
              <div key={idx} className={cn("min-w-[160px] flex-1 sm:min-w-0 rounded-[24px] p-5 border transition-all hover:scale-[1.02] active:scale-[0.98] cursor-default snap-center", stat.bg, stat.border)}>
                <div className="flex items-center justify-between mb-3">
                  <div className={cn("p-2 rounded-xl bg-white shadow-sm", stat.color)}>
                    <stat.icon className="w-4 h-4" />
                  </div>
                  <TrendingUp className="w-3.5 h-3.5 text-apple-text-tertiary/30" />
                </div>
                <div className="text-[28px] font-black tracking-tighter text-apple-black leading-none">{stat.value}</div>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.1em] text-apple-text-tertiary">{stat.label}</span>
                  <div className="w-1 h-1 bg-apple-separator/40 rounded-full" />
                  <span className={cn("text-[9px] font-bold", stat.color)}>{stat.sub}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Activity Logs Section */}
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-apple-slate/10 flex items-center justify-center text-apple-text">
                  <Filter className="w-4 h-4" />
                </div>
                <h4 className="text-[15px] font-bold tracking-tight text-apple-text">Historial de Sesiones</h4>
              </div>
              <div className="flex items-center gap-2 bg-apple-slate/10 p-1 rounded-2xl border border-apple-separator/20">
                <div className="pl-3 py-1 text-[10px] font-black uppercase tracking-widest text-apple-text-tertiary">Fecha:</div>
                <input 
                  type="date" 
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="bg-apple-bg border border-apple-separator/50 rounded-xl px-4 py-2 text-[12px] font-bold text-apple-text outline-none focus:ring-2 focus:ring-apple-blue/20 transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-apple-text-tertiary w-4 h-4 transition-colors group-focus-within:text-apple-blue" />
              <input 
                type="text" 
                placeholder="Buscar paciente, tipo de terapia..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-apple-slate/5 border border-apple-separator/30 rounded-2xl py-3.5 pl-12 pr-4 text-[13px] text-apple-text outline-none focus:ring-4 focus:ring-apple-blue/5 focus:bg-apple-bg transition-all font-medium placeholder:text-apple-text-tertiary"
              />
            </div>

            {/* Appointment Cards List */}
            <div className="space-y-3 pb-4">
              {filteredDateAppointments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-apple-text-tertiary bg-apple-slate/5 rounded-[32px] border-2 border-dashed border-apple-separator/30 transition-all hover:bg-apple-slate/10">
                  <div className="w-16 h-16 bg-apple-bg rounded-3xl flex items-center justify-center shadow-sm mb-4">
                    <Calendar className="w-8 h-8 opacity-20" />
                  </div>
                  <p className="text-[12px] font-bold uppercase tracking-[0.15em] opacity-60">Sin registros para esta fecha</p>
                  <p className="text-[10px] font-medium mt-1 opacity-40">Intenta seleccionar otro día del calendario</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {filteredDateAppointments.map((apt) => (
                    <div key={apt.id} className="flex items-center justify-between p-5 bg-apple-bg border border-apple-separator/40 rounded-[24px] hover:shadow-apple-soft transition-all hover:border-apple-blue/20 group cursor-default">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-12 h-12 rounded-2xl bg-apple-slate/10 flex flex-col items-center justify-center shrink-0 group-hover:bg-apple-blue group-hover:text-white transition-all duration-300">
                          <span className="text-[11px] font-black tabular-nums leading-none mb-0.5">{formatTime(apt.time).split(' ')[0]}</span>
                          <span className="text-[8px] font-black uppercase leading-none opacity-60">{formatTime(apt.time).split(' ')[1]}</span>
                        </div>
                        <div className="min-w-0">
                          <div className="text-[14px] font-bold text-apple-text leading-none mb-1.5 truncate group-hover:text-apple-blue transition-colors">{apt.patientName}</div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-apple-text-tertiary uppercase tracking-tighter bg-apple-slate/10 px-1.5 py-0.5 rounded leading-none">{apt.type || 'Sesión'}</span>
                            <ArrowUpRight className="w-3 h-3 text-apple-text-tertiary/40" />
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <div className={cn(
                          "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 border transition-all",
                          apt.status === 'completed' ? "bg-apple-green/10 text-apple-green border-apple-green/20" : 
                          apt.status === 'cancelled' ? "bg-apple-red/5 text-apple-red border-apple-red/10" : "bg-apple-blue/5 text-apple-blue border-apple-blue/10"
                        )}>
                          <div className={cn("w-1.5 h-1.5 rounded-full", 
                            apt.status === 'completed' ? "bg-apple-green animate-pulse" : 
                            apt.status === 'cancelled' ? "bg-apple-red" : "bg-apple-blue"
                          )} />
                          {apt.status === 'completed' ? 'Finalizada' : apt.status === 'cancelled' ? 'Cancelada' : 'En Espera'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="px-6 py-5 border-t border-apple-separator/20 bg-apple-slate/5 flex items-center justify-between shrink-0 sm:rounded-b-[32px]">
          <div className="hidden sm:flex items-center gap-2 text-apple-text-tertiary">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold">Última actualización: hace un momento</span>
          </div>
          <button 
            onClick={onClose}
            className="apple-button apple-button-primary w-full sm:w-auto px-10 py-3 text-[12px] font-bold shadow-lg shadow-apple-blue/20"
          >
            Cerrar Actividad
          </button>
        </div>
      </div>
    </div>
  );
}

