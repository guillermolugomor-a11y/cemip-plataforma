import React from 'react';
import { cn } from '../../../lib/utils';
import { Banknote, CreditCard } from 'lucide-react';

export const fmt = (n: number) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0 }).format(n);

export const StatCard = ({ label, value, sub, icon: Icon, color, bg }: any) => (
    <div className="bg-apple-bg border border-apple-separator rounded-2xl p-4 sm:p-5 shadow-sm flex items-start gap-3 hover:shadow-md transition-all">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 bg-apple-secondary", bg)}>
            <Icon className={cn("w-5 h-5", color)} strokeWidth={1.5} />
        </div>
        <div className="min-w-0 flex-1">
            <div className="text-[10px] font-bold uppercase tracking-widest text-apple-text-tertiary truncate">{label}</div>
            <div className="text-[18px] sm:text-[22px] font-black tabular-nums text-apple-text leading-none my-0.5 truncate">{value}</div>
            {sub && <div className="text-[11px] font-medium text-apple-text-secondary truncate">{sub}</div>}
        </div>
    </div>
);

export const MethodBadge = ({ method }: { method: string }) => {
    const cfg: any = {
        Efectivo: { icon: Banknote, cls: 'bg-apple-green/10 text-apple-green border-apple-green/20' },
        Transferencia: { icon: CreditCard, cls: 'bg-apple-blue/10 text-apple-blue border-apple-blue/20' },
        Tarjeta: { icon: CreditCard, cls: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
    };
    const { icon: Icon, cls } = cfg[method] || cfg.Efectivo;
    return (
        <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[9px] font-bold uppercase tracking-widest", cls)}>
            <Icon className="w-3 h-3" strokeWidth={2} /> {method}
        </span>
    );
};
