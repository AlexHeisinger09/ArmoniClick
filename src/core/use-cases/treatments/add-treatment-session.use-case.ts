// src/core/use-cases/treatments/add-treatment-session.use-case.ts
import { HttpAdapter } from '@/config/adapters/http/http.adapter';

export interface AddSessionData {
  budget_item_id: number;
  fecha_control: string;
  hora_control: string;
  nombre_servicio?: string; // Nombre del servicio/tratamiento
  descripcion?: string;
  producto?: string;
  lote_producto?: string;
  fecha_venc_producto?: string;
  dilucion?: string;
  foto1?: string;
  foto2?: string;
  fecha_proximo_control?: string;
  hora_proximo_control?: string;
}

export interface AddSessionResponse {
  message: string;
  session: {
    id_tratamiento: number;
    id_paciente: number;
    id_doctor: number;
    budget_item_id: number;
    nombre_servicio: string;
    fecha_control: string;
    hora_control: string;
    status: string;
    created_at: string;
  };
}

/**
 * Use case para agregar una nueva sesión/evolución a un tratamiento existente
 * @param fetcher - Adaptador HTTP
 * @param patientId - ID del paciente
 * @param sessionData - Datos de la nueva sesión
 */
export const addTreatmentSessionUseCase = async (
  fetcher: HttpAdapter,
  patientId: number,
  sessionData: AddSessionData
): Promise<AddSessionResponse> => {
  const response = await fetcher.post<AddSessionResponse>(
    `/treatments/patient/${patientId}/session`,
    sessionData
  );

  return response;
};
