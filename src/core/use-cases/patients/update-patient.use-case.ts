import { HttpAdapter } from "@/config/adapters/http/http.adapter";
import { Patient } from "@/core/entities/patient.entity";
import { PatientResponse } from "@/infrastructure/interfaces/patient.response";
import { PatientMapper } from "@/infrastructure/mappers/patient.mapper";

export interface UpdatePatientDto {
  rut?: string;
  nombres?: string;
  apellidos?: string;
  fechaNacimiento?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  ciudad?: string;
  codigoPostal?: string;
}

export const updatePatientUseCase = async (
  fetcher: HttpAdapter,
  patientId: number,
  patientData: UpdatePatientDto
): Promise<Patient> => {
  const response = await fetcher.put<{ patient: PatientResponse; message: string }>(
    `/patients/${patientId}`, 
    patientData
  );
  return PatientMapper.fromResponseToEntity(response.patient);
};