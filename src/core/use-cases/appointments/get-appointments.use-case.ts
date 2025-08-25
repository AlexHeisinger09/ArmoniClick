import { HttpAdapter } from "@/config/adapters/http/http.adapter";
import { AppointmentResponse } from "@/infrastructure/interfaces/appointment.response";

export const getAppointmentsUseCase = async (
  fetcher: HttpAdapter,
  params?: {
    startDate?: string;
    endDate?: string;
    upcoming?: boolean;
  }
): Promise<AppointmentResponse[]> => {
  let url = '/appointments';
  
  if (params) {
    const searchParams = new URLSearchParams();
    if (params.startDate) searchParams.append('startDate', params.startDate);
    if (params.endDate) searchParams.append('endDate', params.endDate);
    if (params.upcoming) searchParams.append('upcoming', 'true');
    
    if (searchParams.toString()) {
      url += `?${searchParams.toString()}`;
    }
  }
  
  const appointments = await fetcher.get<AppointmentResponse[]>(url);
  return appointments;
};