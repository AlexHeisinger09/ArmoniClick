import { HttpAdapter } from "@/config/adapters/http/http.adapter";
import { MsgResponse } from "@/infrastructure/interfaces/api.responses";

export const deletePatientUseCase = async (
  fetcher: HttpAdapter,
  patientId: number
): Promise<MsgResponse> => {
  const response = await fetcher.delete<MsgResponse>(`/patients/${patientId}`);
  return response;
};