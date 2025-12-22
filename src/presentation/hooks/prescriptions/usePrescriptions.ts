// src/presentation/hooks/prescriptions/usePrescriptions.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetcher } from '@/config/adapters/api.adapter';
import {
  getPrescriptionsByPatientUseCase,
  savePrescriptionUseCase,
  deletePrescriptionUseCase,
  Prescription,
} from '@/core/use-cases/prescriptions';
import { useNotification } from '../notifications/useNotification';

export const usePrescriptions = (patientId: number) => {
  const queryClient = useQueryClient();
  const notification = useNotification();

  // Query para obtener recetas
  const queryPrescriptions = useQuery({
    queryKey: ['prescriptions', patientId],
    queryFn: () => getPrescriptionsByPatientUseCase(apiFetcher, patientId),
    enabled: !!patientId && patientId > 0,
  });

  // Mutation para crear receta
  const saveMutation = useMutation({
    mutationFn: (data: { patientId: number; medications: string }) =>
      savePrescriptionUseCase(apiFetcher, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions', patientId] });
      notification.success('Receta guardada exitosamente');
    },
    onError: (error: any) => {
      notification.error(error.message || 'Error al guardar la receta');
    },
  });

  // Mutation para eliminar receta
  const deleteMutation = useMutation({
    mutationFn: (prescriptionId: number) =>
      deletePrescriptionUseCase(apiFetcher, prescriptionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions', patientId] });
      notification.success('Receta eliminada exitosamente');
    },
    onError: (error: any) => {
      notification.error(error.message || 'Error al eliminar la receta');
    },
  });

  return {
    // Query
    prescriptions: queryPrescriptions.data?.prescriptions || [],
    isLoading: queryPrescriptions.isLoading,
    isError: queryPrescriptions.isError,
    error: queryPrescriptions.error,

    // Mutations
    savePrescription: saveMutation.mutateAsync,
    deletePrescription: deleteMutation.mutateAsync,
    isSaving: saveMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
