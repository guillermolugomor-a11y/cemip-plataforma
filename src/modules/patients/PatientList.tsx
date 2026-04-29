import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  ChevronLeft,
  User,
  ChevronRight,
  Eye,
  Activity,
  Edit2,
  Trash2,
  MessageCircle,
  MoreHorizontal,
  Clock
} from 'lucide-react';
import { cn } from '../../lib/utils';
import RegistrationModal from './RegistrationModal';
import type { Patient, Appointment } from '../../types/clinical';
import { calculateAge, formatDisplayDate, getLocalDateString, formatTime } from '../../lib/dateUtils';

interface PatientListProps {
  patients: Patient[];
  appointments?: Appointment[];
  onPatientSelect: (p: Patient) => void;
  onAddPatient: (p: Patient) => void;
  onUpdatePatient: (p: Patient) => void;
  onDeletePatient: (id: string) => void;
}

export default function PatientList({ 
  patients, 
  appointments = [], 
  onPatientSelect, 
  onAddPatient, 
  onUpdatePatient, 
  onDeletePatient 
}: PatientListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedForEdit, setSelectedForEdit] = useState<Patient | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'Activos' | 'Inactivos' | 'Nuevos'>('Activos');

  const filtered = patients.filter(p =>
    (p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.caseId?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const [isReadOnly, setIsReadOnly] = useState(false);

  const handleEdit = (p: Patient, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedForEdit(p);
    setIsReadOnly(false);
    setIsModalOpen(true);
  };

  const handleView = (p: Patient, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedForEdit(p);
    setIsReadOnly(true);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedForEdit(null);
    setIsReadOnly(false);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDeletePatient(id);
  };

  return (
    <div className="animate-apple pb-32 min-h-screen">
      {/* Mobile Header (New Design) */}
      <div className="lg:hidden flex items-center justify-between px-6 py-6 bg-apple-bg sticky top-0 z-30 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <button className="p-2 text-apple-text hover:bg-apple-slate rounded-full transition-all active:scale-90">
          <ChevronLeft className="w-6 h-6" strokeWidth={2} />
        </button>
        <div className="text-center">
          <div className="text-[10px] font-bold text-apple-text-tertiary uppercase tracking-[0.1em] leading-none mb-1">CEMIP</div>
          <h2 className="text-[20px] font-bold text-apple-text leading-none">Pacientes</h2>
        </div>
        <button className="p-2 text-apple-text hover:bg-apple-slate rounded-full transition-all active:scale-90">
          <User className="w-6 h-6" strokeWidth={2} />
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-0 mt-6 lg:mt-0">
        {/* Desktop Header */}
        <div className="hidden lg:flex items-center justify-between bg-apple-bg border border-apple-separator/20 rounded-[20px] px-8 py-6 mb-6 shadow-apple-soft">
          <h2 className="text-[28px] font-black tracking-tight text-apple-black">Gestión de Pacientes</h2>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 bg-apple-blue hover:bg-apple-blue/90 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-apple-medium active:scale-95"
          >
            <Plus className="w-5 h-5" strokeWidth={3} />
            Nuevo Paciente
          </button>
        </div>

        {/* Filters Bar (New Design) */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="relative flex-1 lg:block hidden">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-apple-text-tertiary w-5 h-5" strokeWidth={2} />
            <input
              type="text"
              placeholder="Buscar por nombre o expediente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-apple-bg border border-apple-separator/20 rounded-2xl py-4 pl-12 pr-6 text-[15px] font-medium text-apple-black focus:ring-1 focus:ring-apple-blue/20 outline-none transition-all shadow-apple-soft placeholder:text-apple-text-tertiary"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0 px-1">
            {['Activos', 'Inactivos', 'Nuevos'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={cn(
                  "px-6 h-[34px] rounded-full text-[14px] font-bold transition-all active:scale-95 whitespace-nowrap flex items-center justify-center border",
                  activeTab === tab 
                    ? "bg-apple-blue text-white shadow-apple-soft border-apple-blue" 
                    : "bg-apple-secondary text-apple-text-tertiary border-apple-separator hover:bg-apple-tertiary hover:text-apple-text"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block bg-apple-bg border border-apple-separator/20 rounded-[20px] overflow-hidden shadow-apple-soft">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-apple-separator/10 bg-apple-slate/20">
                <th className="px-6 py-4 text-left text-[13px] font-bold text-apple-text-tertiary uppercase tracking-wider">Paciente</th>
                <th className="px-6 py-4 text-left text-[13px] font-bold text-apple-text-tertiary uppercase tracking-wider">Edad/Género</th>
                <th className="px-6 py-4 text-left text-[13px] font-bold text-apple-text-tertiary uppercase tracking-wider">Última Visita</th>
                <th className="px-6 py-4 text-left text-[13px] font-bold text-apple-text-tertiary uppercase tracking-wider">Estatus Próxima Cita</th>
                <th className="px-6 py-4 text-right text-[13px] font-bold text-apple-text-tertiary uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-apple-separator/10">
                {filtered.map((patient) => {
                  const patientAppointments = appointments.filter(a => a.patientId === patient.id);
                  const today = getLocalDateString();
                  
                  const lastVisit = [...patientAppointments]
                    .filter(a => a.status === 'completed' && a.date <= today)
                    .sort((a, b) => b.date.localeCompare(a.date))[0];
                    
                  const nextApt = [...patientAppointments]
                    .filter(a => (a.status === 'confirmed' || a.status === 'pending') && a.date >= today)
                    .sort((a, b) => a.date.localeCompare(b.date))[0];

                  return (
                    <tr key={patient.id} className="hover:bg-apple-slate/10 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-apple-slate border border-apple-separator/20 flex items-center justify-center text-apple-blue font-black overflow-hidden shadow-sm group-hover:scale-105 transition-transform">
                            <div className="w-full h-full bg-gradient-to-br from-apple-blue/5 to-apple-blue/20 flex items-center justify-center">
                              {patient.name.charAt(0)}
                            </div>
                          </div>
                          <span className="font-bold text-apple-black text-[15px]">{patient.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[14px] font-medium text-apple-text-secondary">
                          {patient.birthDate ? calculateAge(patient.birthDate) : patient.age} años · {patient.gender?.charAt(0) || 'M'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[14px] font-medium text-apple-text-secondary">
                          {lastVisit ? formatDisplayDate(lastVisit.date) : 'Sin visitas'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className={cn(
                          "inline-flex px-4 py-1.5 rounded-full text-[12px] font-bold",
                          nextApt ? "bg-apple-blue/10 text-apple-blue border border-apple-blue/20" : "bg-apple-slate text-apple-text-tertiary border border-apple-separator/20"
                        )}>
                          {nextApt ? `Próxima: ${formatDisplayDate(nextApt.date)} ${formatTime(nextApt.time)}` : "Sin Cita"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => onPatientSelect(patient)} className="p-2 hover:bg-apple-blue/10 hover:text-apple-blue rounded-lg transition-all" title="Ver Expediente">
                            <Eye className="w-5 h-5" />
                          </button>
                          <button onClick={(e) => handleEdit(patient, e as any)} className="p-2 hover:bg-apple-blue/10 hover:text-apple-blue rounded-lg transition-all" title="Editar">
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button className="p-2 hover:bg-apple-blue/10 hover:text-apple-blue rounded-lg transition-all" title="Mensaje">
                            <MessageCircle className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {/* Patient Cards List (Mobile New Design) */}
        <div className="lg:hidden space-y-4 px-5 mt-6">
          {filtered.length === 0 ? (
            <div className="py-24 flex flex-col items-center justify-center text-center bg-apple-bg border border-dashed border-apple-separator rounded-[28px]">
              <p className="text-[16px] font-bold text-apple-text tracking-tight">Sin resultados</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5">
              {filtered.map((patient) => {
                const patientAppointments = appointments.filter(a => a.patientId === patient.id);
                const today = getLocalDateString();
                
                const lastVisit = [...patientAppointments]
                  .filter(a => a.status === 'completed' && a.date <= today)
                  .sort((a, b) => b.date.localeCompare(a.date))[0];
                  
                const nextApt = [...patientAppointments]
                  .filter(a => (a.status === 'confirmed' || a.status === 'pending') && a.date >= today)
                  .sort((a, b) => a.date.localeCompare(b.date))[0];

                return (
                  <div
                    key={patient.id}
                    onClick={() => onPatientSelect(patient)}
                    className="bg-apple-bg rounded-[28px] p-5 shadow-apple-soft active:scale-[0.98] transition-all cursor-pointer border border-apple-separator/20"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-[18px] font-bold text-apple-text tracking-tight leading-none">{patient.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-medium text-apple-text">{patient.birthDate ? calculateAge(patient.birthDate) : patient.age} años</span>
                        <div className="w-7 h-7 bg-apple-secondary rounded-lg flex items-center justify-center text-[12px] font-bold text-apple-text-tertiary uppercase">
                          {patient.gender?.charAt(0) || 'M'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="text-[14px] font-medium text-apple-text-tertiary">
                        Última Visita: <span className="text-apple-text">{lastVisit ? formatDisplayDate(lastVisit.date) : 'Sin registros'}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <div className={cn(
                          "px-4 py-2 rounded-full text-[11px] font-bold tracking-tight border",
                          nextApt ? "bg-apple-blue/10 text-apple-blue border-apple-blue/20" : "bg-apple-slate text-apple-text-tertiary border border-apple-separator/50"
                        )}>
                          {nextApt ? `PRÓXIMA: ${formatDisplayDate(nextApt.date).toUpperCase()} ${formatTime(nextApt.time)}` : "SIN CITA PENDIENTE"}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <RegistrationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={selectedForEdit ? onUpdatePatient : onAddPatient}
        patient={selectedForEdit}
        isReadOnly={isReadOnly}
      />
    </div>
  );
}
