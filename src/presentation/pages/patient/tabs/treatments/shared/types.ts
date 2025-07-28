// src/presentation/pages/patient/tabs/treatments/shared/types.ts
import { Treatment, CreateTreatmentData } from "@/core/use-cases/treatments";

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
  onSubmit: (treatmentData: CreateTreatmentData) => void;
  isLoading?: boolean;
}

export interface TreatmentDetailModalProps extends TreatmentModalProps {
  treatment: Treatment | null;
  onEdit: (treatment: Treatment) => void;
  onDelete: (treatmentId: number) => void;
}

export interface TreatmentCardProps {
  treatment: Treatment;
  onView: (treatment: Treatment) => void;
  onEdit: (treatment: Treatment) => void;
  onDelete: (treatmentId: number) => void;
  isLoadingDelete?: boolean;
}

export interface TreatmentsListProps {
  treatments: Treatment[];
  loading: boolean;
  onView: (treatment: Treatment) => void;
  onEdit: (treatment: Treatment) => void;
  onDelete: (treatmentId: number) => void;
  onNewTreatment: () => void;
  isLoadingDelete?: boolean;
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
  'Hidrafacial',
  'Lifting no quirúrgico',
  'Rellenos dérmicos',
  'Bioestimulación',
  'Hilos tensores',
  'Criolipólisis',
  'Carboxiterapia',
  'Otro'
];