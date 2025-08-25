import { HttpAdapter } from "@/config/adapters/http/http.adapter";
import { AppointmentResponse } from "@/infrastructure/interfaces/appointment.response";
import { UpdateAppointmentRequest } from "@/infrastructure/interfaces/appointment.response";

interface UpdateAppointmentResponse {
  message: string;
  appointment: AppointmentResponse;
}

export const updateAppointmentUseCase = async (
  fetcher: HttpAdapter,
  id: number,
  appointmentData: UpdateAppointmentRequest
): Promise<UpdateAppointmentResponse> => {
  const response = await fetcher.put<UpdateAppointmentResponse>(
    `/appointments/${id}`,
    appointmentData
  );
  return response;
};