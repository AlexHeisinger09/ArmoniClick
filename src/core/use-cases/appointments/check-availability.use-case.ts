import { HttpAdapter } from "@/config/adapters/http/http.adapter";
import { AppointmentAvailabilityResponse } from "@/infrastructure/interfaces/appointment.response";

export const checkAvailabilityUseCase = async (
  fetcher: HttpAdapter,
  params: {
    date: string;
    duration?: number;
    excludeId?: number;
  }
): Promise<AppointmentAvailabilityResponse> => {
  const searchParams = new URLSearchParams();
  searchParams.append('date', params.date);
  if (params.duration) searchParams.append('duration', params.duration.toString());
  if (params.excludeId) searchParams.append('excludeId', params.excludeId.toString());
  
  const availability = await fetcher.get<AppointmentAvailabilityResponse>(
    `/appointments/availability?${searchParams.toString()}`
  );
  return availability;
};