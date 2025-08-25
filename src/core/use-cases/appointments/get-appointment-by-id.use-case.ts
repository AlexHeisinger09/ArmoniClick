import { HttpAdapter } from "@/config/adapters/http/http.adapter";
import { AppointmentResponse } from "@/infrastructure/interfaces/appointment.response";

export const getAppointmentByIdUseCase = async (
  fetcher: HttpAdapter,
  id: number
): Promise<AppointmentResponse> => {
  const appointment = await fetcher.get<AppointmentResponse>(`/appointments/${id}`);
  return appointment;
};