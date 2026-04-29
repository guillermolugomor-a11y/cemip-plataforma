export interface Evaluation {
  id: string;
  patientId: string;
  title: string;
  date: string;
  score: string | null;
  status: 'completed' | 'pending';
  conclusion: string;
}

export interface Goal {
  id: string;
  patientId: string;
  title: string;
  indicator: string;
  progress: number;
  status: 'achieved' | 'pending';
  responsible: string;
  targetDate: string;
}

export interface ClinicalLog {
  id: string;
  patientId: string;
  date: string;
  type: 'llamada' | 'email' | 'reunion' | 'whatsapp';
  entity: string;
  description: string;
  by: string;
}

export interface TimelineNote {
  id: string;
  patientId: string;
  date: string;
  time: string;
  type: 'Sesión' | 'Evaluación' | 'Nota';
  content: string;
  author: string;
}
