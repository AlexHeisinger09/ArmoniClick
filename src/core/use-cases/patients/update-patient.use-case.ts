import { HttpAdapter } from "@/config/adapters/http/http.adapter";
import { Patient } from "./get-patients.use-case";
import { MsgResponse } from "@/infrastructure/interfaces/api.responses";

export interface UpdatePatientData {
  rut?: string;
  nombres?: string;
  apellidos?: string;
  fecha_nacimiento?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  ciudad?: string;
  codigo_postal?: string;
  alergias?: string;
  medicamentos_actuales?: string;
  enfermedades_cronicas?: string;
  cirugias_previas?: string;
  hospitalizaciones_previas?: string;
  notas_medicas?: string;
}

export interface UpdatePatientResponse extends MsgResponse {
  patient: Patient;
}

export const updatePatientUseCase = async (
  fetcher: HttpAdapter,
  patientId: number,
  patientData: UpdatePatientData
): Promise<UpdatePatientResponse> => {
  const response = await fetcher.put<UpdatePatientResponse>(`/patients/${patientId}`, patientData);
  return response;
};