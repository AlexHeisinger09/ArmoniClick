// src/core/use-cases/budgets/types.ts
export interface BudgetItem {
  id?: number;
  budget_id?: number;
  pieza?: string;
  accion: string;
  valor: number;
  orden?: number;
  created_at?: string;
}

export interface Budget {
  id: number;
  patient_id: number;
  user_id: number;
  total_amount: string;
  status: string;
  budget_type: string;
  created_at: string;
  updated_at: string | null;
  items: BudgetItem[];
}

export interface CreateBudgetData {
  patientId: number;
  budgetType: string;
  items: BudgetItem[];
}

export interface UpdateBudgetStatusData {
  status: string;
}

export interface GetBudgetResponse {
  budget: Budget | null;
  canModify: boolean;
}

export interface SaveBudgetResponse {
  message: string;
  budget: Budget;
}

export interface UpdateBudgetStatusResponse {
  message: string;
}

export interface DeleteBudgetResponse {
  message: string;
}

export interface BudgetStats {
  total_budgets: number;
  drafts: number;
  active: number;
  completed: number;
  total_amount: string;
}

export interface GetBudgetStatsResponse {
  stats: BudgetStats;
}

// Constantes para estados y tipos
export const BUDGET_STATUS = {
  BORRADOR: 'borrador',
  ACTIVO: 'activo',
  COMPLETED: 'completed'
} as const;

export const BUDGET_TYPE = {
  ODONTOLOGICO: 'odontologico',
  ESTETICA: 'estetica'
} as const;

export const BUDGET_STATUS_LABELS = {
  [BUDGET_STATUS.BORRADOR]: 'En edición',
  [BUDGET_STATUS.ACTIVO]: 'Plan activo',
  [BUDGET_STATUS.COMPLETED]: 'Completado'
} as const;

export const BUDGET_TYPE_LABELS = {
  [BUDGET_TYPE.ODONTOLOGICO]: 'Odontológico',
  [BUDGET_TYPE.ESTETICA]: 'Estética'
} as const;