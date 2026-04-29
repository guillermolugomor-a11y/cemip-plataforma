import React, { useState, useEffect } from 'react';
import { X, User, Briefcase, Check, Landmark, ChevronDown, Mail } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useSpecialistStore } from './SpecialistStore';
import type { Specialist } from './SpecialistStore';

interface SpecialistModalProps {
  isOpen: boolean;
  onClose: () => void;
  specialist?: Specialist; // Optional for edit mode
}

export default function SpecialistModal({ isOpen, onClose, specialist }: SpecialistModalProps) {
  const addSpecialist = useSpecialistStore((state) => state.addSpecialist);
  const updateSpecialist = useSpecialistStore((state) => state.updateSpecialist);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    specialty: 'Psicología General',
    bankInfo: '',
    paymentSchema: 'Porcentaje' as 'Porcentaje' | 'Sueldo Fijo',
    paymentValue: 60,
    status: 'Inactivo' as 'Activo' | 'Inactivo'
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (specialist) {
      setFormData({
        name: specialist.name,
        email: specialist.email,
        specialty: specialist.specialty,
        bankInfo: specialist.bankInfo,
        paymentSchema: specialist.paymentSchema,
        paymentValue: specialist.paymentValue,
        status: specialist.status
      });
    } else {
      setFormData({
        name: '',
        email: '',
        specialty: 'Psicología General',
        bankInfo: '',
        paymentSchema: 'Porcentaje',
        paymentValue: 60,
        status: 'Inactivo'
      });
    }
  }, [specialist, isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!formData.name || !formData.email) {
      return;
    }

    setIsSaving(true);
    try {
      if (specialist) {
        await updateSpecialist(specialist.id, formData);
      } else {
        await addSpecialist(formData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving specialist:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-apple">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-all" onClick={onClose} />
      
      <div className="bg-apple-bg w-full max-w-[500px] rounded-apple shadow-2xl relative z-10 transition-all overflow-hidden border border-apple-separator">
        <div className="px-8 py-6 border-b border-apple-separator flex items-center justify-between bg-apple-secondary/30">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-apple-text">{specialist ? 'Editar Especialista' : 'Nuevo Especialista'}</h2>
            <p className="description-small uppercase tracking-widest mt-0.5 text-apple-blue font-bold">Admin CEMIP</p>
          </div>
          <button onClick={onClose} className="p-2 text-apple-text-tertiary hover:text-apple-text rounded-full hover:bg-apple-bg transition-all">
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        <div className="p-10 space-y-8">
           <div className="space-y-2">
              <label className="text-[11px] font-bold text-apple-text-secondary uppercase tracking-widest px-1">Nombre Completo</label>
              <div className="relative">
                 <User className="absolute left-4 top-1/2 -translate-y-1/2 text-apple-blue w-4 h-4 pointer-events-none" strokeWidth={1.5} />
                 <input 
                   type="text" 
                   value={formData.name}
                   onChange={(e) => setFormData({...formData, name: e.target.value})}
                   placeholder="Daniela Olivares"
                   className="w-full bg-apple-tertiary border border-apple-separator/50 rounded-xl py-3 pl-10 pr-6 text-[13px] font-medium text-apple-text focus:ring-1 focus:ring-apple-blue/30 outline-none transition-all placeholder:text-apple-text-tertiary" 
                 />
              </div>
           </div>

           <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-apple-text-secondary uppercase tracking-widest px-1">Email</label>
                <div className="relative">
                   <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-apple-blue w-4 h-4 pointer-events-none" strokeWidth={1.5} />
                   <input 
                     type="email" 
                     value={formData.email}
                     onChange={(e) => setFormData({...formData, email: e.target.value})}
                     className="w-full bg-apple-tertiary border border-apple-separator/50 rounded-xl py-3 pl-10 pr-4 text-[13px] font-medium text-apple-text focus:ring-1 focus:ring-apple-blue/30 outline-none transition-all" 
                   />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-apple-text-secondary uppercase tracking-widest px-1">Especialidad</label>
                <div className="relative">
                   <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-apple-blue w-4 h-4 pointer-events-none" strokeWidth={1.5} />
                   <select 
                    value={formData.specialty}
                    onChange={(e) => setFormData({...formData, specialty: e.target.value})}
                    className="w-full bg-apple-tertiary border border-apple-separator/50 rounded-xl py-3 pl-10 pr-8 text-[13px] font-medium text-apple-text outline-none focus:ring-1 focus:ring-apple-blue/30 transition-all appearance-none cursor-pointer"
                   >
                    <option value="Psicología General">Psicología General</option>
                    <option value="Neuropsicología">Neuropsicología</option>
                    <option value="Terapia de Lenguaje">Terapia de Lenguaje</option>
                    <option value="Psiquiatría">Psiquiatría</option>
                   </select>
                   <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-apple-text-tertiary w-4 h-4 pointer-events-none" />
                </div>
              </div>
           </div>

           <div className="space-y-2">
              <label className="text-[11px] font-bold text-apple-text-secondary uppercase tracking-widest px-1">Banco / CLABE</label>
              <div className="relative">
                 <Landmark className="absolute left-4 top-1/2 -translate-y-1/2 text-apple-blue w-4 h-4 pointer-events-none" strokeWidth={1.5} />
                 <input 
                   type="text" 
                   value={formData.bankInfo}
                   onChange={(e) => setFormData({...formData, bankInfo: e.target.value})}
                   className="w-full bg-apple-tertiary border border-apple-separator/50 rounded-xl py-3 pl-10 pr-6 text-[13px] font-medium text-apple-text focus:ring-1 focus:ring-apple-blue/30 outline-none transition-all" 
                 />
              </div>
           </div>

           <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-apple-text-secondary uppercase tracking-widest px-1">Esquema Pago</label>
                <div className="relative">
                   <select 
                     value={formData.paymentSchema}
                     onChange={(e) => setFormData({...formData, paymentSchema: e.target.value as any})}
                     className="w-full bg-apple-tertiary border border-apple-separator/50 rounded-xl py-3 px-4 text-[13px] font-medium text-apple-text outline-none focus:ring-1 focus:ring-apple-blue/30 transition-all cursor-pointer appearance-none"
                   >
                     <option value="Porcentaje">Porcentaje %</option>
                     <option value="Sueldo Fijo">Sueldo Fijo</option>
                   </select>
                   <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-apple-text-tertiary w-4 h-4 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-apple-text-secondary uppercase tracking-widest px-1">Valor</label>
                <div className="relative">
                   <input 
                    type="number" 
                    value={formData.paymentValue}
                    onChange={(e) => setFormData({...formData, paymentValue: Number(e.target.value)})}
                    className="w-full bg-apple-tertiary border border-apple-separator/50 rounded-xl py-3 px-4 text-[13px] font-bold text-apple-text outline-none focus:ring-1 focus:ring-apple-blue/30 transition-all tabular-nums" 
                   />
                   <div className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-apple-blue text-[13px] tabular-nums">
                      {formData.paymentSchema === 'Porcentaje' ? '%' : '$'}
                   </div>
                </div>
              </div>
           </div>

           <div className="pt-4 flex gap-4">
              <button onClick={onClose} className="flex-1 px-8 py-2 text-[11px] font-bold tracking-widest uppercase text-apple-text-secondary hover:text-apple-text transition-all">Cancelar</button>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 apple-button apple-button-primary py-2.5 text-[11px] uppercase tracking-widest font-bold"
              >
                {isSaving ? 'Guardando...' : 'Guardar'}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
