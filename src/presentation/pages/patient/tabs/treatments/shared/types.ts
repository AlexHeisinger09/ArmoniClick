// src/presentation/pages/patient/tabs/treatments/shared/types.ts - ACTUALIZADO CON BUDGET ITEMS
import { Treatment, CreateTreatmentData, UpdateTreatmentData, BudgetSummary } from "@/core/use-cases/treatments";
import { BudgetItem } from "@/core/use-cases/budgets";

export interface NotificationProps {
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
  onClose: () => void;
}

export interface TreatmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// ✅ SIMPLIFICADO: Solo necesitamos budgets, no budgetItems
export interface NewTreatmentModalProps extends TreatmentModalProps {
  patientId: number;
  selectedBudgetId?: number | null;
  budgets?: BudgetSummary[];
  onSubmit: (treatmentData: CreateTreatmentData) => void;
  isLoading?: boolean;
}

export interface EditTreatmentModalProps extends TreatmentModalProps {
  treatment: Treatment | null;
  onSubmit: (treatmentId: number, treatmentData: UpdateTreatmentData) => void;
  isLoading?: boolean;
}

export interface TreatmentDetailModalProps extends TreatmentModalProps {
  treatment: Treatment | null;
  onEdit: (treatment: Treatment) => void;
  onComplete: (treatmentId: number) => void;
  onDelete: (treatmentId: number) => void;
  canComplete?: boolean;
}

export interface TreatmentCardProps {
  treatment: Treatment;
  onView: (treatment: Treatment) => void;
  onEdit: (treatment: Treatment) => void;
  onComplete: (treatmentId: number) => void;
  onDelete: (treatmentId: number) => void;
  isLoadingDelete?: boolean;
  isLoadingComplete?: boolean;
  canComplete?: boolean;
  showBudgetInfo?: boolean;
}

export interface TreatmentsListProps {
  treatments: Treatment[];
  loading: boolean;
  selectedBudget?: BudgetSummary | null;
  onView: (treatment: Treatment) => void;
  onEdit: (treatment: Treatment) => void;
  onComplete: (treatmentId: number) => void;
  onDelete: (treatmentId: number) => void;
  onNewTreatment: () => void;
  isLoadingDelete?: boolean;
  isLoadingComplete?: boolean;
  showEmptyState?: boolean;
}

export interface BudgetSelectorProps {
  budgets: BudgetSummary[];
  selectedBudgetId: number | null;
  activeBudgetId: number | null;
  onBudgetChange: (budgetId: number | null) => void;
  loading: boolean;
}

// ✅ ELIMINAR interfaces que ya no necesitamos
// export interface BudgetItemSelectorProps - YA NO SE NECESITA

export const SERVICIOS_COMUNES = [
  'Botox',
  'Ácido Hialurónico',
  'Peeling Químico',
  'Plasma Rico en Plaquetas (PRP)',
  'Mesoterapia',
  'Radiofrecuencia',
  'Láser CO2',
  'Microdermoabrasión',
  'Hydrafacial',
  'Lifting no quirúrgico',
  'Rellenos dérmicos',
  'Bioestimulación',
  'Hilos tensores',
  'Criolipólisis',
  'Carboxiterapia',
  'Lipólisis con enzimas',
  'Tratamiento con ultrasonido',
  'Terapia con LED',
  'Exfoliación química',
  'Rejuvenecimiento facial',
  'Otro'
];