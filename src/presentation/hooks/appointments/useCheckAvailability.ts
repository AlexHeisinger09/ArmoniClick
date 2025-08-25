import { useQuery } from '@tanstack/react-query';
import { apiFetcher } from '@/config/adapters/api.adapter';
import { checkAvailabilityUseCase } from '@/core/use-cases/appointments/check-availability.use-case';

interface UseCheckAvailabilityParams {
  date: string;
  duration?: number;
  excludeId?: number;
  enabled?: boolean;
}

export const useCheckAvailability = (params: UseCheckAvailabilityParams) => {
  return useQuery({
    queryKey: ['availability', params.date, params.duration, params.excludeId],
    queryFn: () => checkAvailabilityUseCase(apiFetcher, params),
    enabled: params.enabled !== false && !!params.date,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
  });
};