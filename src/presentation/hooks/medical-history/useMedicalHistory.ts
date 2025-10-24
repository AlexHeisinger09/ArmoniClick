import { useQuery } from '@tanstack/react-query';
import { apiFetcher } from '@/config/adapters/api.adapter';
import { getMedicalHistoryUseCase, MedicalHistoryResponse } from '@/core/use-cases/medical-history';

interface UseMedicalHistoryParams {
  patientId: number;
  enabled?: boolean;
}

/**
 * Hook to fetch patient's complete medical history
 * Combines patient base info, treatments, appointments, and budgets
 */
export const useMedicalHistory = ({ patientId, enabled = true }: UseMedicalHistoryParams) => {
  return useQuery({
    queryKey: ['medical-history', patientId],
    queryFn: () => getMedicalHistoryUseCase(apiFetcher, patientId),
    enabled: enabled && !!patientId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
