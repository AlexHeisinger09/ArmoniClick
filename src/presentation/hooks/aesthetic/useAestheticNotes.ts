import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetcher } from '@/config/adapters/api.adapter';
import {
  saveAestheticNoteUseCase,
  getAestheticNotesByPatientUseCase,
  getAestheticNoteByBudgetUseCase,
  SaveAestheticNoteData,
  AestheticNote
} from "@/core/use-cases/aesthetic";

// Hook para obtener todas las fichas estéticas de un paciente
export const useAestheticNotesByPatient = (patientId: string) => {
  return useQuery({
    queryKey: ['aesthetic-notes', 'patient', patientId],
    queryFn: () => getAestheticNotesByPatientUseCase(apiFetcher, patientId),
    enabled: !!patientId,
    staleTime: 30 * 1000, // 30 segundos
    gcTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para obtener la ficha estética asociada a un presupuesto
export const useAestheticNoteByBudget = (budgetId: string | undefined) => {
  return useQuery({
    queryKey: ['aesthetic-notes', 'budget', budgetId],
    queryFn: () => getAestheticNoteByBudgetUseCase(apiFetcher, budgetId!),
    enabled: !!budgetId,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

// Hook para guardar una ficha estética
export const useSaveAestheticNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SaveAestheticNoteData) => saveAestheticNoteUseCase(apiFetcher, data),
    onSuccess: (_, variables) => {
      // Invalidar las queries relacionadas
      queryClient.invalidateQueries({
        queryKey: ['aesthetic-notes', 'patient', variables.patientId]
      });

      if (variables.budgetId) {
        queryClient.invalidateQueries({
          queryKey: ['aesthetic-notes', 'budget', variables.budgetId]
        });
      }
    },
  });
};
