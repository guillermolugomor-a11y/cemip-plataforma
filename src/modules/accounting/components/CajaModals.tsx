import React, { useState } from 'react';
import { Unlock, Lock, CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useAccountingStore } from '../AccountingStore';
import { fmt } from './AccountingUI';

// ── Abrir Caja Modal ──────────────────────────────────────────────────────
export const AbrirCajaModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const { abrirCaja } = useAccountingStore();
    const [fondo, setFondo] = useState('600');
    const [tipo, setTipo] = useState<'semanal' | 'mensual'>('semanal');
    const [isOpening, setIsOpening] = useState(false);

    if (!isOpen) return null;

    const handleAbrir = async () => {
        setIsOpening(true);
        try {
            await abrirCaja(parseFloat(fondo) || 0, tipo);
            onClose();
        } catch (error) {
            console.error('Error opening caja:', error);
        } finally {
            setIsOpening(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-apple">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-apple-bg w-full max-w-sm rounded-2xl shadow-2xl z-10 overflow-hidden border border-apple-separator">
                <div className="px-6 py-5 border-b border-apple-separator bg-apple-secondary flex items-center gap-3">
                    <div className="w-9 h-9 bg-apple-green/10 rounded-xl flex items-center justify-center">
                        <Unlock className="w-5 h-5 text-apple-green" strokeWidth={2} />
                    </div>
                    <div>
                        <h2 className="text-[16px] font-bold text-apple-text">Abrir Caja</h2>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-apple-text-tertiary">Nuevo período</p>
                    </div>
                </div>
                <div className="p-6 space-y-5">
                    <div className="flex bg-apple-secondary border border-apple-separator rounded-xl p-1 gap-1">
                        {(['semanal', 'mensual'] as const).map(t => (
                            <button key={t} onClick={() => setTipo(t)}
                                className={cn("flex-1 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all",
                                    tipo === t ? 'bg-apple-bg text-apple-text shadow-sm' : 'text-apple-text-tertiary'
                                )}>{t}</button>
                        ))}
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-apple-text-tertiary">Fondo Inicial</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[14px] font-bold text-apple-text-tertiary">$</span>
                            <input type="number" value={fondo} onChange={e => setFondo(e.target.value)}
                                className="w-full bg-apple-secondary border border-apple-separator rounded-xl pl-8 pr-4 py-2 text-[14px] font-medium outline-none focus:border-apple-blue transition-all" placeholder="600" />
                        </div>
                    </div>
                    <div className="bg-apple-green/5 border border-apple-green/15 rounded-xl p-4 text-[12px] font-medium text-apple-text-secondary">
                        Al abrir la caja, todos los movimientos registrados quedarán vinculados a este período.
                    </div>
                </div>
                <div className="px-6 py-4 border-t border-apple-separator flex gap-3">
                    <button onClick={onClose} disabled={isOpening} className="flex-1 py-2.5 text-[11px] font-bold uppercase tracking-widest text-apple-text-secondary">Cancelar</button>
                    <button
                        onClick={handleAbrir}
                        disabled={isOpening}
                        className="flex-1 py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest text-apple-bg bg-apple-black hover:opacity-80 flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                        {isOpening ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" strokeWidth={2} />}
                        {isOpening ? 'Abriendo...' : 'Abrir Caja'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── Cerrar Caja Modal ─────────────────────────────────────────────────────
export const CerrarCajaModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const store = useAccountingStore();
    const caja = store.getActiveCaja();
    const txs = caja ? store.getTxsByCaja(caja.id).filter(t => !t.cancelled) : [];
    
    // Cálculos específicos para el cuadre de EFECTIVO (físico)
    const ingresosEfectivo = txs.filter(t => t.type === 'income' && t.method === 'Efectivo').reduce((s, t) => s + t.amount, 0);
    const egresosEfectivo = txs.filter(t => t.type === 'expense' && t.method === 'Efectivo').reduce((s, t) => s + t.amount, 0);
    const flujoEfectivo = ingresosEfectivo - egresosEfectivo;
    const esperado = caja ? caja.fondoInicial + flujoEfectivo : 0;

    // Otros métodos (No afectan la caja física)
    const otrosIngresos = txs.filter(t => t.type === 'income' && t.method !== 'Efectivo').reduce((s, t) => s + t.amount, 0);
    const totalIngresos = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);

    const [efectivoReal, setEfectivoReal] = useState(esperado.toString());
    const [closing, setClosing] = useState(false);
    const diff = parseFloat(efectivoReal || '0') - esperado;

    if (!isOpen) return null;

    const handleCerrar = async () => {
        setClosing(true);
        try {
            await store.cerrarCaja(parseFloat(efectivoReal) || 0);
            onClose();
        } catch (error) {
            console.error('Error closing caja:', error);
        } finally {
            setClosing(false);
        }
    };

    const Row = ({ label, value, bold, color }: any) => (
        <div className={cn("flex items-center justify-between py-2.5 border-b border-apple-separator/50 last:border-0", bold && "font-black")}>
            <span className={cn("text-[13px]", bold ? "text-apple-text font-bold" : "text-apple-text-secondary font-medium")}>{label}</span>
            <span className={cn("text-[14px] tabular-nums font-bold", color || "text-apple-text")}>{value}</span>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-apple">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-apple-bg w-full max-w-md rounded-2xl shadow-2xl z-10 overflow-hidden border border-apple-separator">
                <div className="px-6 py-5 border-b border-apple-separator bg-apple-secondary flex items-center gap-3">
                    <div className="w-9 h-9 bg-apple-red/10 rounded-xl flex items-center justify-center">
                        <Lock className="w-5 h-5 text-apple-red" strokeWidth={2} />
                    </div>
                    <div>
                        <h2 className="text-[16px] font-bold text-apple-text">Cierre de Caja</h2>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-apple-text-tertiary">Corte {caja?.tipo}</p>
                    </div>
                </div>

                <div className="p-6">
                    <div className="bg-apple-secondary rounded-2xl p-4 mb-5 space-y-1">
                        <div className="text-[10px] font-black uppercase tracking-widest text-apple-text-tertiary mb-2 px-1">Resumen de Cuadre (Efectivo)</div>
                        <Row label="Fondo Inicial" value={fmt(caja?.fondoInicial ?? 0)} />
                        <Row label="+ Ingresos en Efectivo" value={fmt(ingresosEfectivo)} color="text-apple-green" />
                        <Row label="− Egresos en Efectivo" value={fmt(egresosEfectivo)} color="text-apple-red" />
                        <div className="h-px bg-apple-separator/30 my-2" />
                        <Row label="Efectivo Esperado" value={fmt(esperado)} bold />
                    </div>

                    <div className="bg-apple-blue/5 border border-apple-blue/10 rounded-2xl p-4 mb-5">
                        <div className="text-[10px] font-black uppercase tracking-widest text-apple-blue/60 mb-2 px-1">Otros Ingresos (Bancos)</div>
                        <Row label="Tarjeta / Transferencia" value={fmt(otrosIngresos)} color="text-apple-blue" />
                        <Row label="Total Global Recaudado" value={fmt(totalIngresos)} bold />
                    </div>

                    <div className="space-y-1.5 mb-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-apple-text-tertiary">Efectivo Real en Caja</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[14px] font-bold text-apple-text-tertiary">$</span>
                            <input type="number" value={efectivoReal}
                                onChange={e => setEfectivoReal(e.target.value)}
                                className="w-full bg-apple-secondary border border-apple-separator rounded-xl pl-8 pr-4 py-3 text-[18px] font-black outline-none focus:border-apple-blue transition-all" />
                        </div>
                    </div>

                    <div className={cn(
                        "rounded-xl p-4 flex items-center justify-between",
                        Math.abs(diff) < 1 ? "bg-apple-green/5 border border-apple-green/20" : "bg-apple-red/5 border border-apple-red/15"
                    )}>
                        <div className="flex items-center gap-2">
                            {Math.abs(diff) < 1
                                ? <CheckCircle2 className="w-5 h-5 text-apple-green" strokeWidth={2} />
                                : <AlertCircle className="w-5 h-5 text-apple-red" strokeWidth={2} />
                            }
                            <span className="text-[13px] font-bold text-apple-text">Diferencia</span>
                        </div>
                        <span className={cn("text-[18px] font-black tabular-nums", diff < 0 ? 'text-apple-red' : diff > 0 ? 'text-apple-green' : 'text-apple-green')}>
                            {diff >= 0 ? '+' : ''}{fmt(diff)}
                        </span>
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-apple-separator flex gap-3">
                    <button onClick={onClose} className="flex-1 py-2.5 text-[11px] font-bold uppercase tracking-widest text-apple-text-secondary">Cancelar</button>
                    <button
                        onClick={handleCerrar}
                        className="flex-1 py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest text-apple-bg bg-apple-black hover:opacity-80 flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                        {closing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" strokeWidth={2} />}
                        {closing ? 'Cerrando...' : 'Cerrar Caja'}
                    </button>
                </div>
            </div>
        </div>
    );
};
