// src/core/use-cases/treatments/index.ts - ACTUALIZADO
export * from './types';
export * from './get-treatments.use-case';
export * from './get-treatment-by-id.use-case';
export * from './create-treatment.use-case';
export * from './update-treatment.use-case';
export * from './delete-treatment.use-case';

// ✅ NUEVAS EXPORTACIONES
export * from './get-budgets-by-patient.use-case';
export * from './get-treatments-by-budget.use-case';
export * from './complete-treatment.use-case';