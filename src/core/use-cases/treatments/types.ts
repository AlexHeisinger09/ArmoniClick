// src/core/use-cases/treatments/types.ts - ACTUALIZADO CON NUEVOS CAMPOS
export interface Treatment {
  id_tratamiento: number;
  id_paciente: number;
  id_doctor: number;
  budget_item_id?: number; // ID del item del presupuesto
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
  status?: string; // Estado del tratamiento (pending, completed)
  created_at: string;
  updated_at?: string;
  is_active: boolean;
  // Datos del presupuesto asociado
  budget_item_pieza?: string;
  budget_item_valor?: string;
  // Datos del doctor que realizó el tratamiento
  doctor_name?: string;
  doctor_lastName?: string;
}

export interface BudgetSummary {
  id: number;
  budget_type: string;
  status: string;
  total_amount: string;
  created_at: string;
  // Datos del doctor que creó el presupuesto
  doctor_name?: string;
  doctor_lastName?: string;
}

// ✅ ACTUALIZADO: Agregar campos adicionales
export interface CreateTreatmentData {
  id_paciente: number;
  budget_item_id?: number;
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
  // ✅ NUEVOS CAMPOS para crear budget item automáticamente
  selectedBudgetId?: number;
  pieza?: string;
  valor?: number;
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
  status?: string; // Para cambiar estado del tratamiento
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
  budgetItemCreated?: boolean; // ✅ NUEVO: Indica si se creó un budget item
}

export interface UpdateTreatmentResponse {
  message: string;
  treatment: Treatment;
}

export interface DeleteTreatmentResponse {
  message: string;
}

export interface GetBudgetSummariesResponse {
  budgets: BudgetSummary[];
  total: number;
}

// ✅ NUEVO: Tipo para budget_item
export interface BudgetItem {
  id: number;
  budget_id: number;
  pieza?: string;
  accion: string;
  valor: string;
  orden: number;
  status: string; // planificado, en_proceso, completado
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  treatments: Treatment[]; // Treatments asociados a este budget_item
  hasTreatments: boolean; // Si tiene treatments o no
}

export interface GetTreatmentsByBudgetResponse {
  budgetItems: BudgetItem[]; // ✅ CAMBIO: Ahora retorna budget_items en lugar de treatments
  budget: BudgetSummary;
  total: number;
}