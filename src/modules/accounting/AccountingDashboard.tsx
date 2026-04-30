import React, { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, DollarSign, Wallet, Activity,
  Lock, Unlock, History, FileText, Printer,
  Calendar, FileSearch, Loader2, Plus, Ban,
  Banknote, CreditCard, Landmark
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';
import { cn, openReceiptInNewTab } from '../../lib/utils';
import { useAccountingStore } from './AccountingStore';
import type { Corte } from './types';
import { getLocalDateString } from '../../lib/dateUtils';

// Components
import { fmt, StatCard, MethodBadge } from './components/AccountingUI';
import { TxModal } from './components/TxModal';
import { AbrirCajaModal, CerrarCajaModal } from './components/CajaModals';
import { CorteDetailModal } from './components/CorteDetailModal';

// ── Period helper ────────────────────────────────────────────────────────
type Tab = 'hoy' | 'semana' | 'mes' | 'año' | 'historico';

function usePeriod(tab: Tab, baseDate: string) {
  const today = baseDate;
  // Usar mediodía para evitar problemas de cambio de hora al calcular semanas/meses
  const now = new Date(baseDate + 'T12:00:00');

  if (tab === 'hoy') return { start: today, end: today };

  if (tab === 'semana') {
    const d = new Date(now);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const mon = new Date(d.setDate(diff));
    const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
    return { start: mon.toISOString().split('T')[0], end: sun.toISOString().split('T')[0] };
  }

  if (tab === 'mes') {
    const y = now.getFullYear(), m = now.getMonth();
    return {
      start: new Date(y, m, 1).toISOString().split('T')[0],
      end: new Date(y, m + 1, 0).toISOString().split('T')[0],
    };
  }

  if (tab === 'año') {
    const y = now.getFullYear();
    return { start: `${y}-01-01`, end: `${y}-12-31` };
  }

  return { start: '2000-01-01', end: '2099-12-31' }; // histórico
}

// ── Number to Words Helper (Spanish) ──────────────────────────────────
function numeroALetras(num: number): string {
  const unidades = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
  const decenas = ['DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISEIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'];
  const decenas2 = ['', '', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
  const centenas = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];

  const leerDecenas = (n: number) => {
    if (n < 10) return unidades[n];
    if (n < 20) return decenas[n - 10];
    const d = Math.floor(n / 10);
    const u = n % 10;
    if (u === 0) return decenas2[d];
    if (d === 2) return `VEINTI${unidades[u]}`;
    return `${decenas2[d]} Y ${unidades[u]}`;
  };

  const leerCentenas = (n: number) => {
    if (n === 100) return 'CIEN';
    if (n < 100) return leerDecenas(n);
    const c = Math.floor(n / 100);
    const d = n % 100;
    if (d === 0) return centenas[c];
    return `${centenas[c]} ${leerDecenas(d)}`;
  };

  const leerMiles = (n: number) => {
    if (n === 1000) return 'MIL';
    if (n < 1000) return leerCentenas(n);
    const m = Math.floor(n / 1000);
    const c = n % 1000;
    let prefijo = m === 1 ? 'MIL' : `${leerCentenas(m)} MIL`;
    if (c === 0) return prefijo;
    return `${prefijo} ${leerCentenas(c)}`;
  };

  const entero = Math.floor(num);
  const centavos = Math.round((num - entero) * 100);
  
  let texto = leerMiles(entero);
  if (texto === '') texto = 'CERO';
  
  const centavosStr = centavos.toString().padStart(2, '0');
  return `(${texto} PESOS ${centavosStr}/100 M.N.)`.toUpperCase();
}

// ── Main Component ────────────────────────────────────────────────────────
const TABS: { id: Tab; label: string }[] = [
  { id: 'hoy', label: 'Hoy' },
  { id: 'semana', label: 'Semana' },
  { id: 'mes', label: 'Mes' },
  { id: 'año', label: 'Año' },
  { id: 'historico', label: 'Histórico' },
];

export default function AccountingDashboard() {
  const transactions = useAccountingStore(s => s.transactions);
  const cajas = useAccountingStore(s => s.cajas);
  const cortes = useAccountingStore(s => s.cortes);
  const cancelTransaction = useAccountingStore(s => s.cancelTransaction);
  const getActiveCaja = useAccountingStore(s => s.getActiveCaja);
  const getTxsByPeriod = useAccountingStore(s => s.getTxsByPeriod);
  const getTxsByCaja = useAccountingStore(s => s.getTxsByCaja);
  const sumIngresos = useAccountingStore(s => s.sumIngresos);
  const sumEgresos = useAccountingStore(s => s.sumEgresos);
  const getExpectedCash = useAccountingStore(s => s.getExpectedCash);
  const fetchAccounting = useAccountingStore(s => s.fetchAccounting);

  useEffect(() => {
    fetchAccounting();
  }, [fetchAccounting]);

  const caja = getActiveCaja();

  const [tab, setTab] = useState<Tab>('semana');
  const [selectedDate, setSelectedDate] = useState(getLocalDateString());
  const [showTx, setShowTx] = useState(false);
  const [showAbrir, setShowAbrir] = useState(false);
  const [showCerrar, setShowCerrar] = useState(false);
  const [activeSection, setActiveSection] = useState<'movimientos' | 'cortes'>('movimientos');
  const [selectedCorteForDetail, setSelectedCorteForDetail] = useState<Corte | null>(null);
  const [txToCancel, setTxToCancel] = useState<any | null>(null);
  const [txToReceipt, setTxToReceipt] = useState<any | null>(null);

  const [exportingId, setExportingId] = useState<string | null>(null);

  const handleExportPDF = (corte: Corte) => {
    setExportingId(corte.id);
    setTimeout(() => {
      try {
        const doc = new jsPDF();
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(22);
        doc.setTextColor(30, 40, 50);
        doc.text('CEMIP • Instituto Clínico', 14, 25);
        doc.setFontSize(12);
        doc.setTextColor(100, 110, 120);
        doc.text(`Corte de Caja ${corte.tipo.charAt(0).toUpperCase() + corte.tipo.slice(1)} • ${corte.label}`, 14, 34);

        autoTable(doc, {
          startY: 42,
          head: [['Fondo Inicial', 'Ingresos', 'Egresos', 'Flujo Neto', 'Efectivo Real', 'Diferencia']],
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

        const txs = transactions.filter(t => t.cajaId === corte.cajaId || (t.date >= corte.fechaInicio && t.date <= corte.fechaFin))
          .sort((a, b) => b.date.localeCompare(a.date) || b.timestamp.localeCompare(a.timestamp));

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
        console.error('Error al exportar PDF:', error);
        alert('Hubo un error al generar el PDF.');
      } finally {
        setExportingId(null);
      }
    }, 50);
  };

  const { start, end } = usePeriod(tab, selectedDate);
  const periodTxs = getTxsByPeriod(start, end);
  const ingresos = sumIngresos(periodTxs);
  const egresos = sumEgresos(periodTxs);
  const balance = ingresos - egresos;

  const chartData = React.useMemo(() => {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const now = new Date();
    const data = [];
    
    for (let i = 2; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mIdx = d.getMonth();
      const monthLabel = months[mIdx];
      const startStr = new Date(d.getFullYear(), mIdx, 1).toISOString().split('T')[0];
      const endStr = new Date(d.getFullYear(), mIdx + 1, 0).toISOString().split('T')[0];
      
      const txs = getTxsByPeriod(startStr, endStr);
      data.push({
        name: monthLabel,
        ingresos: sumIngresos(txs),
        egresos: sumEgresos(txs),
      });
    }
    return data;
  }, [transactions]);

  const cajaTxs = caja ? getTxsByCaja(caja.id) : [];
  const cajaIng = sumIngresos(cajaTxs);
  const cajaEgr = sumEgresos(cajaTxs);
  const cajaFlujo = cajaIng - cajaEgr;

  const handlePrintReceipt = (tx: any) => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'letter'
      });

      // Colors
      const primaryColor = [0, 122, 255]; // Apple Blue
      const lightBg = [250, 250, 252];

      // Layout Constants
      const margin = 20;
      const pageWidth = 215.9;
      const pageHeight = 279.4;
      const centerX = pageWidth / 2;

      // ── Decorative Header Bar ──
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, pageWidth, 4, 'F');

      // ── Logo ──
      try {
        doc.addImage('/logo.jpg', 'JPEG', margin, 15, 30, 30);
      } catch (e) {
        console.warn('Logo no cargado en PDF:', e);
      }

      // ── Institutional Info ──
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(30, 40, 50);
      doc.text('CEMIP MORELOS', margin + 35, 25);
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text('Centro Multidisciplinario De Intervención Psicopedagógico', margin + 35, 30);
      doc.text('RFC: CMO230919ESA', margin + 35, 34);
      doc.text('Gobernador de Jalisco 78, Lomas del Mirador', margin + 35, 38);
      doc.text('Cuernavaca, Morelos, CP 62350', margin + 35, 42);
      
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text('WhatsApp: 777 6826356 | cemip.info@gmail.com', margin + 35, 46);

      // ── Folio & Title Box ──
      doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
      doc.roundedRect(pageWidth - margin - 65, 15, 65, 35, 4, 4, 'F');
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100, 100, 100);
      doc.text('COMPROBANTE DE PAGO', pageWidth - margin - 32.5, 23, { align: 'center' });
      
      doc.setFontSize(14);
      doc.setTextColor(255, 69, 58); // Apple Red
      doc.text(`FOLIO: #${tx.id.toUpperCase().slice(0, 8)}`, pageWidth - margin - 32.5, 32, { align: 'center' });
      
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      doc.setFont('helvetica', 'normal');
      doc.text(`Fecha: ${tx.date}`, pageWidth - margin - 32.5, 40, { align: 'center' });
      doc.text(`Hora: ${tx.timestamp}`, pageWidth - margin - 32.5, 44, { align: 'center' });

      // ── Content ──
      let currentY = 65;
      
      // Patient Box
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.roundedRect(margin, currentY, pageWidth - (margin * 2), 10, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('INFORMACIÓN DEL PACIENTE', margin + 5, currentY + 6.5);
      
      currentY += 15;
      doc.setTextColor(40, 40, 40);
      doc.setFontSize(12);
      doc.text('PACIENTE:', margin + 5, currentY);
      doc.setFont('helvetica', 'normal');
      doc.text(tx.patientName || 'Público en General', margin + 35, currentY);
      
      // Table
      currentY += 10;
      autoTable(doc, {
        startY: currentY,
        head: [['CONCEPTO / DESCRIPCIÓN', 'MÉTODO', 'TOTAL']],
        body: [[
          { content: tx.concept, styles: { fontStyle: 'bold' } },
          tx.method,
          fmt(tx.amount)
        ]],
        theme: 'grid',
        headStyles: { fillColor: [40, 40, 40], fontSize: 9, halign: 'center' },
        styles: { fontSize: 10, cellPadding: 6, valign: 'middle' },
        columnStyles: {
          0: { cellWidth: 110 },
          1: { cellWidth: 35, halign: 'center' },
          2: { cellWidth: 31, halign: 'right' }
        }
      });

      currentY = (doc as any).lastAutoTable.finalY + 15;

      // ── Totals ──
      doc.setFontSize(10);
      doc.setTextColor(120, 120, 120);
      doc.text('SUBTOTAL:', pageWidth - margin - 50, currentY);
      doc.text(fmt(tx.amount), pageWidth - margin - 5, currentY, { align: 'right' });
      
      doc.text('IVA (0%):', pageWidth - margin - 50, currentY + 8);
      doc.text(fmt(0), pageWidth - margin - 5, currentY + 8, { align: 'right' });

      doc.setDrawColor(200, 200, 200);
      doc.line(pageWidth - margin - 50, currentY + 12, pageWidth - margin, currentY + 12);

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('TOTAL:', pageWidth - margin - 50, currentY + 22);
      doc.text(fmt(tx.amount), pageWidth - margin - 5, currentY + 22, { align: 'right' });

      // Amount in Words
      currentY += 35;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(60, 60, 60);
      doc.text('IMPORTE CON LETRA:', margin, currentY);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(10);
      doc.text(numeroALetras(tx.amount), margin, currentY + 6);

      // ── Footer / Signature ──
      currentY = 230;
      doc.setDrawColor(180, 180, 180);
      doc.line(centerX - 40, currentY, centerX + 40, currentY);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('RECIBÍ CONFORME', centerX, currentY + 6, { align: 'center' });
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(tx.userName || 'ADMINISTRACIÓN CEMIP', centerX, currentY + 11, { align: 'center' });

      // Bottom bar
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, pageHeight - 15, pageWidth, 15, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.text('Centro Multidisciplinario De Intervención Psicopedagógico - Morelos', centerX, pageHeight - 8, { align: 'center' });
      doc.text('Este documento no tiene validez fiscal.', centerX, pageHeight - 4, { align: 'center' });

      // Download
      doc.save(`Recibo_${tx.id.slice(0, 5)}.pdf`);

    } catch (error) {
      console.error('Error al generar recibo:', error);
      alert('Hubo un error al generar el recibo.');
    }
  };

  const handlePrintGeneralReport = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const centerX = pageWidth / 2;
      const margin = 20;
      const primaryColor: [number, number, number] = [0, 122, 255]; // Apple Blue

      // ── Header ──
      // Logo (Placeholder text)
      doc.setFontSize(24);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.text('CEMIP', margin, 25);
      
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text('INSTITUTO CLÍNICO', margin, 30);

      doc.setFontSize(16);
      doc.setTextColor(40, 40, 40);
      doc.text('INFORME FINANCIERO GENERAL', pageWidth - margin, 25, { align: 'right' });
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Periodo: ${tab.toUpperCase()}`, pageWidth - margin, 32, { align: 'right' });
      doc.text(`${start} al ${end}`, pageWidth - margin, 37, { align: 'right' });

      doc.setDrawColor(230, 230, 230);
      doc.line(margin, 45, pageWidth - margin, 45);

      // ── Summary Table ──
      const methodSummary = {
        Efectivo: periodTxs.filter(t => t.type === 'income' && t.method === 'Efectivo' && !t.cancelled).reduce((s, t) => s + t.amount, 0),
        Tarjeta: periodTxs.filter(t => t.type === 'income' && t.method === 'Tarjeta' && !t.cancelled).reduce((s, t) => s + t.amount, 0),
        Transferencia: periodTxs.filter(t => t.type === 'income' && t.method === 'Transferencia' && !t.cancelled).reduce((s, t) => s + t.amount, 0),
      };

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('RESUMEN DE OPERACIONES', margin, 55);

      autoTable(doc, {
        startY: 60,
        head: [['MÉTODO DE PAGO', 'INGRESOS TOTALES']],
        body: [
          ['Efectivo (Físico)', fmt(methodSummary.Efectivo)],
          ['Tarjeta Bancaria', fmt(methodSummary.Tarjeta)],
          ['Transferencia Electrónica', fmt(methodSummary.Transferencia)],
          [{ content: 'TOTAL INGRESOS BRUTOS', styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } }, { content: fmt(ingresos), styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } }]
        ],
        theme: 'grid',
        headStyles: { fillColor: primaryColor, fontSize: 10, halign: 'center' },
        styles: { fontSize: 10, cellPadding: 5 },
        columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } }
      });

      let currentY = (doc as any).lastAutoTable.finalY + 10;

      autoTable(doc, {
        startY: currentY,
        body: [
          ['TOTAL INGRESOS', fmt(ingresos)],
          ['TOTAL EGRESOS', fmt(egresos)],
          [{ content: 'BALANCE NETO (UTILIDAD)', styles: { fontStyle: 'bold', textColor: balance >= 0 ? [0, 150, 0] : [200, 0, 0] } }, { content: fmt(balance), styles: { fontStyle: 'bold', textColor: balance >= 0 ? [0, 150, 0] : [200, 0, 0] } }]
        ],
        theme: 'plain',
        styles: { fontSize: 11, cellPadding: 4 },
        columnStyles: { 1: { halign: 'right' } }
      });

      // ── Detailed Transactions ──
      currentY = (doc as any).lastAutoTable.finalY + 15;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(40, 40, 40);
      doc.text('DETALLE DE MOVIMIENTOS', margin, currentY);

      autoTable(doc, {
        startY: currentY + 5,
        head: [['FECHA', 'CONCEPTO', 'MÉTODO', 'TIPO', 'MONTO']],
        body: periodTxs.map(t => [
          t.date,
          t.concept + (t.cancelled ? ' (ANULADO)' : ''),
          t.method,
          t.type === 'income' ? 'Ingreso' : 'Egreso',
          { content: fmt(t.amount), styles: { textColor: t.cancelled ? [150, 150, 150] : (t.type === 'income' ? [0, 120, 0] : [180, 0, 0]) } }
        ]),
        headStyles: { fillColor: [60, 60, 60], fontSize: 9 },
        styles: { fontSize: 8, cellPadding: 3 },
        alternateRowStyles: { fillColor: [250, 250, 250] }
      });

      // Footer
      const totalPages = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Página ${i} de ${totalPages} — Generado el ${new Date().toLocaleString()}`, centerX, pageHeight - 10, { align: 'center' });
      }

      doc.save(`Informe_CEMIP_${tab}_${getLocalDateString()}.pdf`);
    } catch (error) {
      console.error('Error al generar informe:', error);
      alert('Hubo un error al generar el informe.');
    }
  };

  return (
    <div className="space-y-5 animate-apple pb-28 max-w-7xl mx-auto">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black tracking-widest uppercase text-apple-text-tertiary block mb-0.5">Control Financiero</span>
          <h2 className="text-[22px] font-bold tracking-tight text-apple-text">Contabilidad</h2>
        </div>
        <div className="flex items-center gap-2">
          {caja ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-apple-secondary border border-apple-separator rounded-xl">
              <div className="w-1.5 h-1.5 bg-apple-green rounded-full" />
              <span className="text-[11px] font-semibold text-apple-text-secondary hidden sm:block">Caja abierta</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-apple-secondary border border-apple-separator rounded-xl">
              <Lock className="w-3 h-3 text-apple-text-tertiary" strokeWidth={2} />
              <span className="text-[11px] font-semibold text-apple-text-secondary hidden sm:block">Sin caja</span>
            </div>
          )}

          {caja ? (
            <>
              <button
                onClick={() => setShowTx(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-apple-black text-apple-bg text-[11px] font-bold uppercase tracking-widest hover:opacity-80 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" strokeWidth={2.5} />
                <span className="hidden sm:inline">Movimiento</span>
                <span className="sm:hidden">+</span>
              </button>
              <button
                onClick={() => setShowCerrar(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-apple-secondary border border-apple-separator text-apple-text-secondary text-[11px] font-bold uppercase tracking-widest hover:bg-apple-separator transition-all active:scale-95"
              >
                <Lock className="w-3.5 h-3.5" strokeWidth={2} />
                <span className="hidden sm:inline">Cerrar caja</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowAbrir(true)}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-apple-black text-apple-bg text-[11px] font-bold uppercase tracking-widest hover:opacity-80 transition-all active:scale-95"
            >
              <Unlock className="w-4 h-4" strokeWidth={2} /> Abrir caja
            </button>
          )}
          
          <button
            onClick={handlePrintGeneralReport}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-apple-blue/10 text-apple-blue border border-apple-blue/20 text-[11px] font-bold uppercase tracking-widest hover:bg-apple-blue hover:text-white transition-all active:scale-95"
          >
            <FileText className="w-4 h-4" />
            <span className="hidden lg:inline">Generar Informe General</span>
            <span className="lg:hidden">Informe</span>
          </button>
        </div>
      </div>

      {/* ── Period tabs ── */}
      <div className="flex gap-1 bg-apple-secondary border border-apple-separator overflow-x-auto no-scrollbar p-1 rounded-xl">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex-1 min-w-[56px] py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest whitespace-nowrap transition-all",
              tab === t.id
                ? "bg-apple-bg text-apple-text shadow-sm"
                : "text-apple-text-tertiary hover:text-apple-text-secondary"
            )}
          >{t.label}</button>
        ))}
      </div>

      {/* ── Custom Date Picker ── */}
      <div className="flex items-center gap-3 bg-apple-bg border border-apple-separator p-2 rounded-2xl shadow-apple-soft w-fit">
        <div className="flex items-center gap-2 px-2 border-r border-apple-separator/50 mr-2">
          <Calendar className="w-4 h-4 text-apple-blue" />
          <span className="text-[11px] font-bold text-apple-text-tertiary uppercase tracking-wider">Referencia:</span>
        </div>
        <input 
          type="date" 
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="bg-apple-slate/50 border-none rounded-xl px-3 py-1.5 text-[12px] font-bold text-apple-black focus:ring-2 focus:ring-apple-blue/20 outline-none transition-all cursor-pointer"
        />
        {selectedDate !== getLocalDateString() && (
          <button 
            onClick={() => setSelectedDate(getLocalDateString())}
            className="text-[10px] font-bold text-apple-blue hover:underline uppercase tracking-widest px-2"
          >
            Hoy
          </button>
        )}
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <StatCard label="Ingresos Totales" value={fmt(ingresos)} sub={tab} icon={TrendingUp} bg="" color="text-apple-text-secondary" />
        <StatCard label="Egresos" value={fmt(egresos)} sub={tab} icon={TrendingDown} bg="" color="text-apple-text-secondary" />
        <StatCard label="Flujo Neto" value={fmt(balance)} sub="Inc − Egr" icon={Activity} bg="" color="text-apple-text-secondary" />
        <StatCard label="Caja (Efectivo)" value={fmt(getExpectedCash())} sub="Físico Esperado" icon={Wallet} bg="" color="text-apple-text-secondary" />
        <div className="col-span-2 sm:col-span-1 bg-apple-black rounded-2xl p-4 sm:p-5 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-apple-bg/10 flex items-center justify-center shrink-0 mt-0.5">
            <DollarSign className="w-5 h-5 text-apple-bg" strokeWidth={1.5} />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-widest text-apple-bg/50">Balance</div>
            <div className={cn("text-[18px] sm:text-[20px] font-black tabular-nums leading-none my-0.5 truncate", balance >= 0 ? "text-apple-green" : "text-apple-red")}>{fmt(balance)}</div>
            <div className="text-[11px] font-medium text-apple-bg/40">{balance >= 0 ? 'Positivo' : 'Negativo'}</div>
          </div>
        </div>
      </div>

      {/* ── Method Breakdown Visualization ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Efectivo', val: periodTxs.filter(t => t.type === 'income' && t.method === 'Efectivo' && !t.cancelled).reduce((s, t) => s + t.amount, 0), icon: Banknote, color: 'text-apple-green', bg: 'bg-apple-green/5' },
          { label: 'Tarjeta', val: periodTxs.filter(t => t.type === 'income' && t.method === 'Tarjeta' && !t.cancelled).reduce((s, t) => s + t.amount, 0), icon: CreditCard, color: 'text-apple-blue', bg: 'bg-apple-blue/5' },
          { label: 'Transferencia', val: periodTxs.filter(t => t.type === 'income' && t.method === 'Transferencia' && !t.cancelled).reduce((s, t) => s + t.amount, 0), icon: Landmark, color: 'text-purple-500', bg: 'bg-purple-500/5' },
        ].map(m => (
          <div key={m.label} className="bg-apple-bg border border-apple-separator rounded-2xl p-4 flex items-center justify-between shadow-sm hover:shadow-apple-soft transition-all">
            <div className="flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", m.bg)}>
                <m.icon className={cn("w-5 h-5", m.color)} strokeWidth={2} />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-apple-text-tertiary">{m.label}</div>
                <div className="text-[16px] font-bold text-apple-text tabular-nums">{fmt(m.val)}</div>
              </div>
            </div>
            <div className="text-[11px] font-bold text-apple-text-tertiary">
              {ingresos > 0 ? Math.round((m.val / ingresos) * 100) : 0}%
            </div>
          </div>
        ))}
      </div>

      {/* ── Chart ── */}
      <div className="bg-apple-bg border border-apple-separator rounded-2xl p-5 sm:p-6 shadow-sm">
        <h3 className="text-[15px] font-bold text-apple-text mb-5">Ingresos vs Egresos</h3>
        <div className="h-[200px] sm:h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F7" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#8E8E93', fontSize: 11, fontWeight: 'bold' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8E8E93', fontSize: 10 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: any) => fmt(v)} contentStyle={{ borderRadius: '12px', border: '1px solid #E5E5EA', fontSize: 12, fontWeight: 'bold' }} />
              <Legend wrapperStyle={{ fontSize: 11, fontWeight: 'bold', paddingTop: 12 }} />
              <Bar dataKey="ingresos" name="Ingresos" fill="#007AFF" radius={[6, 6, 0, 0]} />
              <Bar dataKey="egresos" name="Egresos" fill="#8E8E93" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Section toggle ── */}
      <div className="flex gap-1 bg-apple-secondary border border-apple-separator p-1 rounded-xl w-fit">
        {[
          { id: 'movimientos', label: 'Movimientos' },
          { id: 'cortes', label: `Cortes (${cortes.length})` },
        ].map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id as any)}
            className={cn("px-5 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all",
              activeSection === s.id
                ? "bg-apple-bg text-apple-text shadow-sm"
                : "text-apple-text-tertiary hover:text-apple-text-secondary"
            )}>{s.label}</button>
        ))}
      </div>

      {/* ── Movimientos ── */}
      {activeSection === 'movimientos' && (
        <div className="bg-apple-bg border border-apple-separator rounded-2xl overflow-hidden shadow-sm">
          {periodTxs.length === 0 ? (
            <div className="py-16 flex flex-col items-center text-center">
              <FileText className="w-10 h-10 text-apple-text-tertiary opacity-30 mb-3" />
              <p className="text-[13px] font-bold text-apple-text">Sin movimientos en este período</p>
            </div>
          ) : (
            <div>
              <div className="hidden sm:grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-6 py-3 border-b border-apple-separator bg-apple-secondary">
                <div className="text-[10px] font-black uppercase tracking-widest text-apple-text-tertiary w-24">Fecha</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-apple-text-tertiary">Concepto</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-apple-text-tertiary">Método</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-apple-text-tertiary text-right">Monto</div>
                <div className="w-6" />
              </div>
              <div className="divide-y divide-apple-separator">
                {periodTxs.map(tx => (
                  <div key={tx.id} className={cn("px-4 sm:px-6 py-4 transition-colors group flex flex-col sm:grid sm:grid-cols-[auto_1fr_auto_auto_auto] sm:gap-4 sm:items-center", tx.cancelled ? "bg-apple-secondary/50 opacity-60 grayscale-[0.5]" : "hover:bg-apple-secondary")}>
                    <div className="flex items-center gap-2 mb-2 sm:mb-0 sm:w-24">
                      <div className={cn("w-2 h-2 rounded-full shrink-0", tx.cancelled ? "bg-apple-text-tertiary" : (tx.type === 'income' ? 'bg-apple-green' : 'bg-apple-red'))} />
                      <div>
                        <div className={cn("text-[10px] font-bold text-apple-text tabular-nums", tx.cancelled && "line-through")}>{tx.date.slice(5)}</div>
                        <div className="text-[9px] text-apple-text-tertiary tabular-nums">{tx.timestamp}</div>
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className={cn("text-[13px] font-bold text-apple-text truncate", tx.cancelled && "line-through")}>{tx.concept}</div>
                      <div className="text-[11px] text-apple-text-secondary flex items-center gap-2 flex-wrap">
                        {tx.cancelled && <span className="text-[9px] font-black tracking-widest uppercase text-apple-red px-1 bg-apple-red/10 rounded">Anulado</span>}
                        {tx.category && <span className="font-medium">{tx.category}</span>}
                        {tx.patientName && <span>· {tx.patientName}</span>}
                        {tx.nota && <span className="text-apple-text-tertiary italic">· {tx.nota}</span>}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2 sm:contents">
                      <MethodBadge method={tx.method} />
                      <div className="flex flex-col items-end">
                        <span className={cn("text-[15px] font-black tabular-nums", tx.cancelled ? "text-apple-text-tertiary line-through" : (tx.type === 'income' ? 'text-apple-green' : 'text-apple-red'))}>
                          {tx.type === 'income' ? '+' : '−'}{fmt(tx.amount)}
                        </span>
                        {tx.userName && <span className="text-[8px] font-bold text-apple-text-tertiary uppercase tracking-widest sm:hidden">{tx.userName}</span>}
                      </div>

                      <div className="flex items-center justify-end gap-1 w-16">
                        {tx.type === 'income' && !tx.cancelled && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              setTxToReceipt({ ...tx });
                            }}
                            className="p-2 rounded-xl text-apple-blue hover:bg-apple-blue/10 transition-all opacity-60 hover:opacity-100"
                            title="Preparar Recibo"
                          >
                            <FileText className="w-4 h-4" strokeWidth={2} />
                          </button>
                        )}
                        {tx.type === 'expense' && !tx.cancelled && tx.receiptUrl && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              openReceiptInNewTab(tx.receiptUrl!);
                            }}
                            className="p-2 rounded-xl text-apple-green hover:bg-apple-green/10 transition-all opacity-60 hover:opacity-100"
                            title="Ver Comprobante"
                          >
                            <FileText className="w-4 h-4" strokeWidth={2} />
                          </button>
                        )}
                        {(() => {
                          if (tx.cancelled) return null;
                          const isLocked = tx.cajaId && cajas.find(c => c.id === tx.cajaId)?.estado === 'cerrada';
                          
                          return (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                if (isLocked) return;
                                setTxToCancel(tx);
                              }}
                              className={cn(
                                "p-2 rounded-xl transition-all flex items-center justify-center",
                                isLocked 
                                  ? "text-apple-text-tertiary opacity-10 cursor-not-allowed" 
                                  : "text-apple-text-tertiary hover:text-apple-red hover:bg-apple-red/5 opacity-40 hover:opacity-100"
                              )} 
                              title={isLocked ? "Movimiento bloqueado" : "Anular Movimiento"}
                            >
                              {isLocked ? (
                                <Lock className="w-3.5 h-3.5" strokeWidth={2.5} />
                              ) : (
                                <Ban className="w-4 h-4" strokeWidth={2.5} />
                              )}
                            </button>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Cortes ── */}
      {activeSection === 'cortes' && (
        <div className="space-y-4">
          {caja && (
            <div className="bg-apple-secondary border border-apple-separator rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-apple-bg border border-apple-separator rounded-xl flex items-center justify-center">
                  <Unlock className="w-5 h-5 text-apple-text-tertiary" strokeWidth={1.5} />
                </div>
                <div>
                  <div className="text-[13px] font-bold text-apple-text">Caja {caja.tipo} en curso</div>
                  <div className="text-[11px] font-medium text-apple-text-secondary">Desde {caja.fechaApertura} · Fondo: {fmt(caja.fondoInicial)}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-right">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-apple-text-tertiary">Flujo</div>
                    <div className={cn("text-[18px] font-black tabular-nums", cajaFlujo >= 0 ? 'text-apple-text' : 'text-apple-red')}>{fmt(cajaFlujo)}</div>
                  </div>
                </div>
                <button onClick={() => setShowCerrar(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-apple-black text-apple-bg text-[11px] font-bold uppercase tracking-widest hover:opacity-80 transition-all active:scale-95">
                  <Lock className="w-3.5 h-3.5" strokeWidth={2} /> Cerrar
                </button>
              </div>
            </div>
          )}

          {cortes.length === 0 ? (
            <div className="bg-apple-bg border border-apple-separator rounded-2xl py-16 flex flex-col items-center text-center">
              <History className="w-10 h-10 text-apple-text-tertiary opacity-30 mb-3" />
              <p className="text-[13px] font-bold text-apple-text">Sin cortes registrados</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cortes.map(c => (
                <div key={c.id} className="bg-apple-bg border border-apple-separator rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-apple-bg border border-apple-separator rounded-xl flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-apple-text-tertiary" strokeWidth={1.5} />
                      </div>
                      <div>
                        <div className="text-[14px] font-bold text-apple-text">{c.label}</div>
                        <div className="text-[11px] font-medium text-apple-text-secondary">{c.fechaInicio} → {c.fechaFin}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleExportPDF(c)}
                      disabled={exportingId === c.id}
                      className="flex items-center gap-1.5 px-4 py-2 border border-apple-separator rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-apple-bg transition-all active:scale-95 disabled:opacity-50"
                    >
                      {exportingId === c.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Printer className="w-3.5 h-3.5" strokeWidth={2} />}
                      {exportingId === c.id ? 'Generando...' : 'PDF'}
                    </button>
                  </div>
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {[
                      { label: 'Fondo Inicial', value: fmt(c.fondoInicial), color: 'text-apple-text' },
                      { label: 'Ingresos', value: fmt(c.totalIngresos), color: 'text-apple-green' },
                      { label: 'Egresos', value: fmt(c.totalEgresos), color: 'text-apple-red' },
                      { label: 'Flujo Neto', value: fmt(c.flujoNeto), color: c.flujoNeto >= 0 ? 'text-apple-green' : 'text-apple-red' },
                      { label: 'Esp. Efectivo', value: fmt(c.efectivoEsperado), color: 'text-apple-text' },
                      { label: 'Diferencia', value: fmt(c.diferencia), color: Math.abs(c.diferencia) < 1 ? 'text-apple-green' : 'text-apple-red' },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="bg-apple-secondary rounded-xl p-3 text-center">
                        <div className="text-[9px] font-bold uppercase tracking-widest text-apple-text-tertiary mb-1">{label}</div>
                        <div className={cn("text-[14px] font-black tabular-nums", color)}>{value}</div>
                      </div>
                    ))}
                    <div className="col-span-2 sm:col-span-3 lg:col-span-6 mt-4 flex justify-center">
                      <button onClick={() => setSelectedCorteForDetail(c)} className="flex items-center gap-2 text-apple-blue font-bold text-[11px] uppercase tracking-widest hover:bg-apple-blue/5 px-6 py-2 rounded-xl transition-all">
                        <FileSearch className="w-4 h-4" /> Ver Desglose Detallado
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}


      {/* ── Modals ── */}
      <TxModal isOpen={showTx} onClose={() => setShowTx(false)} />
      <AbrirCajaModal isOpen={showAbrir} onClose={() => setShowAbrir(false)} />
      <CerrarCajaModal isOpen={showCerrar} onClose={() => setShowCerrar(false)} />
      <CorteDetailModal
        isOpen={!!selectedCorteForDetail}
        onClose={() => setSelectedCorteForDetail(null)}
        corte={selectedCorteForDetail}
        transactions={transactions}
      />

      {/* Receipt Editor Modal */}
      {txToReceipt && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-apple">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setTxToReceipt(null)} />
          <div className="bg-apple-bg w-full max-w-md rounded-[32px] p-8 shadow-apple-huge relative z-10 border border-apple-separator animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[18px] font-bold text-apple-black">Preparar Recibo</h3>
              <div className="px-3 py-1 bg-apple-blue/10 text-apple-blue rounded-full text-[10px] font-black uppercase tracking-widest">
                Folio: #{txToReceipt.id.slice(0, 8)}
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-apple-text-tertiary uppercase tracking-widest ml-1">Fecha del Recibo</label>
                <input
                  type="date"
                  value={txToReceipt.date}
                  onChange={(e) => setTxToReceipt({ ...txToReceipt, date: e.target.value })}
                  className="w-full h-12 bg-apple-slate border-none rounded-2xl px-4 text-[13px] font-bold text-apple-black focus:ring-2 focus:ring-apple-blue transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-apple-text-tertiary uppercase tracking-widest ml-1">Concepto</label>
                <input
                  type="text"
                  value={txToReceipt.concept}
                  onChange={(e) => setTxToReceipt({ ...txToReceipt, concept: e.target.value })}
                  className="w-full h-12 bg-apple-slate border-none rounded-2xl px-4 text-[13px] font-bold text-apple-black focus:ring-2 focus:ring-apple-blue transition-all"
                  placeholder="Ej. Sesión de Terapia"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-apple-text-tertiary uppercase tracking-widest ml-1">Monto ($)</label>
                  <input
                    type="number"
                    value={txToReceipt.amount}
                    onChange={(e) => setTxToReceipt({ ...txToReceipt, amount: Number(e.target.value) })}
                    className="w-full h-12 bg-apple-slate border-none rounded-2xl px-4 text-[13px] font-bold text-apple-black focus:ring-2 focus:ring-apple-blue transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-apple-text-tertiary uppercase tracking-widest ml-1">Método</label>
                  <select
                    value={txToReceipt.method}
                    onChange={(e) => setTxToReceipt({ ...txToReceipt, method: e.target.value })}
                    className="w-full h-12 bg-apple-slate border-none rounded-2xl px-4 text-[13px] font-bold text-apple-black focus:ring-2 focus:ring-apple-blue transition-all appearance-none"
                  >
                    <option value="Efectivo">Efectivo</option>
                    <option value="Tarjeta">Tarjeta</option>
                    <option value="Transferencia">Transferencia</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-apple-text-tertiary uppercase tracking-widest ml-1">Paciente</label>
                <input
                  type="text"
                  value={txToReceipt.patientName}
                  onChange={(e) => setTxToReceipt({ ...txToReceipt, patientName: e.target.value })}
                  className="w-full h-12 bg-apple-slate border-none rounded-2xl px-4 text-[13px] font-bold text-apple-black focus:ring-2 focus:ring-apple-blue transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 mt-8">
              <button
                onClick={() => {
                  handlePrintReceipt(txToReceipt);
                  setTxToReceipt(null);
                }}
                className="w-full py-4 bg-apple-blue text-white text-[12px] font-black uppercase tracking-widest rounded-2xl shadow-apple-soft hover:bg-blue-600 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Generar PDF Ahora
              </button>
              <button
                onClick={() => setTxToReceipt(null)}
                className="w-full py-4 bg-apple-slate text-apple-text-secondary text-[12px] font-black uppercase tracking-widest rounded-2xl hover:bg-apple-separator/30 transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal for Cancellation */}
      {txToCancel && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-apple">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setTxToCancel(null)} />
          <div className="bg-apple-bg w-full max-w-sm rounded-[32px] p-8 shadow-apple-huge relative z-10 border border-apple-separator animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-apple-red/10 rounded-2xl flex items-center justify-center text-apple-red mb-6 mx-auto">
              <Ban className="w-8 h-8" strokeWidth={2.5} />
            </div>
            <h3 className="text-[18px] font-black text-apple-black text-center mb-2">¿Anular movimiento?</h3>
            <p className="text-[13px] text-apple-text-tertiary text-center mb-8 leading-relaxed">
              Estás por anular el registro de <span className="font-bold text-apple-black">"{txToCancel.concept}"</span> por <span className="font-bold text-apple-red">{fmt(txToCancel.amount)}</span>. Esta acción quedará registrada en la auditoría.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={async () => {
                  await cancelTransaction(txToCancel.id);
                  setTxToCancel(null);
                }}
                className="w-full py-4 bg-apple-red text-white text-[12px] font-black uppercase tracking-widest rounded-2xl shadow-apple-soft hover:bg-red-600 transition-all active:scale-95"
              >
                Confirmar Anulación
              </button>
              <button
                onClick={() => setTxToCancel(null)}
                className="w-full py-4 bg-apple-slate text-apple-text-secondary text-[12px] font-black uppercase tracking-widest rounded-2xl hover:bg-apple-separator/30 transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
