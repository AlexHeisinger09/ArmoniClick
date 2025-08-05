// src/presentation/pages/patient/tabs/treatments/shared/types.ts - ACTUALIZADO
import { Treatment, CreateTreatmentData, UpdateTreatmentData, BudgetSummary } from "@/core/use-cases/treatments";

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

export interface NewTreatmentModalProps extends TreatmentModalProps {
  patientId: number;
  selectedBudgetId?: number | null; // ✅ NUEVO
  budgets?: BudgetSummary[]; // ✅ NUEVO
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
  onComplete: (treatmentId: number) => void; // ✅ NUEVO
  onDelete: (treatmentId: number) => void;
  canComplete?: boolean; // ✅ NUEVO
}

export interface TreatmentCardProps {
  treatment: Treatment;
  onView: (treatment: Treatment) => void;
  onEdit: (treatment: Treatment) => void;
  onComplete: (treatmentId: number) => void; // ✅ NUEVO
  onDelete: (treatmentId: number) => void;
  isLoadingDelete?: boolean;
  isLoadingComplete?: boolean; // ✅ NUEVO
  canComplete?: boolean; // ✅ NUEVO
  showBudgetInfo?: boolean; // ✅ NUEVO
}

export interface TreatmentsListProps {
  treatments: Treatment[];
  loading: boolean;
  selectedBudget?: BudgetSummary | null; // ✅ NUEVO
  onView: (treatment: Treatment) => void;
  onEdit: (treatment: Treatment) => void;
  onComplete: (treatmentId: number) => void; // ✅ NUEVO
  onDelete: (treatmentId: number) => void;
  onNewTreatment: () => void;
  isLoadingDelete?: boolean;
  isLoadingComplete?: boolean; // ✅ NUEVO
  showEmptyState?: boolean; // ✅ NUEVO
}

// ✅ NUEVA INTERFACE para BudgetSelector
export interface BudgetSelectorProps {
  budgets: BudgetSummary[];
  selectedBudgetId: number | null;
  activeBudgetId: number | null;
  onBudgetChange: (budgetId: number | null) => void;
  loading: boolean;
}

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