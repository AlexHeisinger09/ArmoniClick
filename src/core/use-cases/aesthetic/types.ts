import type { FacialAestheticState, DrawingState } from '@/presentation/components/facial-aesthetic';

export interface AestheticNote {
  id: number;
  patient_id: number;
  doctor_id: number;
  budget_id: number | null;
  facial_data: string; // JSON string
  drawings_data: string; // JSON string
  gender: 'female' | 'male';
  created_at: string;
  updated_at: string | null;
}

export interface SaveAestheticNoteData {
  patientId: string;
  budgetId?: string;
  facialData: FacialAestheticState;
  drawingsData: DrawingState;
  gender: 'female' | 'male';
}

export interface SaveAestheticNoteResponse {
  success: boolean;
  aestheticNoteId: number;
  message: string;
}
