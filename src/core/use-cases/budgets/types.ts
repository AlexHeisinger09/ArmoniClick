// src/core/use-cases/budgets/types.ts - ACTUALIZADO CON ESTADO PENDIENTE
export interface BudgetItem {
  id?: number;
  budget_id?: number;
  pieza?: string;
  accion: string;
  valor: number;
  orden?: number;
  status?: string; // planificado, en_proceso, completado
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

// ✅ INTERFACES ACTUALIZADAS PARA MÚLTIPLES PRESUPUESTOS

export interface GetAllBudgetsResponse {
  budgets: Budget[];
  total: number;
}

export interface GetActiveBudgetResponse {
  budget: Budget | null;
  canModify: boolean;
}

export interface GetBudgetResponse {
  budget: Budget | null;
  canModify: boolean;
}

export interface SaveBudgetResponse {
  message: string;
  budget: Budget;
}

export interface ActivateBudgetResponse {
  message: string;
}

export interface CompleteBudgetResponse {
  message: string;
}

export interface RevertBudgetResponse {
  message: string;
}

export interface UpdateBudgetStatusResponse {
  message: string;
}

export interface DeleteBudgetResponse {
  message: string;
}

export interface BudgetStats {
  total_budgets: number;
  pendientes: number; // ✅ NUEVO ESTADO
  drafts: number;
  active: number;
  completed: number;
  total_amount: string;
}

export interface GetBudgetStatsResponse {
  stats: BudgetStats;
}

export interface BudgetListItem extends Budget {
  isActive: boolean;
  canModify: boolean;
  canActivate: boolean;
  canComplete: boolean;
  canDelete: boolean;
}

export interface BudgetOperationResult {
  success: boolean;
  message: string;
  budget?: Budget;
}

// ✅ CONSTANTES ACTUALIZADAS - NUEVO ESTADO PENDIENTE
export const BUDGET_STATUS = {
  PENDIENTE: 'pendiente', // ✅ NUEVO ESTADO INICIAL
  BORRADOR: 'borrador',
  ACTIVO: 'activo',
  COMPLETED: 'completed'
} as const;

export const BUDGET_TYPE = {
  ODONTOLOGICO: 'odontologico',
  ESTETICA: 'estetica'
} as const;

export const BUDGET_STATUS_LABELS = {
  [BUDGET_STATUS.PENDIENTE]: 'Borrador', // ✅ NUEVO LABEL
  [BUDGET_STATUS.BORRADOR]: 'En edición',
  [BUDGET_STATUS.ACTIVO]: 'Plan activo',
  [BUDGET_STATUS.COMPLETED]: 'Completado'
} as const;

export const BUDGET_TYPE_LABELS = {
  [BUDGET_TYPE.ODONTOLOGICO]: 'Odontológico',
  [BUDGET_TYPE.ESTETICA]: 'Estética'
} as const;

export const BUDGET_STATUS_COLORS = {
  [BUDGET_STATUS.PENDIENTE]: { // ✅ NUEVOS COLORES PARA PENDIENTE
    bg: 'bg-orange-50',
    text: 'text-orange-800',
    border: 'border-orange-200',
    badge: 'bg-orange-100 text-orange-800'
  },
  [BUDGET_STATUS.BORRADOR]: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-800',
    border: 'border-yellow-200',
    badge: 'bg-yellow-100 text-yellow-800'
  },
  [BUDGET_STATUS.ACTIVO]: {
    bg: 'bg-green-50',
    text: 'text-green-800',
    border: 'border-green-200',
    badge: 'bg-green-100 text-green-800'
  },
  [BUDGET_STATUS.COMPLETED]: {
    bg: 'bg-blue-50',
    text: 'text-blue-800',  
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-800'
  }
} as const;

// ✅ UTILIDADES ACTUALIZADAS PARA MANEJO DE PRESUPUESTOS

export const BudgetUtils = {
  canModify: (budget: Budget): boolean => {
    return [BUDGET_STATUS.PENDIENTE, BUDGET_STATUS.BORRADOR].includes(budget.status as any);
  },

  canActivate: (budget: Budget): boolean => {
    return [BUDGET_STATUS.PENDIENTE, BUDGET_STATUS.BORRADOR].includes(budget.status as any) && budget.items.length > 0;
  },

  canComplete: (budget: Budget): boolean => {
    return budget.status === BUDGET_STATUS.ACTIVO;
  },

  canRevert: (budget: Budget): boolean => {
    // Solo se puede revertir si está activo Y no tiene budget_items completados
    if (budget.status !== BUDGET_STATUS.ACTIVO) return false;

    // Verificar si hay algún budget_item completado
    const hasCompletedItems = budget.items.some(item => item.status === 'completado');
    return !hasCompletedItems;
  },

  canDelete: (budget: Budget): boolean => {
    return [BUDGET_STATUS.PENDIENTE, BUDGET_STATUS.BORRADOR].includes(budget.status as any);
  },

  getStatusColor: (status: string) => {
    return BUDGET_STATUS_COLORS[status as keyof typeof BUDGET_STATUS_COLORS] || {
      bg: 'bg-gray-50',
      text: 'text-gray-800',
      border: 'border-gray-200',
      badge: 'bg-gray-100 text-gray-800'
    };
  },

  formatCurrency: (amount: number | string): string => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return num.toLocaleString('es-CL');
  },

  calculateTotal: (items: BudgetItem[]): number => {
    return items.reduce((total, item) => total + (item.valor || 0), 0);
  },

  sortBudgetsByPriority: (budgets: Budget[]): Budget[] => {
    // ✅ NUEVO ORDEN: Borradores/Pendientes primero (más frecuentes), luego activos, luego completados
    return budgets.sort((a, b) => {
      // Prioridad 1: Borradores o Pendientes primero (están siendo editados)
      const aIsDraft = [BUDGET_STATUS.BORRADOR, BUDGET_STATUS.PENDIENTE].includes(a.status as any);
      const bIsDraft = [BUDGET_STATUS.BORRADOR, BUDGET_STATUS.PENDIENTE].includes(b.status as any);

      if (aIsDraft && !bIsDraft) return -1;
      if (bIsDraft && !aIsDraft) return 1;

      // Prioridad 2: Activos segundo
      if (a.status === BUDGET_STATUS.ACTIVO && b.status !== BUDGET_STATUS.ACTIVO) return -1;
      if (b.status === BUDGET_STATUS.ACTIVO && a.status !== BUDGET_STATUS.ACTIVO) return 1;

      // Prioridad 3: Completados al final
      // Si ambos tienen el mismo estado, ordenar por fecha (más reciente primero)
      const dateA = new Date(a.updated_at || a.created_at);
      const dateB = new Date(b.updated_at || b.created_at);
      return dateB.getTime() - dateA.getTime();
    });
  }
};