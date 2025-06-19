import * as UseCase from "@/core/use-cases/patients/get-patients.use-case";
import { apiFetcher } from "@/config/adapters/api.adapter";
import { useQuery } from "@tanstack/react-query";

export const usePatients = (token?: string) => {
  const queryPatients = useQuery({
    queryKey: ["patients", token],
    queryFn: () => UseCase.getPatientsUseCase(apiFetcher),
    enabled: !!token,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  return {
    queryPatients,
    patients: queryPatients.data || [],
    isLoading: queryPatients.isLoading,
    error: queryPatients.error,
    refetch: queryPatients.refetch,
  };
};