import { HttpAdapter } from "@/config/adapters/http/http.adapter";
import { Patient } from "@/core/entities/patient.entity";
import { PatientsListResponse } from "@/infrastructure/interfaces/patient.response";
import { PatientMapper } from "@/infrastructure/mappers/patient.mapper";

export const getPatientsUseCase = async (
  fetcher: HttpAdapter
): Promise<Patient[]> => {
  const response = await fetcher.get<PatientsListResponse>("/patients");
  return PatientMapper.fromResponseListToEntityList(response);
};
