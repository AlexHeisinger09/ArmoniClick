import { useQuery } from '@tanstack/react-query';
import { apiFetcher } from '@/config/adapters/api.adapter';
import { getAppointmentByIdUseCase } from '@/core/use-cases/appointments/get-appointment-by-id.use-case';

export const useAppointment = (id: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['appointment', id],
    queryFn: () => getAppointmentByIdUseCase(apiFetcher, id),
    enabled: enabled && !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};