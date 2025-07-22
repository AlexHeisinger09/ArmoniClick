import { MsgResponse } from "@/infrastructure/interfaces/api.responses";
import { HttpAdapter } from "@/config/adapters/http/http.adapter";
import { Patient } from "./get-patients.use-case";

export interface CreatePatientData {
  rut: string;
  nombres: string;
  apellidos: string;
  fecha_nacimiento: string;
  telefono: string;
  email: string;
  direccion: string;
  ciudad: string;
  codigo_postal?: string;
  alergias?: string;
  medicamentos_actuales?: string;
  enfermedades_cronicas?: string;
  cirugias_previas?: string;
  hospitalizaciones_previas?: string;
  notas_medicas?: string;
}

export interface CreatePatientResponse extends MsgResponse {
  patient: Patient;
}

export const createPatientUseCase = async (
  fetcher: HttpAdapter,
  patientData: CreatePatientData
): Promise<CreatePatientResponse> => {
  const response = await fetcher.post<CreatePatientResponse>("/patients", patientData);
  return response;
};