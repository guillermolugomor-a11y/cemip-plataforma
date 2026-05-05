import React, { useState } from 'react';
import { 
  X, 
  Check, 
  ChevronRight, 
  ChevronLeft,
  User,
  Activity
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Patient } from '../../types/clinical';
import { calculateAge } from '../../lib/dateUtils';
import { toast } from 'sonner';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (patient: Patient) => Promise<void> | void;
  patient?: Patient | null; // Optional for edit mode
  isReadOnly?: boolean;
}

const StepIndicator = ({ currentStep }: { currentStep: number }) => (
  <div className="flex gap-3 mb-10">
    {[1, 2, 3, 4].map((step) => (
      <div 
        key={step}
        className={cn(
          "h-1 rounded-full transition-all duration-700",
          step === currentStep ? "bg-apple-blue w-10" : "bg-apple-separator w-5",
          step < currentStep && "bg-apple-blue opacity-30"
        )}
      />
    ))}
  </div>
);

export default function RegistrationModal({ isOpen, onClose, onSave, patient, isReadOnly = false }: RegistrationModalProps) {
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    lastNamePaterno: '',
    lastNameMaterno: '',
    birthDate: '',
    gender: 'Masculino',
    curp: '',
    tutorName: '',
    relationship: 'Madre',
    phone: '',
    email: '',
    consultReason: '',
    initialNotes: '',
    firstAppointmentDate: '',
    firstAppointmentTime: '',
    attendanceDays: [] as string[],
    appointmentTime: '',
    sessionCost: '',
    requiresInvoice: false,
    schoolName: '',
    schoolPhone: '',
    schoolEmail: '',
    schoolGrade: '',
    schoolGroup: ''
  });

  React.useEffect(() => {
    if (patient && isOpen) {
      setFormData({
        name: patient.name || '',
        lastNamePaterno: patient.lastNamePaterno || '',
        lastNameMaterno: patient.lastNameMaterno || '',
        birthDate: patient.birthDate || '',
        gender: patient.gender || 'Masculino',
        curp: patient.curp || '',
        tutorName: patient.tutor || '',
        relationship: patient.relationship || 'Madre',
        phone: patient.phone || '',
        email: patient.email || '',
        consultReason: patient.consultReason || '',
        initialNotes: patient.initialNotes || '',
        firstAppointmentDate: patient.firstAppointmentDate || '',
        firstAppointmentTime: patient.firstAppointmentTime || '',
        attendanceDays: patient.attendanceDays || [],
        appointmentTime: patient.appointmentTime || '',
        sessionCost: patient.sessionCost || '',
        requiresInvoice: patient.requiresInvoice || false,
        schoolName: patient.schoolName || '',
        schoolPhone: patient.schoolPhone || '',
        schoolEmail: patient.schoolEmail || '',
        schoolGrade: (patient as any).schoolGrade || '',
        schoolGroup: (patient as any).schoolGroup || ''
      });
      setStep(1);
    } else if (!patient && isOpen) {
       setFormData({
        name: '',
        lastNamePaterno: '',
        lastNameMaterno: '',
        birthDate: '',
        gender: 'Masculino',
        curp: '',
        tutorName: '',
        relationship: 'Madre',
        phone: '',
        email: '',
        consultReason: '',
        initialNotes: '',
        firstAppointmentDate: '',
        firstAppointmentTime: '',
        attendanceDays: [],
        appointmentTime: '',
        sessionCost: '',
        requiresInvoice: false,
        schoolName: '',
        schoolPhone: '',
        schoolEmail: '',
        schoolGrade: '',
        schoolGroup: ''
      });
      setStep(1);
    }
  }, [patient, isOpen]);

  if (!isOpen) return null;

  const handleDayToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      attendanceDays: prev.attendanceDays.includes(day)
        ? prev.attendanceDays.filter(d => d !== day)
        : [...prev.attendanceDays, day]
    }));
  };

  const nextStep = () => {
    if (step === 1 && (!formData.name || !formData.lastNamePaterno)) return;
    setStep(s => Math.min(s + 1, 4));
  };
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    const savedData: Patient = {
      ...(patient || {}),
      ...formData,
      name: formData.name.trim(),
      age: formData.birthDate 
        ? calculateAge(formData.birthDate)
        : (patient?.age || 0),
      tutor: formData.tutorName,
      sessionCost: formData.sessionCost ? Number(formData.sessionCost) : 0,
      caseId: patient?.caseId || `EXP-${new Date().getFullYear()}-${Math.floor(Math.random() * 900) + 100}`,
    } as Patient;

    try {
      await onSave(savedData);
      toast.success(patient ? 'Paciente actualizado' : 'Paciente registrado');
      setIsSaving(false);
      onClose();
      setStep(1);
    } catch (error: any) {
      console.error('Error saving patient:', error);
      toast.error(`Error al guardar: ${error.message || 'Error desconocido'}`);
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-apple">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="bg-apple-bg w-full max-w-[800px] max-h-[90vh] flex flex-col rounded-apple shadow-2xl relative z-10 transition-all overflow-hidden border border-apple-separator">
        <div className="px-10 py-6 border-b border-apple-separator flex items-center justify-between bg-apple-secondary/30 shrink-0">
          <div>
             <h2 className="text-xl font-bold tracking-tight text-apple-text">{isReadOnly ? 'Detalles del Paciente' : patient ? 'Editar Paciente' : 'Alta de Paciente'}</h2>
             <p className="description-small uppercase tracking-widest mt-0.5 text-apple-blue font-bold">Expediente Clínico CEMIP</p>
          </div>
          <button onClick={onClose} className="p-2 text-apple-text-tertiary hover:text-apple-text rounded-full hover:bg-apple-bg transition-all">
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        <div className="px-10 py-8 overflow-y-auto flex-1 custom-scrollbar">
          <StepIndicator currentStep={step} />

          <div className="min-h-[380px]">
             <fieldset disabled={isReadOnly} className="contents border-none p-0 m-0 w-full min-w-0">
            {step === 1 && (
              <div className="space-y-8 animate-apple">
                 <div className="description-small font-bold uppercase tracking-widest text-apple-blue">01 / Datos de Identidad</div>
                 
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-apple-text-secondary uppercase tracking-widest px-1">Nombre(s)</label>
                      <input name="name" value={formData.name} onChange={handleInputChange} type="text" className="w-full bg-apple-tertiary border border-apple-separator/50 rounded-lg py-3 px-4 text-[13px] font-medium text-apple-text focus:ring-1 focus:ring-apple-blue/30 outline-none transition-all placeholder:text-apple-text-tertiary" placeholder="Juan" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-apple-text-secondary uppercase tracking-widest px-1">Apellido Paterno</label>
                      <input name="lastNamePaterno" value={formData.lastNamePaterno} onChange={handleInputChange} type="text" className="w-full bg-apple-tertiary border border-apple-separator/50 rounded-lg py-3 px-4 text-[13px] font-medium text-apple-text focus:ring-1 focus:ring-apple-blue/30 outline-none transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-apple-text-secondary uppercase tracking-widest px-1">Apellido Materno</label>
                      <input name="lastNameMaterno" value={formData.lastNameMaterno} onChange={handleInputChange} type="text" className="w-full bg-apple-tertiary border border-apple-separator/50 rounded-lg py-3 px-4 text-[13px] font-medium text-apple-text focus:ring-1 focus:ring-apple-blue/30 outline-none transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-apple-text-secondary uppercase tracking-widest px-1">Nacimiento</label>
                      <input name="birthDate" value={formData.birthDate} onChange={handleInputChange} type="date" className="w-full bg-apple-tertiary border border-apple-separator/50 rounded-lg py-3 px-4 text-[13px] font-medium text-apple-text focus:ring-1 focus:ring-apple-blue/30 outline-none transition-all" />
                    </div>
                 </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8 animate-apple">
                 <div className="description-small font-bold uppercase tracking-widest text-apple-blue">02 / Contacto Responsable</div>
                 
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2 col-span-2">
                      <label className="text-[11px] font-bold text-apple-text-secondary uppercase tracking-widest px-1">Nombre Completo del Tutor</label>
                      <input name="tutorName" value={formData.tutorName} onChange={handleInputChange} type="text" className="w-full bg-apple-tertiary border border-apple-separator/50 rounded-lg py-3 px-4 text-[13px] font-medium text-apple-text" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-apple-text-secondary uppercase tracking-widest px-1">Teléfono</label>
                      <input name="phone" value={formData.phone} onChange={handleInputChange} type="tel" className="w-full bg-apple-tertiary border border-apple-separator/50 rounded-lg py-3 px-4 text-[13px] font-medium text-apple-text" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-apple-text-secondary uppercase tracking-widest px-1">Parentesco</label>
                      <select name="relationship" value={formData.relationship} onChange={handleInputChange} className="w-full bg-apple-tertiary border border-apple-separator/50 rounded-lg py-3 px-4 text-[13px] font-medium text-apple-text appearance-none cursor-pointer outline-none focus:ring-1 focus:ring-apple-blue/30">
                         <option>Madre</option>
                         <option>Padre</option>
                         <option>Tutor Legal</option>
                      </select>
                    </div>

                    <div className="col-span-2 pt-6 border-t border-apple-separator/50 mt-2">
                       <div className="description-small font-bold uppercase tracking-widest text-apple-blue mb-4">Contacto Escolar</div>
                       <div className="grid grid-cols-2 gap-6">
                         <div className="space-y-2 col-span-2">
                           <label className="text-[11px] font-bold text-apple-text-secondary uppercase tracking-widest px-1">Nombre de la Institución</label>
                           <input name="schoolName" value={formData.schoolName} onChange={handleInputChange} type="text" placeholder="Ej. Colegio Interamericano" className="w-full bg-apple-tertiary border border-apple-separator/50 rounded-lg py-3 px-4 text-[13px] font-medium text-apple-text focus:ring-1 focus:ring-apple-blue/30 outline-none transition-all placeholder:text-apple-text-tertiary" />
                         </div>
                         <div className="space-y-2">
                           <label className="text-[11px] font-bold text-apple-text-secondary uppercase tracking-widest px-1">Teléfono (Escuela)</label>
                           <input name="schoolPhone" value={formData.schoolPhone} onChange={handleInputChange} type="tel" placeholder="777 000 0000" className="w-full bg-apple-tertiary border border-apple-separator/50 rounded-lg py-3 px-4 text-[13px] font-medium text-apple-text focus:ring-1 focus:ring-apple-blue/30 outline-none transition-all placeholder:text-apple-text-tertiary" />
                         </div>
                         <div className="space-y-2">
                           <label className="text-[11px] font-bold text-apple-text-secondary uppercase tracking-widest px-1">Correo (Escuela)</label>
                           <input name="schoolEmail" value={formData.schoolEmail} onChange={handleInputChange} type="email" placeholder="contacto@escuela.com" className="w-full bg-apple-tertiary border border-apple-separator/50 rounded-lg py-3 px-4 text-[13px] font-medium text-apple-text focus:ring-1 focus:ring-apple-blue/30 outline-none transition-all placeholder:text-apple-text-tertiary" />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[11px] font-bold text-apple-text-secondary uppercase tracking-widest px-1">Grado</label>
                            <input name="schoolGrade" value={formData.schoolGrade} onChange={handleInputChange} type="text" placeholder="Ej: 2do Primaria" className="w-full bg-apple-tertiary border border-apple-separator/50 rounded-lg py-3 px-4 text-[13px] font-medium text-apple-text focus:ring-1 focus:ring-apple-blue/30 outline-none transition-all placeholder:text-apple-text-tertiary" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[11px] font-bold text-apple-text-secondary uppercase tracking-widest px-1">Grupo</label>
                            <input name="schoolGroup" value={formData.schoolGroup} onChange={handleInputChange} type="text" placeholder="Ej: B" className="w-full bg-apple-tertiary border border-apple-separator/50 rounded-lg py-3 px-4 text-[13px] font-medium text-apple-text focus:ring-1 focus:ring-apple-blue/30 outline-none transition-all placeholder:text-apple-text-tertiary" />
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8 animate-apple">
                 <div className="description-small font-bold uppercase tracking-widest text-apple-blue">03 / Motivo y Primera Sesión</div>
                 <div className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[11px] font-bold text-apple-text-secondary uppercase tracking-widest px-1">Motivo de Consulta</label>
                      <input name="consultReason" value={formData.consultReason} onChange={handleInputChange} type="text" placeholder="Ansiedad" className="w-full bg-apple-tertiary border border-apple-separator/50 rounded-lg py-3 px-4 text-[13px] font-medium text-apple-text placeholder:text-apple-text-tertiary" />
                   </div>
                   
                   <div className="space-y-6">
                     <div className="space-y-2">
                        <label className="text-[11px] font-bold text-apple-text-secondary uppercase tracking-widest px-1">Días de Asistencia</label>
                        <div className="flex flex-wrap gap-2">
                          {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'].map(day => (
                            <button
                              key={day}
                              type="button"
                              onClick={() => handleDayToggle(day)}
                              className={cn(
                                "px-5 py-2.5 rounded-2xl text-[12px] font-medium transition-all border",
                                formData.attendanceDays.includes(day)
                                  ? "bg-apple-blue border-apple-blue text-white shadow-sm"
                                  : "bg-apple-tertiary hover:bg-apple-secondary border-apple-separator/50 text-apple-text-secondary hover:text-apple-text"
                              )}
                            >
                              {day}
                            </button>
                          ))}
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[11px] font-bold text-apple-text-secondary uppercase tracking-widest px-1">Horario de Cita</label>
                        <select 
                          name="appointmentTime" 
                          value={formData.appointmentTime} 
                          onChange={handleInputChange} 
                          className="w-full bg-apple-tertiary border border-apple-separator/50 rounded-xl py-3 px-4 text-[13px] font-medium text-apple-text focus:outline-none focus:ring-1 focus:ring-apple-blue/30 transition-all appearance-none cursor-pointer"
                        >
                          <option value="">Seleccionar horario...</option>
                          {['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00'].map(t => (
                            <option key={t} value={t}>{t} hrs</option>
                          ))}
                        </select>
                     </div>
                   </div>

                   <div className="space-y-2">
                      <label className="text-[11px] font-bold text-apple-text-secondary uppercase tracking-widest px-1">Costo de Sesión *</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[13px] font-medium text-apple-text-secondary">$</span>
                        <input name="sessionCost" value={formData.sessionCost} onChange={handleInputChange} type="text" placeholder="500" className="w-full bg-apple-tertiary border border-apple-separator/50 rounded-lg py-3 pl-8 pr-4 text-[13px] font-medium text-apple-text placeholder:text-apple-text-tertiary" />
                      </div>
                   </div>

                   <div className="flex items-center justify-between bg-apple-tertiary p-4 rounded-lg border border-apple-separator/50 mt-2">
                     <div>
                       <label className="text-[13px] font-bold text-apple-text">Requiere Factura</label>
                       <p className="text-[11px] text-apple-text-secondary mt-0.5">¿El paciente solicita factura fiscal?</p>
                     </div>
                     <button
                       type="button"
                       onClick={() => setFormData(prev => ({ ...prev, requiresInvoice: !prev.requiresInvoice }))}
                       className={cn(
                         "w-11 h-6 rounded-full transition-colors relative focus:outline-none focus:ring-2 focus:ring-apple-blue/50",
                         formData.requiresInvoice ? "bg-apple-blue" : "bg-apple-separator"
                       )}
                     >
                       <div className={cn(
                         "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-apple-bg transition-transform shadow-sm",
                         formData.requiresInvoice ? "translate-x-5" : "translate-x-0"
                       )} />
                     </button>
                   </div>

                   <div className="space-y-2">
                      <label className="text-[11px] font-bold text-apple-text-secondary uppercase tracking-widest px-1">Información Clínica Inicial</label>
                      <textarea name="initialNotes" value={formData.initialNotes} onChange={handleInputChange} rows={4} placeholder="Antecedentes relevantes..." className="w-full bg-apple-tertiary border border-apple-separator/50 rounded-lg py-3 px-4 text-[13px] font-medium text-apple-text resize-none placeholder:text-apple-text-tertiary" />
                   </div>
                 </div>
              </div>
            )}

            {step === 4 && (
              <div className="flex flex-col items-center justify-center text-center space-y-6 animate-apple py-8">
                 <div className="w-16 h-16 bg-apple-green/10 rounded-full flex items-center justify-center border border-apple-green/20">
                    <Check className="text-apple-green w-8 h-8" strokeWidth={2} />
                 </div>
                 <div>
                    <h3 className="text-xl font-bold text-apple-text">Verificar Registro</h3>
                    <p className="description-small mt-1">Los datos se almacenarán en el servidor clínico central.</p>
                 </div>
                 
                 <div className="bg-apple-secondary border border-apple-separator p-6 rounded-apple w-full max-w-sm text-left">
                    <div className="space-y-3">
                      <div className="text-[10px] font-black text-apple-text-tertiary uppercase tracking-widest border-b border-apple-separator pb-2 mb-2">Perfil de Alta</div>
                      <div className="text-[13px] font-bold text-apple-text leading-tight">{formData.name} {formData.lastNamePaterno}</div>
                      <div className="text-[11px] font-medium text-apple-text-secondary italic">{formData.consultReason || 'Motivo pendiente de definir'}</div>
                    </div>
                 </div>
              </div>
            )}
             </fieldset>
          </div>
        </div>

        <div className="px-10 py-5 border-t border-apple-separator flex items-center justify-between shrink-0 bg-apple-bg">
            <button 
              onClick={step === 1 ? onClose : prevStep}
              className="px-6 py-2 text-[11px] font-bold tracking-widest uppercase text-apple-text-secondary hover:text-apple-text transition-all"
            >
              {step === 1 ? (isReadOnly ? 'Cerrar' : 'Cancelar') : 'Anterior'}
            </button>
            <button 
              onClick={isReadOnly && step === 4 ? onClose : (step === 4 ? handleSave : nextStep)}
              disabled={isSaving}
              className="apple-button apple-button-primary px-8 py-2.5 flex items-center gap-2"
            >
              {isSaving ? (
                <Activity className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <span className="text-[11px] uppercase tracking-widest">{isReadOnly && step === 4 ? 'Cerrar' : (step === 4 ? 'Confirmar' : 'Siguiente')}</span>
                  {step < 4 && <ChevronRight className="w-3.5 h-3.5" strokeWidth={2} />}
                </>
              )}
            </button>
          </div>
      </div>
    </div>
  );
}
