import { HttpAdapter } from "@/config/adapters/http/http.adapter";

export const deletePatientUseCase = async (
  fetcher: HttpAdapter,
  patientId: number
): Promise<{ message: string }> => {
  const response = await fetcher.delete<{ message: string }>(`/patients/${patientId}`);
  return response;
};