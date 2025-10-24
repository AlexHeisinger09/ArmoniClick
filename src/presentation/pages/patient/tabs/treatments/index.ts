// src/presentation/pages/patient/tabs/treatments/index.ts - ACTUALIZADO
export { PatientTreatments } from './PatientTreatments';

// Components
export { TreatmentCard } from './components/TreatmentCard';
export { TreatmentsList } from './components/TreatmentsList';
export { BudgetSelector } from './components/BudgetSelector'; // ✅ MANTENER para compatibilidad
export { BudgetSidebar } from './components/BudgetSidebar'; // ✅ NUEVO

// Modals
export { NewTreatmentModal } from './modals/NewTreatmentModal';
export { EditTreatmentModal } from './modals/EditTreatmentModal'; 
export { TreatmentDetailModal } from './modals/TreatmentDetailModal';

// Shared
export * from './shared/types';