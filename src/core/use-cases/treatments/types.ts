// src/core/use-cases/treatments/types.ts
export interface Treatment {
  id_tratamiento: number;
  id_paciente: number;
  id_doctor: number;
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
  created_at: string;
  updated_at?: string;
  is_active: boolean;
}

export interface CreateTreatmentData {
  id_paciente: number;
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
}

export interface UpdateTreatmentResponse {
  message: string;
  treatment: Treatment;
}

export interface DeleteTreatmentResponse {
  message: string;
}