import React from 'react';
import { X, Printer, Download, Banknote, CreditCard, Landmark, ArrowRight } from 'lucide-react';
import { useAccountingStore } from '../AccountingStore';
import { cn } from '../../../lib/utils';

interface CorteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CorteModal({ isOpen, onClose }: CorteModalProps) {
  const store = useAccountingStore();
  const { transactions } = store;
  
  if (!isOpen) return null;

  const today = new Date().toISOString().split('T')[0];
  const todayTransactions = transactions.filter(t => t.date === today);
  
  const incomeByMethod = {
    Efectivo: todayTransactions.filter(t => t.type === 'income' && t.method === 'Efectivo').reduce((acc, t) => acc + t.amount, 0),
    Tarjeta: todayTransactions.filter(t => t.type === 'income' && t.method === 'Tarjeta').reduce((acc, t) => acc + t.amount, 0),
    Transferencia: todayTransactions.filter(t => t.type === 'income' && t.method === 'Transferencia').reduce((acc, t) => acc + t.amount, 0),
  };

  const todayTotalIncome = todayTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const todayTotalExpenses = todayTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const todayBalance = todayTotalIncome - todayTotalExpenses;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-apple">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="bg-apple-bg w-full max-w-[500px] rounded-apple shadow-2xl relative z-10 overflow-hidden border border-apple-separator">
        <div className="px-8 py-6 border-b border-apple-separator flex items-center justify-between bg-apple-secondary/30">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-apple-blue/10 rounded-lg flex items-center justify-center">
                <Printer className="text-apple-blue w-5 h-5" strokeWidth={1.5} />
             </div>
             <div>
                <h2 className="text-xl font-bold tracking-tight text-apple-text">Corte de Caja</h2>
                <p className="description-small uppercase tracking-widest mt-0.5 text-apple-blue font-bold tracking-tight">{today}</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 text-apple-text-tertiary hover:text-apple-text rounded-full hover:bg-apple-bg transition-all">
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        <div className="p-8 space-y-8">
           <div className="grid grid-cols-2 gap-6">
              <div className="bg-apple-secondary p-5 rounded-apple">
                 <div className="text-[10px] font-bold tracking-widest text-apple-text-secondary uppercase mb-2">Ingresos Hoy</div>
                 <div className="text-2xl font-bold text-apple-green tabular-nums">${todayTotalIncome.toLocaleString()}</div>
              </div>
              <div className="bg-apple-secondary p-5 rounded-apple">
                 <div className="text-[10px] font-bold tracking-widest text-apple-text-secondary uppercase mb-2">Egresos Hoy</div>
                 <div className="text-2xl font-bold text-apple-red tabular-nums">${todayTotalExpenses.toLocaleString()}</div>
              </div>
           </div>

           <div className="space-y-4">
              <h3 className="text-[10px] font-bold tracking-widest text-apple-text-secondary uppercase px-1">Desglose por Método</h3>
              <div className="space-y-2">
                 <div className="flex items-center justify-between p-4 bg-apple-tertiary border border-apple-separator/50 rounded-xl">
                    <div className="flex items-center gap-3">
                       <Banknote className="w-4 h-4 text-apple-green" strokeWidth={2} />
                       <span className="text-[12px] font-bold text-apple-text">Efectivo</span>
                    </div>
                    <span className="text-[13px] font-bold text-apple-text tabular-nums">${incomeByMethod.Efectivo.toLocaleString()}</span>
                 </div>
                 <div className="flex items-center justify-between p-4 bg-apple-tertiary border border-apple-separator/50 rounded-xl">
                    <div className="flex items-center gap-3">
                       <CreditCard className="w-4 h-4 text-apple-blue" strokeWidth={2} />
                       <span className="text-[12px] font-bold text-apple-text">Tarjeta</span>
                    </div>
                    <span className="text-[13px] font-bold text-apple-text tabular-nums">${incomeByMethod.Tarjeta.toLocaleString()}</span>
                 </div>
                 <div className="flex items-center justify-between p-4 bg-apple-tertiary border border-apple-separator/50 rounded-xl">
                    <div className="flex items-center gap-3">
                       <Landmark className="w-4 h-4 text-purple-500" strokeWidth={2} />
                       <span className="text-[12px] font-bold text-apple-text">Transferencia</span>
                    </div>
                    <span className="text-[13px] font-bold text-apple-text tabular-nums">${incomeByMethod.Transferencia.toLocaleString()}</span>
                 </div>
              </div>
           </div>

           <div className="pt-6 border-t border-apple-separator">
              <div className="flex items-center justify-between mb-8">
                 <div className="text-[12px] font-bold text-apple-text uppercase tracking-widest">Balance del Día</div>
                 <div className="text-3xl font-bold text-apple-blue tabular-nums">${todayBalance.toLocaleString()}</div>
              </div>

              <div className="flex gap-4">
                 <button className="flex-1 apple-button apple-button-secondary py-3 text-[10px] uppercase tracking-widest font-bold flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" /> PDF
                 </button>
                 <button className="flex-1 apple-button apple-button-primary py-3 text-[10px] uppercase tracking-widest font-bold flex items-center justify-center gap-2">
                    <Printer className="w-4 h-4" /> Imprimir
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
