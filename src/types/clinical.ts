
export interface Patient {
  id: string;
  name: string;
  lastNamePaterno?: string;
  lastNameMaterno?: string;
  age: number;
  caseId: string;
  tutor?: string;
  relationship?: string;
  phone?: string;
  email?: string;
  birthDate?: string;
  gender?: string;
  consultReason?: string;
  initialNotes?: string;
  attendanceDays?: string[];
  appointmentTime?: string;
  sessionCost?: string;
  requiresInvoice?: boolean;
  schoolName?: string;
  schoolPhone?: string;
  schoolEmail?: string;
  schoolGrade?: string;
  schoolGroup?: string;
  curp?: string;
  firstAppointmentDate?: string;
  firstAppointmentTime?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  specialistId: string;
  specialistName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  type: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'absent';
  isPaid?: boolean;
  sessionCost?: number;
  isAccountingLogged?: boolean;
}

export interface EvolutionNote {
  id: string;
  patientId: string;
  date: string;
  time: string;
  content: string;
  specialistId: string;
  specialistName: string;
  templateType: 'Individual' | 'Grupal' | 'Padres';
}
