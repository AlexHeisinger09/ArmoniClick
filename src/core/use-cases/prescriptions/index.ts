// src/core/use-cases/prescriptions/index.ts

// Entity types
export interface Prescription {
  id: number;
  patient_id: number;
  user_id: number;
  medications: string;
  created_at: string;
  updated_at: string | null;
}

// Use cases
export { getPrescriptionsByPatientUseCase } from './get-prescriptions-by-patient.use-case';
export { savePrescriptionUseCase } from './save-prescription.use-case';
export { deletePrescriptionUseCase } from './delete-prescription.use-case';
export { generatePrescriptionPDFUseCase } from './generate-prescription-pdf.use-case';
export type { GeneratePrescriptionPDFResponse } from './generate-prescription-pdf.use-case';
