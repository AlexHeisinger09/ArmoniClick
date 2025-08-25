import { HttpAdapter } from "@/config/adapters/http/http.adapter";
import { AppointmentResponse } from "@/infrastructure/interfaces/appointment.response";

interface UpdateStatusRequest {
  status: string;
  reason?: string;
}

interface UpdateStatusResponse {
  message: string;
  appointment: AppointmentResponse;
}

export const updateAppointmentStatusUseCase = async (
  fetcher: HttpAdapter,
  id: number,
  statusData: UpdateStatusRequest
): Promise<UpdateStatusResponse> => {
  const response = await fetcher.put<UpdateStatusResponse>(
    `/appointments/${id}/status`,
    statusData
  );
  return response;
};
