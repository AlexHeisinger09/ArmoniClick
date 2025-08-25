import { useQuery } from '@tanstack/react-query';
import { apiFetcher } from '@/config/adapters/api.adapter';
import { getAppointmentsUseCase } from '@/core/use-cases/appointments/get-appointments.use-case';

interface UseAppointmentsParams {
  startDate?: string;
  endDate?: string;
  upcoming?: boolean;
  enabled?: boolean;
}

export const useAppointments = (params?: UseAppointmentsParams) => {
  return useQuery({
    queryKey: ['appointments', params],
    queryFn: () => getAppointmentsUseCase(apiFetcher, params),
    enabled: params?.enabled !== false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};