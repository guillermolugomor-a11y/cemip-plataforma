import React, { useState } from 'react';
import { X, DollarSign, User, CreditCard, Banknote, Landmark, Check, Lock } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useAccountingStore } from '../AccountingStore';
import { useSpecialistStore } from '../../specialists/SpecialistStore';

interface IncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: any[];
}

const paymentMethods = [
  { id: 'Efectivo', icon: Banknote, color: 'bg-apple-green/10 text-apple-green' },
  { id: 'Tarjeta', icon: CreditCard, color: 'bg-apple-blue/10 text-apple-blue' },
  { id: 'Transferencia', icon: Landmark, color: 'bg-purple-500/10 text-purple-500' }
];

export default function IncomeModal({ isOpen, onClose, patients }: IncomeModalProps) {
  const { addTransaction, activeCajaId } = useAccountingStore();
  const isLocked = !activeCajaId;
  const specialists = useSpecialistStore((state) => state.specialists);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    patientId: '',
    specialistId: '',
    amount: '',
    method: 'Efectivo' as any
  });

  if (!isOpen) return null;

  const handleSave = () => {
    if (!formData.patientId || !formData.amount) {
      alert('Por favor completa los campos obligatorios.');
      return;
    }

    setIsSaving(true);
    const patient = patients.find(p => p.id === formData.patientId);
    const specialist = specialists.find(s => s.id === formData.specialistId);

    setTimeout(() => {
      addTransaction({
        date: formData.date,
        amount: parseFloat(formData.amount),
        concept: `Consulta: ${patient?.name || 'Paciente'}`,
        type: 'income',
        method: formData.method,
        patientId: formData.patientId,
        patientName: patient?.name,
        specialistId: formData.specialistId,
        specialistName: specialist?.name
      });
      setIsSaving(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-apple">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="bg-apple-bg w-full max-w-[500px] rounded-apple shadow-2xl relative z-10 overflow-hidden border border-apple-separator">
        <div className="px-8 py-6 border-b border-apple-separator flex items-center justify-between bg-apple-secondary/30">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-apple-green/10 rounded-lg flex items-center justify-center">
                <DollarSign className="text-apple-green w-5 h-5" strokeWidth={1.5} />
             </div>
             <div>
               <h2 className="text-xl font-bold tracking-tight text-apple-text">Cobrar Consulta</h2>
               <p className="description-small uppercase tracking-widest mt-0.5 text-apple-green font-bold">Ingreso a Caja</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 text-apple-text-tertiary hover:text-apple-text rounded-full hover:bg-apple-bg transition-all">
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        <div className="p-8 space-y-6">
           <div className="space-y-2">
              <label className="text-[11px] font-bold text-apple-text-secondary uppercase tracking-widest px-1">Fecha de Cobro</label>
              <input 
                type="date" 
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full bg-apple-tertiary border border-apple-separator/50 rounded-xl py-3 px-4 text-[13px] font-medium text-apple-text focus:ring-1 focus:ring-apple-green/30 outline-none transition-all" 
              />
           </div>

           <div className="space-y-2">
              <label className="text-[11px] font-bold text-apple-text-secondary uppercase tracking-widest px-1">Paciente</label>
              <select 
                value={formData.patientId}
                onChange={(e) => setFormData({...formData, patientId: e.target.value})}
                className="w-full bg-apple-tertiary border border-apple-separator/50 rounded-xl py-3 px-4 text-[13px] font-medium text-apple-text focus:ring-1 focus:ring-apple-green/30 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="">-- Seleccionar --</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
           </div>

           <div className="space-y-2">
              <label className="text-[11px] font-bold text-apple-text-secondary uppercase tracking-widest px-1">Especialista</label>
              <select 
                value={formData.specialistId}
                onChange={(e) => setFormData({...formData, specialistId: e.target.value})}
                className="w-full bg-apple-tertiary border border-apple-separator/50 rounded-xl py-3 px-4 text-[13px] font-medium text-apple-text focus:ring-1 focus:ring-apple-green/30 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="">-- Seleccionar --</option>
                {specialists.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
           </div>

           <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-apple-text-secondary uppercase tracking-widest px-1">Monto</label>
                <div className="relative">
                   <div className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-apple-text-secondary text-[13px]">$</div>
                   <input 
                     type="number" 
                     value={formData.amount}
                     onChange={(e) => setFormData({...formData, amount: e.target.value})}
                     placeholder="0.00"
                     className="w-full bg-apple-tertiary border border-apple-separator/50 rounded-xl py-3 pl-8 pr-4 text-[14px] font-bold text-apple-text focus:ring-1 focus:ring-apple-green/30 outline-none transition-all tabular-nums" 
                   />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-apple-text-secondary uppercase tracking-widest px-1">Método</label>
                <div className="flex gap-2 h-[46px]">
                  {paymentMethods.map(m => (
                    <button
                      key={m.id}
                      onClick={() => setFormData({...formData, method: m.id as any})}
                      className={cn(
                        "flex-1 rounded-xl border transition-all flex items-center justify-center",
                        formData.method === m.id 
                          ? `border-apple-green ${m.color} shadow-sm` 
                          : "border-apple-separator/50 bg-apple-tertiary text-apple-text-tertiary hover:bg-apple-secondary"
                      )}
                      title={m.id}
                    >
                      <m.icon className="w-4 h-4" strokeWidth={2} />
                    </button>
                  ))}
                </div>
              </div>
           </div>

           {isLocked && (
             <div className="p-3 bg-apple-red/10 text-apple-red rounded-lg flex gap-2 items-center border border-apple-red/20">
                <Lock className="w-4 h-4" strokeWidth={1.5} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Caja Cerrada: No se pueden registrar cobros</span>
             </div>
           )}

           <div className="pt-2 flex gap-4">
              <button onClick={onClose} className="flex-1 px-8 py-2.5 text-[11px] font-bold tracking-widest uppercase text-apple-text-secondary hover:text-apple-text transition-all">Cancelar</button>
              <button 
                onClick={handleSave}
                disabled={isSaving || isLocked}
                className={cn(
                  "flex-1 apple-button bg-apple-green text-white hover:bg-emerald-600 py-3 text-[11px] uppercase tracking-widest font-bold flex items-center justify-center gap-2",
                  (isSaving || isLocked) && "opacity-50 cursor-not-allowed grayscale"
                )}
              >
                {isSaving ? 'Procesando...' : (
                  <>
                    <Check className="w-4 h-4" /> Registrar
                  </>
                )}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
