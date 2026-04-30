import { create } from 'zustand';
import { supabase } from '../../lib/supabase';
import type { Transaction, Caja, Corte } from './types';
import { getLocalDateString } from '../../lib/dateUtils';
export type { Transaction, Caja, Corte };

// ── Helpers ───────────────────────────────────────────────────────────────
const toUuidOrNull = (val: string | undefined | null): string | null => {
  if (!val) return null;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(val) ? val : null;
};

function filterByRange(txs: Transaction[], start: string, end: string) {
  return txs.filter(t => t.date >= start && t.date <= end);
}

// ── Types ─────────────────────────────────────────────────────────────────
interface AccountingState {
  transactions: Transaction[];
  cajas: Caja[];
  cortes: Corte[];
  activeCajaId: string | null;
  isLoading: boolean;
  error: string | null;

  fetchAccounting: () => Promise<void>;

  addTransaction: (tx: Omit<Transaction, 'id' | 'timestamp'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  cancelTransaction: (id: string) => Promise<void>;

  abrirCaja: (fondoInicial: number, tipo?: 'semanal' | 'mensual') => Promise<void>;
  cerrarCaja: (efectivoReal: number) => Promise<Corte | null>;

  getActiveCaja: () => Caja | null;
  getTxsByCaja: (cajaId: string) => Transaction[];
  getTxsByPeriod: (start: string, end: string) => Transaction[];
  sumIngresos: (txs: Transaction[]) => number;
  sumEgresos: (txs: Transaction[]) => number;
  getExpectedCash: (cajaId?: string) => number;
  getBalance: () => number;
}

// ── Store ─────────────────────────────────────────────────────────────────
export const useAccountingStore = create<AccountingState>()((set, get) => ({
  transactions: [],
  cajas: [],
  cortes: [],
  activeCajaId: null,
  isLoading: false,
  error: null,

  fetchAccounting: async () => {
    set({ isLoading: true, error: null });
    try {
      const [txRes, cajaRes, corteRes] = await Promise.all([
        supabase.from('transactions').select('*').order('date', { ascending: false }),
        supabase.from('cajas').select('*').order('created_at', { ascending: false }),
        supabase.from('cortes').select('*').order('fecha_corte', { ascending: false }),
      ]);

      if (txRes.error) throw txRes.error;
      if (cajaRes.error) throw cajaRes.error;
      if (corteRes.error) throw corteRes.error;

      const txData = txRes.data as any[] || [];
      const transactions: Transaction[] = txData.map(d => ({
        id: d.id,
        date: d.date,
        timestamp: d.timestamp,
        amount: d.amount,
        concept: d.concept,
        type: d.type as 'income' | 'expense',
        method: d.method as 'Efectivo' | 'Tarjeta' | 'Transferencia',
        category: d.category || undefined,
        patientId: d.patient_id || undefined,
        specialistId: d.specialist_id || undefined,
        clinicRetention: d.clinic_retention || undefined,
        specialistPayment: d.specialist_payment || undefined,
        cajaId: d.caja_id || undefined,
        userName: d.user_name || undefined,
        cancelled: d.cancelled || false,
        nota: d.nota || undefined,
        receiptUrl: d.receipt_url || undefined,
      }));

      const cajasData = cajaRes.data as any[] || [];
      const cajas: Caja[] = cajasData.map(d => ({
        id: d.id,
        tipo: d.tipo as 'semanal' | 'mensual',
        fechaApertura: d.fecha_apertura,
        fondoInicial: d.fondo_inicial,
        usuario: d.usuario || '',
        estado: d.estado as 'abierta' | 'cerrada',
      }));

      const cortesData = corteRes.data as any[] || [];
      const cortes: Corte[] = cortesData.map(d => ({
        id: d.id,
        tipo: d.tipo as any,
        label: d.label || '',
        fechaInicio: d.fecha_inicio || '',
        fechaFin: d.fecha_fin || '',
        fondoInicial: d.fondo_inicial || 0,
        totalIngresos: d.total_ingresos || 0,
        totalEgresos: d.total_egresos || 0,
        flujoNeto: d.flujo_neto || 0,
        efectivoEsperado: d.efectivo_esperado || 0,
        efectivoReal: d.efectivo_real || 0,
        diferencia: d.diferencia || 0,
        usuario: d.usuario || '',
        fechaCorte: d.fecha_corte || '',
        cajaId: d.caja_id || undefined,
      }));

      const activeCaja = cajas.find(c => c.estado === 'abierta');

      set({
        transactions,
        cajas,
        cortes,
        activeCajaId: activeCaja?.id || null,
        isLoading: false,
      });
    } catch (err: any) {
      console.error('Error fetching accounting:', err);
      set({ error: err.message, isLoading: false });
    }
  },

  // ── Transactions ──────────────────────────────
  async addTransaction(tx) {
    const { activeCajaId, transactions } = get();
    const now = new Date();
    const timestamp = now.toLocaleTimeString('es-MX', { hour12: false });

    // Anti-duplicación
    const isDuplicate = transactions.some(t =>
      t.concept === tx.concept &&
      t.amount === tx.amount &&
      t.date === tx.date &&
      t.type === tx.type &&
      !t.cancelled &&
      Math.abs(new Date(`${t.date}T${t.timestamp}`).getTime() - now.getTime()) < 30000
    );

    if (isDuplicate) {
      console.warn('Bloqueo de duplicidad: Ya existe una transacción idéntica registrada recientemente.');
      return;
    }

    // Regla de Negocio: 40% Clínica / 60% Especialista
    const clinicRetention = tx.type === 'income' ? tx.amount * 0.4 : 0;
    const specialistPayment = tx.type === 'income' ? tx.amount * 0.6 : 0;

    try {
      const dbPayload = {
        date: tx.date,
        timestamp,
        amount: tx.amount,
        concept: tx.concept,
        type: tx.type,
        method: tx.method,
        category: tx.category || null,
        patient_id: toUuidOrNull(tx.patientId),
        specialist_id: toUuidOrNull(tx.specialistId),
        clinic_retention: clinicRetention,
        specialist_payment: specialistPayment,
        caja_id: activeCajaId || null,
        user_name: 'Dr. Alejandro',
        cancelled: false,
        nota: tx.nota || null,
        receipt_url: tx.receiptUrl || null,
      };

      const { data, error } = await supabase
        .from('transactions')
        .insert(dbPayload)
        .select()
        .single();

      if (error) throw error;

      const resData = data as any;
      const newTx: Transaction = {
        id: resData.id,
        date: resData.date,
        timestamp: resData.timestamp,
        amount: resData.amount,
        concept: resData.concept,
        type: resData.type as any,
        method: resData.method as any,
        category: resData.category || undefined,
        patientId: resData.patient_id || undefined,
        specialistId: resData.specialist_id || undefined,
        clinicRetention: resData.clinic_retention || undefined,
        specialistPayment: resData.specialist_payment || undefined,
        cajaId: resData.caja_id || undefined,
        userName: resData.user_name || undefined,
        cancelled: resData.cancelled || false,
        nota: resData.nota || undefined,
        receiptUrl: resData.receipt_url || undefined,
        patientName: tx.patientName,
        specialistName: tx.specialistName,
      };

      set(s => ({ transactions: [newTx, ...s.transactions] }));
    } catch (err: any) {
      console.error('Error adding transaction:', err);
      throw err;
    }
  },


  async deleteTransaction(id) {
    const { transactions, cajas } = get();
    const tx = transactions.find(t => t.id === id);

    if (tx?.cajaId) {
      const caja = cajas.find(c => c.id === tx.cajaId);
      if (caja?.estado === 'cerrada') {
        console.error('ERROR: No se pueden eliminar movimientos de un periodo cerrado.');
        return;
      }
    }

    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set(s => ({ transactions: s.transactions.filter(t => t.id !== id) }));
    } catch (err: any) {
      console.error('Error deleting transaction:', err);
      throw err;
    }
  },

  async cancelTransaction(id) {
    try {
      const tx = get().transactions.find(t => t.id === id);
      const nota = `ANULADO: ${tx?.nota || ''}`.trim();

      const { error } = await supabase
        .from('transactions')
        .update({ cancelled: true, nota })
        .eq('id', id);

      if (error) throw error;

      set(s => ({
        transactions: s.transactions.map(t =>
          t.id === id ? { ...t, cancelled: true, nota } : t
        )
      }));
    } catch (err: any) {
      console.error('Error cancelling transaction:', err);
      throw err;
    }
  },

  // ── Caja ──────────────────────────────────────
  async abrirCaja(fondoInicial, tipo = 'semanal') {
    try {
      const dbPayload = {
        tipo,
        fecha_apertura: getLocalDateString(),
        fondo_inicial: fondoInicial,
        usuario: 'Dr. Alejandro',
        estado: 'abierta',
      };

      const { data, error } = await supabase
        .from('cajas')
        .insert(dbPayload)
        .select()
        .single();

      if (error) throw error;

      const nuevaCaja: Caja = {
        id: data.id,
        tipo: data.tipo as any,
        fechaApertura: data.fecha_apertura,
        fondoInicial: data.fondo_inicial,
        usuario: data.usuario || '',
        estado: data.estado as any,
      };

      set(s => ({ cajas: [nuevaCaja, ...s.cajas], activeCajaId: nuevaCaja.id }));
    } catch (err: any) {
      console.error('Error opening caja:', err);
      throw err;
    }
  },

  async cerrarCaja(efectivoReal) {
    const { activeCajaId, cajas, transactions } = get();
    const caja = cajas.find(c => c.id === activeCajaId);
    if (!caja) return null;

    const cajaTxs = transactions.filter(t => t.cajaId === activeCajaId && !t.cancelled);
    const totalIngresos = cajaTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalEgresos = cajaTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    
    // Solo lo que entró o salió en EFECTIVO afecta el fondo físico
    const ingresosEfectivo = cajaTxs.filter(t => t.type === 'income' && t.method === 'Efectivo').reduce((s, t) => s + t.amount, 0);
    const egresosEfectivo = cajaTxs.filter(t => t.type === 'expense' && t.method === 'Efectivo').reduce((s, t) => s + t.amount, 0);
    
    const flujoNeto = totalIngresos - totalEgresos;
    const efectivoEsperado = caja.fondoInicial + ingresosEfectivo - egresosEfectivo;
    const diferencia = efectivoReal - efectivoEsperado;

    const [y, m, d] = caja.fechaApertura.split('-').map(Number);
    const label = `Semana del ${new Date(y, m - 1, d).toLocaleDateString('es-MX', {
      day: 'numeric', month: 'short'
    })}`;

    try {
      // 1. Cerrar la caja
      const { error: cajaError } = await supabase
        .from('cajas')
        .update({ estado: 'cerrada' })
        .eq('id', activeCajaId);

      if (cajaError) throw cajaError;

      // 2. Insertar el corte
      const cortePayload = {
        caja_id: activeCajaId,
        tipo: caja.tipo,
        label,
        fecha_inicio: caja.fechaApertura,
        fecha_fin: getLocalDateString(),
        fondo_inicial: caja.fondoInicial,
        total_ingresos: totalIngresos,
        total_egresos: totalEgresos,
        flujo_neto: flujoNeto,
        efectivo_esperado: efectivoEsperado,
        efectivo_real: efectivoReal,
        diferencia,
        usuario: caja.usuario,
      };

      const { data: corteData, error: corteError } = await supabase
        .from('cortes')
        .insert(cortePayload)
        .select()
        .single();

      if (corteError) throw corteError;

      const resData = corteData as any;
      const corte: Corte = {
        id: resData.id,
        tipo: resData.tipo as any,
        label: resData.label || '',
        fechaInicio: resData.fecha_inicio || '',
        fechaFin: resData.fecha_fin || '',
        fondoInicial: resData.fondo_inicial || 0,
        totalIngresos: resData.total_ingresos || 0,
        totalEgresos: resData.total_egresos || 0,
        flujoNeto: resData.flujo_neto || 0,
        efectivoEsperado: resData.efectivo_esperado || 0,
        efectivoReal: resData.efectivo_real || 0,
        diferencia: resData.diferencia || 0,
        usuario: resData.usuario || '',
        fechaCorte: resData.fecha_corte || '',
        cajaId: resData.caja_id || undefined,
      };

      set(s => ({
        cajas: s.cajas.map(c => c.id === activeCajaId ? { ...c, estado: 'cerrada' } : c),
        cortes: [corte, ...s.cortes],
        activeCajaId: null,
      }));

      return corte;
    } catch (err: any) {
      console.error('Error closing caja:', err);
      throw err;
    }
  },

  // ── Selectors (pure, no DB calls) ─────────────
  getActiveCaja() {
    const { cajas, activeCajaId } = get();
    return cajas.find(c => c.id === activeCajaId) ?? null;
  },

  getTxsByCaja(cajaId) {
    return get().transactions.filter(t => t.cajaId === cajaId);
  },

  getTxsByPeriod(start, end) {
    return filterByRange(get().transactions, start, end);
  },

  sumIngresos(txs) {
    return txs.filter(t => t.type === 'income' && !t.cancelled).reduce((s, t) => s + t.amount, 0);
  },

  sumEgresos(txs) {
    return txs.filter(t => t.type === 'expense' && !t.cancelled).reduce((s, t) => s + t.amount, 0);
  },

  getExpectedCash(cajaId) {
    const { transactions, cajas, activeCajaId } = get();
    const id = cajaId ?? activeCajaId;
    const caja = cajas.find(c => c.id === id);
    const fondoInicial = caja?.fondoInicial ?? 0;
    const cajaTxs = transactions.filter(t => t.cajaId === id && !t.cancelled);
    const incomes = cajaTxs.filter(t => t.type === 'income' && t.method === 'Efectivo').reduce((s, t) => s + t.amount, 0);
    const expenses = cajaTxs.filter(t => t.type === 'expense' && t.method === 'Efectivo').reduce((s, t) => s + t.amount, 0);
    return fondoInicial + incomes - expenses;
  },

  getBalance() {
    const { transactions } = get();
    const incomes = transactions.filter(t => t.type === 'income' && !t.cancelled).reduce((s, t) => s + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense' && !t.cancelled).reduce((s, t) => s + t.amount, 0);
    return incomes - expenses;
  },
}));
