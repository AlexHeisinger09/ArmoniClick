import { HttpAdapter } from "@/config/adapters/http/http.adapter";

interface DeleteAppointmentResponse {
  message: string;
}

export const deleteAppointmentUseCase = async (
  fetcher: HttpAdapter,
  id: number
): Promise<DeleteAppointmentResponse> => {
  const response = await fetcher.delete<DeleteAppointmentResponse>(`/appointments/${id}`);
  return response;
};