export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      patients: {
        Row: {
          id: string
          case_id: string
          name: string
          last_name_paterno: string | null
          last_name_materno: string | null
          age: number | null
          gender: string | null
          birth_date: string | null
          tutor: string | null
          relationship: string | null
          phone: string | null
          email: string | null
          consult_reason: string | null
          initial_notes: string | null
          attendance_days: string[] | null
          appointment_time: string | null
          session_cost: number | null
          requires_invoice: boolean | null
          school_name: string | null
          school_phone: string | null
          school_email: string | null
          school_grade: string | null
          school_group: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          case_id: string
          name: string
          last_name_paterno?: string | null
          last_name_materno?: string | null
          age?: number | null
          gender?: string | null
          birth_date?: string | null
          tutor?: string | null
          relationship?: string | null
          phone?: string | null
          email?: string | null
          consult_reason?: string | null
          initial_notes?: string | null
          attendance_days?: string[] | null
          appointment_time?: string | null
          session_cost?: number | null
          requires_invoice?: boolean | null
          school_name?: string | null
          school_phone?: string | null
          school_email?: string | null
          school_grade?: string | null
          school_group?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          case_id?: string
          name?: string
          last_name_paterno?: string | null
          last_name_materno?: string | null
          age?: number | null
          gender?: string | null
          birth_date?: string | null
          tutor?: string | null
          relationship?: string | null
          phone?: string | null
          email?: string | null
          consult_reason?: string | null
          initial_notes?: string | null
          attendance_days?: string[] | null
          appointment_time?: string | null
          session_cost?: number | null
          requires_invoice?: boolean | null
          school_name?: string | null
          school_phone?: string | null
          school_email?: string | null
          school_grade?: string | null
          school_group?: string | null
          created_at?: string | null
        }
      }
      specialists: {
        Row: {
          id: string
          name: string
          email: string | null
          specialty: string | null
          bank_info: string | null
          payment_schema: string | null
          payment_value: number | null
          status: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          specialty?: string | null
          bank_info?: string | null
          payment_schema?: string | null
          payment_value?: number | null
          status?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          specialty?: string | null
          bank_info?: string | null
          payment_schema?: string | null
          payment_value?: number | null
          status?: string | null
          created_at?: string | null
        }
      }
      appointments: {
        Row: {
          id: string
          patient_id: string | null
          specialist_id: string | null
          date: string
          time: string
          type: string | null
          status: string | null
          is_paid: boolean | null
          session_cost: number | null
          is_accounting_logged: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          patient_id?: string | null
          specialist_id?: string | null
          date: string
          time: string
          type?: string | null
          status?: string | null
          is_paid?: boolean | null
          session_cost?: number | null
          is_accounting_logged?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          patient_id?: string | null
          specialist_id?: string | null
          date?: string
          time?: string
          type?: string | null
          status?: string | null
          is_paid?: boolean | null
          session_cost?: number | null
          is_accounting_logged?: boolean | null
          created_at?: string | null
        }
      }
      cajas: {
        Row: {
          id: string
          tipo: string | null
          fecha_apertura: string
          fondo_inicial: number
          usuario: string | null
          estado: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          tipo?: string | null
          fecha_apertura: string
          fondo_inicial: number
          usuario?: string | null
          estado?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          tipo?: string | null
          fecha_apertura?: string
          fondo_inicial?: number
          usuario?: string | null
          estado?: string | null
          created_at?: string | null
        }
      }
      transactions: {
        Row: {
          id: string
          caja_id: string | null
          date: string
          timestamp: string
          amount: number
          concept: string
          type: string | null
          method: string | null
          category: string | null
          patient_id: string | null
          specialist_id: string | null
          clinic_retention: number | null
          specialist_payment: number | null
          cancelled: boolean | null
          nota: string | null
          receipt_url: string | null
          user_name: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          caja_id?: string | null
          date: string
          timestamp: string
          amount: number
          concept: string
          type?: string | null
          method?: string | null
          category?: string | null
          patient_id?: string | null
          specialist_id?: string | null
          clinic_retention?: number | null
          specialist_payment?: number | null
          cancelled?: boolean | null
          nota?: string | null
          receipt_url?: string | null
          user_name?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          caja_id?: string | null
          date?: string
          timestamp?: string
          amount?: number
          concept?: string
          type?: string | null
          method?: string | null
          category?: string | null
          patient_id?: string | null
          specialist_id?: string | null
          clinic_retention?: number | null
          specialist_payment?: number | null
          cancelled?: boolean | null
          nota?: string | null
          receipt_url?: string | null
          user_name?: string | null
          created_at?: string | null
        }
      }
      cortes: {
        Row: {
          id: string
          caja_id: string | null
          tipo: string | null
          label: string | null
          fecha_inicio: string | null
          fecha_fin: string | null
          fondo_inicial: number | null
          total_ingresos: number | null
          total_egresos: number | null
          flujo_neto: number | null
          efectivo_esperado: number | null
          efectivo_real: number | null
          diferencia: number | null
          usuario: string | null
          fecha_corte: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          caja_id?: string | null
          tipo?: string | null
          label?: string | null
          fecha_inicio?: string | null
          fecha_fin?: string | null
          fondo_inicial?: number | null
          total_ingresos?: number | null
          total_egresos?: number | null
          flujo_neto?: number | null
          efectivo_esperado?: number | null
          efectivo_real?: number | null
          diferencia?: number | null
          usuario?: string | null
          fecha_corte?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          caja_id?: string | null
          tipo?: string | null
          label?: string | null
          fecha_inicio?: string | null
          fecha_fin?: string | null
          fondo_inicial?: number | null
          total_ingresos?: number | null
          total_egresos?: number | null
          flujo_neto?: number | null
          efectivo_esperado?: number | null
          efectivo_real?: number | null
          diferencia?: number | null
          usuario?: string | null
          fecha_corte?: string | null
          created_at?: string | null
        }
      }
      evaluations: {
        Row: {
          id: string
          patient_id: string | null
          title: string
          date: string | null
          score: string | null
          status: string | null
          conclusion: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          patient_id?: string | null
          title: string
          date?: string | null
          score?: string | null
          status?: string | null
          conclusion?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          patient_id?: string | null
          title?: string
          date?: string | null
          score?: string | null
          status?: string | null
          conclusion?: string | null
          created_at?: string | null
        }
      }
      goals: {
        Row: {
          id: string
          patient_id: string | null
          title: string
          indicator: string | null
          progress: number | null
          status: string | null
          responsible: string | null
          target_date: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          patient_id?: string | null
          title: string
          indicator?: string | null
          progress?: number | null
          status?: string | null
          responsible?: string | null
          target_date?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          patient_id?: string | null
          title?: string
          indicator?: string | null
          progress?: number | null
          status?: string | null
          responsible?: string | null
          target_date?: string | null
          created_at?: string | null
        }
      }
      clinical_logs: {
        Row: {
          id: string
          patient_id: string | null
          date: string | null
          type: string | null
          entity: string | null
          description: string | null
          by_user: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          patient_id?: string | null
          date?: string | null
          type?: string | null
          entity?: string | null
          description?: string | null
          by_user?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          patient_id?: string | null
          date?: string | null
          type?: string | null
          entity?: string | null
          description?: string | null
          by_user?: string | null
          created_at?: string | null
        }
      }
      timeline_notes: {
        Row: {
          id: string
          patient_id: string | null
          date: string | null
          time: string | null
          content: string | null
          specialist_id: string | null
          template_type: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          patient_id?: string | null
          date?: string | null
          time?: string | null
          content?: string | null
          specialist_id?: string | null
          template_type?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          patient_id?: string | null
          date?: string | null
          time?: string | null
          content?: string | null
          specialist_id?: string | null
          template_type?: string | null
          created_at?: string | null
        }
      }
    }
  }
}
