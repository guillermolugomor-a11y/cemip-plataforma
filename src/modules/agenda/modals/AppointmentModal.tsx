import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, Briefcase, Check, AlertCircle, ChevronDown } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useAgendaStore } from '../AgendaStore';
import { useSpecialistStore } from '../../specialists/SpecialistStore';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: any[];
  initialDate?: string;
  appointment?: any;
}

const appointmentTypes = [
  'Sesión Terapia',
  'Evaluación',
  'Seguimiento',
  'Entrega de informes'
];

export default function AppointmentModal({ isOpen, onClose, patients, initialDate, appointment }: AppointmentModalProps) {
  const addAppointment = useAgendaStore((state) => state.addAppointment);
  const updateAppointment = useAgendaStore((state) => state.updateAppointment);
  const specialists = useSpecialistStore((state) => state.specialists);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    patientId: '',
    specialistId: '',
    date: initialDate || new Date().toISOString().split('T')[0],
    time: '09:00',
    type: 'Sesión Terapia' as any,
    status: 'pending' as any
  });

  // Reset form when modal opens with new initialDate or appointment
  useEffect(() => {
    if (isOpen) {
      if (appointment) {
        setFormData({
          patientId: appointment.patientId || '',
          specialistId: appointment.specialistId || '',
          date: appointment.date,
          time: appointment.time,
          type: appointment.type,
          status: appointment.status
        });
      } else {
        setFormData({
          patientId: '',
          specialistId: '',
          date: initialDate || new Date().toISOString().split('T')[0],
          time: '09:00',
          type: 'Sesión Terapia',
          status: 'pending'
        });
      }
    }
  }, [isOpen, initialDate, appointment]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!formData.patientId || !formData.date || !formData.time) {
      return; // Basic validation
    }

    setIsSaving(true);
    const patient = patients.find(p => p.id === formData.patientId);
    const specialist = specialists.find(s => s.id === formData.specialistId);

    try {
      const payload = {
        ...formData,
        patientName: patient?.name || 'Paciente',
        specialistName: specialist?.name || 'Especialista'
      };
      if (appointment && appointment.id) {
        await updateAppointment(appointment.id, payload);
      } else {
        await addAppointment(payload);
      }
      onClose();
    } catch (error) {
      console.error('Error saving appointment:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-apple">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="bg-apple-bg w-full max-w-[500px] max-h-[90vh] flex flex-col rounded-apple shadow-2xl relative z-10 border border-apple-separator">
        <div className="px-5 sm:px-8 py-5 sm:py-6 border-b border-apple-separator flex items-center justify-between bg-apple-secondary/30 shrink-0">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-apple-text">{(appointment && appointment.id) ? 'Editar Cita' : 'Nueva Cita'}</h2>
            <p className="description-small uppercase tracking-widest mt-0.5 text-apple-blue font-bold">Programación Clínica</p>
          </div>
          <button onClick={onClose} className="p-2 text-apple-text-tertiary hover:text-apple-text rounded-full hover:bg-apple-bg transition-all">
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        <div className="p-5 sm:p-8 space-y-6 sm:space-y-8 overflow-y-auto">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-apple-text-secondary uppercase tracking-widest px-1">Paciente</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-apple-blue w-4 h-4 pointer-events-none" strokeWidth={1.5} />
              <select
                value={formData.patientId}
                onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                className="w-full bg-apple-tertiary border border-apple-separator/50 rounded-xl py-3 pl-10 pr-10 text-[13px] font-medium text-apple-text focus:ring-1 focus:ring-apple-blue/30 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="">-- Seleccionar Paciente --</option>
                {patients?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-apple-text-tertiary w-4 h-4 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-apple-text-secondary uppercase tracking-widest px-1">Especialista</label>
            <div className="relative">
              <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-apple-blue w-4 h-4 pointer-events-none" strokeWidth={1.5} />
              <select
                value={formData.specialistId}
                onChange={(e) => setFormData({ ...formData, specialistId: e.target.value })}
                className="w-full bg-apple-tertiary border border-apple-separator/50 rounded-xl py-3 pl-10 pr-10 text-[13px] font-medium text-apple-text focus:ring-1 focus:ring-apple-blue/30 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="">-- Seleccionar Especialista --</option>
                {specialists?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-apple-text-tertiary w-4 h-4 pointer-events-none" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-apple-text-secondary uppercase tracking-widest px-1">Fecha</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-apple-blue w-4 h-4 pointer-events-none" strokeWidth={1.5} />
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-apple-tertiary border border-apple-separator/50 rounded-xl py-3 pl-10 pr-4 text-[13px] font-medium text-apple-text focus:ring-1 focus:ring-apple-blue/30 outline-none transition-all cursor-pointer tabular-nums"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-apple-text-secondary uppercase tracking-widest px-1">Hora</label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-apple-blue w-4 h-4 pointer-events-none" strokeWidth={1.5} />
                <select
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full bg-apple-tertiary border border-apple-separator/50 rounded-xl py-3 pl-10 pr-10 text-[13px] font-medium text-apple-text focus:ring-1 focus:ring-apple-blue/30 outline-none transition-all appearance-none cursor-pointer tabular-nums"
                >
                  {Array.from({ length: 13 }, (_, i) => i + 8).map(hour => (
                    <React.Fragment key={hour}>
                      <option value={`${hour.toString().padStart(2, '0')}:00`}>{`${hour}:00`}</option>
                      <option value={`${hour.toString().padStart(2, '0')}:30`}>{`${hour}:30`}</option>
                    </React.Fragment>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-apple-text-tertiary w-4 h-4 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[11px] font-bold text-apple-text-secondary uppercase tracking-widest px-1">Tipo de Servicio</label>
            <div className="flex flex-wrap gap-2">
              {appointmentTypes.map(type => (
                <button
                  key={type}
                  onClick={() => setFormData({ ...formData, type: type as any })}
                  className={cn(
                    "px-4 py-2 rounded-lg text-[10px] font-bold uppercase transition-all border",
                    formData.type === type
                      ? "bg-apple-blue/10 text-apple-blue border-apple-blue/20"
                      : "bg-apple-tertiary text-apple-text-tertiary border-apple-separator/50 hover:bg-apple-secondary"
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex gap-4 shrink-0">
            <button
              onClick={onClose}
              className="flex-1 px-8 py-2.5 text-[11px] font-bold tracking-widest uppercase text-apple-text-secondary hover:text-apple-text transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !formData.patientId || !formData.specialistId}
              className={cn(
                "flex-1 apple-button apple-button-primary py-2.5 text-[11px] uppercase tracking-widest font-bold flex items-center justify-center gap-2",
                (isSaving || !formData.patientId || !formData.specialistId) && "opacity-50 cursor-not-allowed"
              )}
            >
              {isSaving ? (
                'Agendando...'
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Confirmar Cita
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
