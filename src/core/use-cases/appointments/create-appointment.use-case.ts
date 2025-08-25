import { HttpAdapter } from "@/config/adapters/http/http.adapter";
import { AppointmentResponse } from "@/infrastructure/interfaces/appointment.response";
import { CreateAppointmentRequest } from "@/infrastructure/interfaces/appointment.response";

interface CreateAppointmentResponse {
  message: string;
  appointment: AppointmentResponse;
}

export const createAppointmentUseCase = async (
  fetcher: HttpAdapter,
  appointmentData: CreateAppointmentRequest
): Promise<CreateAppointmentResponse> => {
  const response = await fetcher.post<CreateAppointmentResponse>(
    '/appointments',
    appointmentData
  );
  return response;
};