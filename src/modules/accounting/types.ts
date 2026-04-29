// ─────────────────────────────────────────────
// CEMIP Accounting Types — Modelo Contable Completo
// ─────────────────────────────────────────────

export interface Transaction {
  id: string;
  date: string;          // YYYY-MM-DD
  timestamp: string;     // HH:mm:ss
  amount: number;
  concept: string;
  type: 'income' | 'expense';
  method: 'Efectivo' | 'Tarjeta' | 'Transferencia';
  category?: string;
  patientId?: string;
  patientName?: string;
  specialistId?: string;
  specialistName?: string;
  clinicRetention?: number;
  specialistPayment?: number;
  cajaId?: string;       // link to Caja
  userName?: string;    // Auditoría
  cancelled?: boolean;  // Para anulaciones
  nota?: string;
  receiptUrl?: string;  // Comprobante de pago (base64 o URL)
}

export interface Caja {
  id: string;
  tipo: 'semanal' | 'mensual';
  fechaApertura: string; // YYYY-MM-DD
  fondoInicial: number;
  usuario: string;
  estado: 'abierta' | 'cerrada';
}

export interface Corte {
  id: string;
  tipo: 'semanal' | 'mensual';
  label: string;         // "Semana 17 abr" / "Abril 2026"
  fechaInicio: string;
  fechaFin: string;
  fondoInicial: number;
  totalIngresos: number;
  totalEgresos: number;
  flujoNeto: number;
  efectivoEsperado: number;
  efectivoReal: number;
  diferencia: number;
  usuario: string;
  fechaCorte: string;    // ISO timestamp
  cajaId?: string;       // Link to the cash box
}
