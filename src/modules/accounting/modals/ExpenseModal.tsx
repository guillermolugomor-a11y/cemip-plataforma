import React, { useState, useEffect } from 'react';
import { X, Receipt, ShoppingCart, Home, Briefcase, Settings, Check, Lock, Upload, FileText, Trash2 } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useAccountingStore } from '../AccountingStore';
import { useSpecialistStore } from '../../specialists/SpecialistStore';
import { useAgendaStore } from '../../agenda/AgendaStore';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const categories = [
  { id: 'Servicios', icon: Settings, color: 'text-apple-blue bg-apple-blue/10' },
  { id: 'Renta', icon: Home, color: 'text-purple-500 bg-purple-500/10' },
  { id: 'Nómina', icon: Briefcase, color: 'text-orange-500 bg-orange-500/10' },
  { id: 'Compras', icon: ShoppingCart, color: 'text-apple-green bg-apple-green/10' },
];

export default function ExpenseModal({ isOpen, onClose }: ExpenseModalProps) {
  const { addTransaction, activeCajaId } = useAccountingStore();
  const isLocked = !activeCajaId;
  const specialists = useSpecialistStore(s => s.specialists);
  const appointments = useAgendaStore(s => s.appointments);
  const markAppointmentsAsSpecialistPaid = useAgendaStore(s => s.markAppointmentsAsSpecialistPaid);

  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    concept: '',
    category: 'Servicios',
    amount: '',
    method: 'Efectivo' as any
  });

  const [selectedSpecialistId, setSelectedSpecialistId] = useState('');
  const [selectedAppointmentIds, setSelectedAppointmentIds] = useState<string[]>([]);
  
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptBase64, setReceiptBase64] = useState<string>('');

  // Derived therapies to pay
  const pendingAppointments = appointments.filter(a => {
    const specialist = specialists.find(s => s.id === selectedSpecialistId);
    const matchesSpecialist = a.specialistId === selectedSpecialistId || 
                             (specialist && a.specialistName?.toLowerCase() === specialist.name.toLowerCase());
    
    return matchesSpecialist && a.isPaid && !a.isSpecialistPaid;
  });

  // Auto-calculate amount when Nominas are selected
  useEffect(() => {
    if (formData.category === 'Nómina' && selectedSpecialistId) {
      const specialist = specialists.find(s => s.id === selectedSpecialistId);
      if (specialist) {
        const selectedApts = pendingAppointments.filter(a => selectedAppointmentIds.includes(a.id));
        let total = 0;
        
        selectedApts.forEach(apt => {
          const sessionCost = apt.sessionCost || 500;
          if (specialist.paymentSchema === 'Porcentaje') {
            total += sessionCost * (specialist.paymentValue / 100);
          } else {
            // Sueldo Fijo treated as fixed quota per therapy
            total += specialist.paymentValue;
          }
        });

        setFormData(prev => ({
          ...prev,
          amount: total > 0 ? total.toString() : '',
          concept: selectedApts.length > 0 ? `Honorarios ${specialist.name} - ${selectedApts.length} terapias` : ''
        }));
      }
    }
  }, [selectedAppointmentIds, selectedSpecialistId, formData.category]);

  // Reset subset when closing
  useEffect(() => {
    if (!isOpen) {
      setSelectedSpecialistId('');
      setSelectedAppointmentIds([]);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        concept: '',
        category: 'Servicios',
        amount: '',
        method: 'Efectivo'
      });
      setReceiptFile(null);
      setReceiptBase64('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setReceiptFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!formData.concept || !formData.amount || parseFloat(formData.amount) <= 0) {
      alert('Por favor completa los campos obligatorios y asegúrate de tener un monto válido.');
      return;
    }

    setIsSaving(true);

    setTimeout(() => {
      // 1. Add Expense
      addTransaction({
        date: formData.date,
        amount: parseFloat(formData.amount),
        concept: formData.concept,
        type: 'expense',
        method: formData.method,
        category: formData.category,
        receiptUrl: receiptBase64 || undefined
      });

      // 2. Mark therapies as paid
      if (formData.category === 'Nómina' && selectedAppointmentIds.length > 0) {
        markAppointmentsAsSpecialistPaid(selectedAppointmentIds);
      }

      setIsSaving(false);
      onClose();
    }, 800);
  };

  const selectAll = () => {
    setSelectedAppointmentIds(pendingAppointments.map(a => a.id));
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-apple">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="bg-apple-bg w-full max-w-[500px] max-h-[90vh] flex flex-col rounded-apple shadow-2xl relative z-10 overflow-hidden border border-apple-separator">
        <div className="px-8 py-6 border-b border-apple-separator flex items-center justify-between bg-apple-secondary/30 shrink-0">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-apple-red/10 rounded-lg flex items-center justify-center">
                <Receipt className="text-apple-red w-5 h-5" strokeWidth={1.5} />
             </div>
             <div>
               <h2 className="text-xl font-bold tracking-tight text-apple-text">Nuevo Egreso</h2>
               <p className="description-small uppercase tracking-widest mt-0.5 text-apple-red font-bold">Salida de Caja</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 text-apple-text-tertiary hover:text-apple-text rounded-full hover:bg-apple-bg transition-all">
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1">
           <div className="space-y-2">
              <label className="text-[11px] font-bold text-apple-text-secondary uppercase tracking-widest px-1">Fecha</label>
              <input 
                type="date" 
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full bg-apple-tertiary border border-apple-separator/50 rounded-xl py-3 px-4 text-[13px] font-medium text-apple-text focus:ring-1 focus:ring-apple-red/30 outline-none transition-all" 
              />
           </div>

           <div className="space-y-2">
              <label className="text-[11px] font-bold text-apple-text-secondary uppercase tracking-widest px-1">Categoría</label>
              <div className="grid grid-cols-4 gap-2">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => {
                       setFormData(prev => ({...prev, category: cat.id, amount: '', concept: ''}));
                       if (cat.id !== 'Nómina') {
                          setSelectedSpecialistId('');
                          setSelectedAppointmentIds([]);
                       }
                    }}
                    className={cn(
                      "p-2 rounded-xl flex flex-col items-center gap-1.5 border transition-all",
                      formData.category === cat.id 
                        ? "border-apple-separator/50 bg-apple-secondary shadow-sm" 
                        : "border-transparent bg-apple-tertiary opacity-70 hover:opacity-100 hover:bg-apple-secondary/50"
                    )}
                  >
                    <div className={cn("p-1.5 rounded-lg", cat.color)}>
                      <cat.icon className="w-3.5 h-3.5" strokeWidth={2} />
                    </div>
                    <span className="text-[9px] font-bold text-apple-text-secondary">{cat.id}</span>
                  </button>
                ))}
              </div>
           </div>

           {formData.category === 'Nómina' && (
              <div className="space-y-5 pt-4 border-t border-apple-separator/50 animate-apple">
                <div className="space-y-2">
                   <label className="text-[11px] font-bold text-apple-text-secondary uppercase tracking-widest px-1">Seleccionar Especialista</label>
                   <select 
                     value={selectedSpecialistId} 
                     onChange={(e) => {
                       setSelectedSpecialistId(e.target.value);
                       setSelectedAppointmentIds([]);
                     }}
                     className="w-full bg-apple-tertiary border border-apple-separator/50 rounded-xl py-3 px-4 text-[13px] font-medium text-apple-text focus:ring-1 focus:ring-apple-red/30 outline-none transition-all appearance-none cursor-pointer"
                   >
                     <option value="">-- Elige un especialista --</option>
                     {specialists.map(s => (
                       <option key={s.id} value={s.id}>{s.name} ({s.paymentSchema})</option>
                     ))}
                   </select>
                </div>
                
                {selectedSpecialistId && (
                   <div className="space-y-3">
                      <div className="flex items-center justify-between px-1">
                        <label className="text-[11px] font-bold text-apple-text-secondary uppercase tracking-widest">
                           Terapias Pendientes ({pendingAppointments.length})
                        </label>
                        {pendingAppointments.length > 0 && (
                           <button 
                             onClick={selectAll}
                             className="text-[10px] font-bold text-apple-blue hover:text-blue-600 transition-colors uppercase tracking-widest"
                           >
                              Sel. Todas
                           </button>
                        )}
                      </div>
                      
                      {pendingAppointments.length === 0 ? (
                         <div className="p-4 bg-apple-secondary/50 rounded-xl text-center border border-apple-separator/50">
                           <p className="text-[12px] font-bold text-apple-text">Todo al día</p>
                           <p className="description-small mt-0.5">El especialista no tiene sesiones pendientes por cobrar.</p>
                         </div>
                      ) : (
                         <div className="max-h-40 overflow-y-auto border border-apple-separator/50 rounded-xl bg-apple-secondary custom-scrollbar flex flex-col overflow-hidden">
                           {pendingAppointments.map((apt, i) => (
                              <label key={apt.id} className={cn(
                                "flex items-center gap-3 p-3 hover:bg-apple-bg/50 cursor-pointer transition-all",
                                i !== pendingAppointments.length - 1 && "border-b border-apple-separator/30"
                              )}>
                                <input 
                                  type="checkbox" 
                                  checked={selectedAppointmentIds.includes(apt.id)}
                                  onChange={(e) => {
                                     if (e.target.checked) setSelectedAppointmentIds(prev => [...prev, apt.id]);
                                     else setSelectedAppointmentIds(prev => prev.filter(id => id !== apt.id));
                                  }}
                                  className="w-4 h-4 rounded text-apple-red focus:ring-apple-red border-apple-separator"
                                />
                                <div className="flex-1">
                                  <p className="text-[12px] font-bold text-apple-text leading-tight">{apt.patientName}</p>
                                  <p className="text-[10px] text-apple-text-secondary tracking-wide">{apt.date} &bull; {apt.type}</p>
                                </div>
                              </label>
                           ))}
                         </div>
                      )}
                   </div>
                )}
              </div>
           )}

           <div className="space-y-4 pt-4 border-t border-apple-separator/50">
             <div className="space-y-2">
                <label className="text-[11px] font-bold text-apple-text-secondary uppercase tracking-widest px-1">Concepto Final</label>
                <input 
                  type="text" 
                  placeholder="Descripción del gasto..."
                  value={formData.concept}
                  onChange={(e) => setFormData({...formData, concept: e.target.value})}
                  readOnly={formData.category === 'Nómina'}
                  className={cn(
                    "w-full bg-apple-tertiary border border-apple-separator/50 rounded-xl py-3 px-4 text-[13px] font-medium text-apple-text transition-all",
                    formData.category === 'Nómina' ? "opacity-60 cursor-not-allowed" : "focus:ring-1 focus:ring-apple-red/30 outline-none"
                  )} 
                />
             </div>

             <div className="space-y-2">
                <label className="text-[11px] font-bold text-apple-text-secondary uppercase tracking-widest px-1">Monto a Pagar ($)</label>
                <div className="relative">
                   <div className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-apple-text-secondary text-[13px]">$</div>
                   <input 
                     type="number" 
                     value={formData.amount}
                     onChange={(e) => setFormData({...formData, amount: e.target.value})}
                     placeholder="0.00"
                     readOnly={formData.category === 'Nómina'}
                     className={cn(
                       "w-full bg-apple-tertiary border border-apple-separator/50 rounded-xl py-3 pl-8 pr-4 text-[14px] font-bold text-apple-text transition-all tabular-nums",
                       formData.category === 'Nómina' ? "font-black text-apple-red bg-apple-bg shadow-inner pointer-events-none" : "focus:ring-1 focus:ring-apple-red/30 outline-none"
                     )} 
                   />
                </div>
             </div>

             <div className="space-y-2">
                 <label className="text-[11px] font-bold text-apple-text-secondary uppercase tracking-widest px-1">Comprobante (Opcional)</label>
                 <div className="relative">
                    {receiptFile ? (
                      <div className="flex items-center justify-between bg-apple-tertiary border border-apple-separator/50 rounded-xl py-2 px-3">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <FileText className="w-4 h-4 text-apple-red shrink-0" />
                          <span className="text-[12px] font-medium text-apple-text truncate">{receiptFile.name}</span>
                        </div>
                        <button onClick={() => { setReceiptFile(null); setReceiptBase64(''); }} className="p-1 hover:bg-apple-secondary rounded-lg text-apple-text-tertiary hover:text-apple-red transition-colors shrink-0">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex items-center justify-center gap-2 w-full bg-apple-tertiary hover:bg-apple-secondary border border-dashed border-apple-separator/80 rounded-xl py-3 px-4 text-[13px] font-medium text-apple-text-secondary transition-all cursor-pointer">
                        <Upload className="w-4 h-4" />
                        <span>Subir recibo o factura</span>
                        <input type="file" className="hidden" accept="image/*,.pdf" onChange={handleFileChange} />
                      </label>
                    )}
                 </div>
              </div>
           </div>

           {isLocked && (
             <div className="p-3 bg-apple-red/10 text-apple-red rounded-lg flex gap-2 items-center border border-apple-red/20 animate-apple">
                <Lock className="w-4 h-4" strokeWidth={1.5} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Caja Cerrada: No se pueden registrar gastos</span>
             </div>
           )}
        </div>

        <div className="px-8 py-5 flex gap-4 shrink-0 bg-apple-bg border-t border-apple-separator">
            <button onClick={onClose} className="flex-1 px-8 py-2.5 text-[11px] font-bold tracking-widest uppercase text-apple-text-secondary hover:text-apple-text transition-all">Cancelar</button>
            <button 
              onClick={handleSave}
              disabled={isSaving || isLocked || (formData.category === 'Nómina' && selectedAppointmentIds.length === 0)}
              className={cn(
                "flex-1 apple-button bg-apple-red text-white hover:bg-red-600 py-3 text-[11px] uppercase tracking-widest font-bold flex items-center justify-center gap-2",
                (isSaving || isLocked || (formData.category === 'Nómina' && selectedAppointmentIds.length === 0)) && "opacity-50 cursor-not-allowed grayscale"
              )}
            >
              {isSaving ? 'Registrando...' : (
                <>
                  <Check className="w-4 h-4" /> Registrar Egreso
                </>
              )}
            </button>
        </div>
      </div>
    </div>
  );
}
