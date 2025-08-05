// src/core/use-cases/treatments/types.ts - COMPLETADO
export interface Treatment {
  id_tratamiento: number;
  id_paciente: number;
  id_doctor: number;
  budget_item_id?: number; // ✅ ID del item del presupuesto
  fecha_control: string;
  hora_control: string;
  fecha_proximo_control?: string;
  hora_proximo_control?: string;
  nombre_servicio: string;
  producto?: string;
  lote_producto?: string;
  fecha_venc_producto?: string;
  dilucion?: string;
  foto1?: string;
  foto2?: string;
  descripcion?: string;
  status?: string; // ✅ Estado del tratamiento (pending, completed)
  created_at: string;
  updated_at?: string;
  is_active: boolean;
  // ✅ Datos del presupuesto asociado
  budget_item_pieza?: string;
  budget_item_valor?: string;
}

// ✅ INTERFACE: Budget simplificado para selector
export interface BudgetSummary {
  id: number;
  budget_type: string;
  status: string;
  total_amount: string;
  created_at: string;
}

export interface CreateTreatmentData {
  id_paciente: number;
  budget_item_id?: number; // ✅ Opcional para tratamientos vinculados a presupuesto
  fecha_control: string;
  hora_control: string;
  fecha_proximo_control?: string;
  hora_proximo_control?: string;
  nombre_servicio: string;
  producto?: string;
  lote_producto?: string;
  fecha_venc_producto?: string;
  dilucion?: string;
  foto1?: string;
  foto2?: string;
  descripcion?: string;
}

export interface UpdateTreatmentData {
  fecha_control?: string;
  hora_control?: string;
  fecha_proximo_control?: string;
  hora_proximo_control?: string;
  nombre_servicio?: string;
  producto?: string;
  lote_producto?: string;
  fecha_venc_producto?: string;
  dilucion?: string;
  foto1?: string;
  foto2?: string;
  descripcion?: string;
  status?: string; // ✅ Para cambiar estado del tratamiento
}

export interface GetTreatmentsResponse {
  treatments: Treatment[];
  total: number;
}

export interface GetTreatmentByIdResponse {
  treatment: Treatment;
}

export interface CreateTreatmentResponse {
  message: string;
  treatment: Treatment;
}

export interface UpdateTreatmentResponse {
  message: string;
  treatment: Treatment;
}

export interface DeleteTreatmentResponse {
  message: string;
}

// ✅ NUEVAS INTERFACES PARA PRESUPUESTOS
export interface GetBudgetSummariesResponse {
  budgets: BudgetSummary[];
  total: number;
}

export interface GetTreatmentsByBudgetResponse {
  treatments: Treatment[];
  budget: BudgetSummary;
  total: number;
}