import { HttpAdapter } from "@/config/adapters/http/http.adapter";
import { Patient } from "./get-patients.use-case";

export interface GetPatientByIdResponse {
  patient: Patient;
}

export const getPatientByIdUseCase = async (
  fetcher: HttpAdapter,
  patientId: number
): Promise<GetPatientByIdResponse> => {
  const response = await fetcher.get<GetPatientByIdResponse>(`/patients/${patientId}`);
  return response;
};