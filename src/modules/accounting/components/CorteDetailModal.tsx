import React from 'react';
import {
    X, Activity, Wallet, TrendingUp, TrendingDown,
    CheckCircle2, AlertCircle, User, History, Printer
} from 'lucide-react';
import { cn, openReceiptInNewTab } from '../../../lib/utils';
import type { Transaction, Corte } from '../types';
import { fmt, MethodBadge } from './AccountingUI';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface CorteDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    corte: Corte | null;
    transactions: Transaction[];
}

export const CorteDetailModal = ({ isOpen, onClose, corte, transactions }: CorteDetailModalProps) => {
    if (!isOpen || !corte) return null;

    const txs = transactions.filter(t =>
        t.cajaId === corte.cajaId ||
        (t.date >= corte.fechaInicio && t.date <= corte.fechaFin)
    ).sort((a, b) => b.date.localeCompare(a.date) || b.timestamp.localeCompare(a.timestamp));

    const handleExportPDF = () => {
        try {
            const doc = new jsPDF();

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(22);
            doc.setTextColor(30, 40, 50);
            doc.text('CEMIP • Instituto Clínico', 14, 25);

            doc.setFontSize(12);
            doc.setTextColor(100, 110, 120);
            const title = `Corte de Caja ${corte.tipo.charAt(0).toUpperCase() + corte.tipo.slice(1)} • ${corte.label}`;
            doc.text(title, 14, 34);

            // Resumen de Totales
            autoTable(doc, {
                startY: 42,
                head: [['Fondo Inicial', 'Total Ingresos', 'Total Egresos', 'Flujo Neto', 'Efectivo Real', 'Diferencia']],
                body: [[
                    fmt(corte.fondoInicial),
                    fmt(corte.totalIngresos),
                    fmt(corte.totalEgresos),
                    fmt(corte.flujoNeto),
                    fmt(corte.efectivoReal),
                    fmt(corte.diferencia)
                ]],
                theme: 'grid',
                headStyles: { fillColor: [0, 0, 0] },
                styles: { fontSize: 10, halign: 'center', cellPadding: 4 }
            });

            const finalY = (doc as any).lastAutoTable.finalY || 42;

            doc.setFontSize(14);
            doc.setTextColor(20, 20, 20);
            doc.text('Desglose de Movimientos', 14, finalY + 15);

            const tableData = txs.map(t => [
                `${t.date}\n${t.timestamp}`,
                `${t.concept} ${t.cancelled ? '(ANULADO)' : ''}`,
                t.category || 'Varios',
                t.method,
                `${t.type === 'income' ? '+' : '-'}${fmt(t.amount)}`
            ]);

            autoTable(doc, {
                startY: finalY + 20,
                head: [['Fecha / Hora', 'Concepto / Paciente', 'Categoría', 'Método', 'Monto']],
                body: tableData,
                theme: 'striped',
                headStyles: { fillColor: [0, 122, 255] },
                styles: { fontSize: 9, cellPadding: 3 }
            });

            // Forzar descarga con extensión explícita para evitar archivos tipo UUID sin formato
            const blob = doc.output('blob');
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Corte_Contabilidad_${corte.tipo}_${corte.fechaFin}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Error exporting Corte PDF:', error);
            alert('Hubo un error al generar el PDF del corte de caja.');
        }
    };

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-6 animate-apple">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            <div className="bg-apple-bg w-full max-w-4xl rounded-3xl shadow-2xl relative z-10 overflow-hidden border border-apple-separator flex flex-col h-[90vh]">
                <div className="px-8 py-6 border-b border-apple-separator flex items-center justify-between bg-apple-secondary shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-apple-black rounded-2xl flex items-center justify-center">
                            <Activity className="text-apple-bg w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold tracking-tight text-apple-text">{corte.label}</h2>
                            <p className="text-[10px] uppercase tracking-widest mt-0.5 text-apple-blue font-bold">Desglose de Corte • {corte.tipo}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2.5 hover:bg-apple-bg rounded-full transition-all text-apple-text-tertiary">
                        <X className="w-6 h-6" strokeWidth={1.5} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-10">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: 'Fondo Inicial', value: fmt(corte.fondoInicial), icon: Wallet, color: 'text-apple-text' },
                            { label: 'Total Ingresos', value: fmt(corte.totalIngresos), icon: TrendingUp, color: 'text-apple-green' },
                            { label: 'Total Egresos', value: fmt(corte.totalEgresos), icon: TrendingDown, color: 'text-apple-red' },
                            { label: 'Flujo Neto', value: fmt(corte.flujoNeto), icon: Activity, color: corte.flujoNeto >= 0 ? 'text-apple-green' : 'text-apple-red' },
                        ].map((s, i) => (
                            <div key={i} className="bg-apple-secondary p-5 rounded-2xl border border-apple-separator/30">
                                <div className="flex items-center justify-between mb-3" >
                                    <s.icon className={cn("w-4 h-4", s.color)} />
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-apple-text-tertiary">{s.label}</span>
                                </div>
                                <div className={cn("text-xl font-black tabular-nums", s.color)}>{s.value}</div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-apple-black text-apple-bg p-8 rounded-3xl relative overflow-hidden group">
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-apple-bg/5 rounded-full blur-3xl group-hover:bg-apple-bg/10 transition-all" />
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-50 mb-1">Efectivo Real en Caja</p>
                            <h3 className="text-4xl font-black tabular-nums mb-6">{fmt(corte.efectivoReal)}</h3>

                            <div className="flex items-center justify-between pt-6 border-t border-white/10">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Diferencia Final</p>
                                    <p className={cn("text-xl font-black tabular-nums", corte.diferencia >= 0 ? 'text-apple-green' : 'text-apple-red')}>
                                        {corte.diferencia >= 0 ? '+' : ''}{fmt(corte.diferencia)}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Esperado</p>
                                    <p className="text-xl font-black tabular-nums opacity-80">{fmt(corte.efectivoEsperado)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-apple-bg border border-apple-separator rounded-3xl p-8 flex flex-col justify-center">
                            <div className="flex items-center gap-4 mb-2">
                                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", Math.abs(corte.diferencia) < 1 ? "bg-apple-green/10 text-apple-green" : "bg-apple-red/10 text-apple-red")}>
                                    {Math.abs(corte.diferencia) < 1 ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-apple-text tracking-tight">Estado del Cuadre</h4>
                                    <p className="text-[13px] text-apple-text-tertiary">
                                        {Math.abs(corte.diferencia) < 1
                                            ? 'La caja cuadra perfectamente con el flujo registrado.'
                                            : `Se detectó una discrepancia de ${fmt(corte.diferencia)} en el efectivo.`}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-apple-separator pb-4">
                            <h3 className="text-[13px] font-black uppercase tracking-[0.2em] text-apple-text-tertiary">Desglose de Movimientos</h3>
                            <span className="px-3 py-1 bg-apple-slate rounded-full text-[10px] font-bold text-apple-text-tertiary uppercase">{txs.length} Operaciones</span>
                        </div>

                        <div className="overflow-hidden border border-apple-separator/40 rounded-2xl">
                            <table className="w-full text-left text-[12px]">
                                <thead>
                                    <tr className="bg-apple-secondary text-apple-text-tertiary font-black uppercase tracking-wider border-b border-apple-separator">
                                        <th className="px-6 py-4">Fecha / Hora</th>
                                        <th className="px-6 py-4">Concepto / Referencia</th>
                                        <th className="px-6 py-4">Categoría</th>
                                        <th className="px-6 py-4">Método</th>
                                        <th className="px-6 py-4 text-right">Monto</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-apple-separator/30">
                                    {txs.map(t => (
                                        <tr key={t.id} className="hover:bg-apple-slate/30 transition-colors">
                                            <td className="px-6 py-5">
                                                <div className="font-bold text-apple-text tabular-nums">{t.date}</div>
                                                <div className="text-[10px] text-apple-text-tertiary tabular-nums mt-0.5">{t.timestamp}</div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="font-bold text-apple-text">{t.concept}</div>
                                                <div className="text-[11px] text-apple-text-tertiary flex items-center gap-1.5 mt-0.5">
                                                    {t.patientName && <><User className="w-3 h-3 opacity-50" /> {t.patientName}</>}
                                                    {t.specialistName && <><History className="w-3 h-3 opacity-50" /> {t.specialistName}</>}
                                                    {t.receiptUrl && (
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                openReceiptInNewTab(t.receiptUrl!);
                                                            }} 
                                                            className="flex items-center gap-1 text-apple-blue hover:underline ml-2 bg-apple-blue/10 px-2 py-0.5 rounded"
                                                        >
                                                            <Printer className="w-3 h-3" /> Comprobante
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="font-medium text-apple-text-secondary">{t.category || 'Varios'}</span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <MethodBadge method={t.method} />
                                            </td>
                                            <td className={cn("px-6 py-5 font-black text-right tabular-nums text-lg", t.type === 'income' ? "text-apple-green" : "text-apple-red")}>
                                                {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {txs.length === 0 && (
                                <div className="py-16 text-center text-apple-text-tertiary font-medium italic">
                                    No hay transacciones vinculadas a este corte.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="px-8 py-6 border-t border-apple-separator bg-apple-secondary flex justify-between items-center shrink-0">
                    <button
                        onClick={handleExportPDF}
                        className="px-6 py-3 bg-apple-bg border border-apple-separator text-apple-text rounded-2xl text-[12px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-apple-separator transition-all active:scale-95 shadow-sm"
                    >
                        <Printer className="w-4 h-4" /> Exportar PDF Oficial
                    </button>

                    <button
                        onClick={onClose}
                        className="px-10 py-3 bg-apple-black text-apple-bg rounded-2xl text-[12px] font-bold uppercase tracking-widest hover:opacity-80 transition-all active:scale-95 shadow-lg"
                    >
                        Cerrar Ventana
                    </button>
                </div>
            </div>
        </div>
    );
};
