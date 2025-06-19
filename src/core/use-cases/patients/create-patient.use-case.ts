import { HttpAdapter } from "@/config/adapters/http/http.adapter";
import { Patient } from "@/core/entities/patient.entity";
import { PatientResponse } from "@/infrastructure/interfaces/patient.response";
import { PatientMapper } from "@/infrastructure/mappers/patient.mapper";

export interface CreatePatientDto {
  rut: string;
  nombres: string;
  apellidos: string;
  fechaNacimiento: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  ciudad?: string;
  codigoPostal?: string;
}

export const createPatientUseCase = async (
  fetcher: HttpAdapter,
  patientData: CreatePatientDto
): Promise<Patient> => {
  const response = await fetcher.post<{ patient: PatientResponse; message: string }>(
    "/patients", 
    patientData
  );
  return PatientMapper.fromResponseToEntity(response.patient);
};