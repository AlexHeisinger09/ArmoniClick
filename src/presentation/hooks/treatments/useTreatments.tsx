// src/presentation/hooks/treatments/useTreatments.tsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetcher } from '@/config/adapters/api.adapter';
import {
  getTreatmentsUseCase,
  getTreatmentByIdUseCase,
  createTreatmentUseCase,
  updateTreatmentUseCase,
  deleteTreatmentUseCase,
  type CreateTreatmentData,
  type UpdateTreatmentData,
  type GetTreatmentsResponse,
  type GetTreatmentByIdResponse,
} from '@/core/use-cases/treatments';

// Hook para obtener la lista de tratamientos de un paciente
export const useTreatments = (patientId: number, enabled = true) => {
  const queryTreatments = useQuery({
    queryKey: ['treatments', patientId],
    queryFn: () => getTreatmentsUseCase(apiFetcher, patientId),
    enabled: enabled && !!patientId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  return {
    queryTreatments,
  };
};

// Hook para obtener un tratamiento específico
export const useTreatment = (treatmentId: number, enabled = true) => {
  const queryTreatment = useQuery({
    queryKey: ['treatment', treatmentId],
    queryFn: () => getTreatmentByIdUseCase(apiFetcher, treatmentId),
    enabled: enabled && !!treatmentId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  return {
    queryTreatment,
  };
};

// Hook para crear tratamiento
export const useCreateTreatment = () => {
  const [isLoadingCreate, setIsLoadingCreate] = useState(false);
  const queryClient = useQueryClient();

  const createTreatmentMutation = useMutation({
    mutationFn: ({ patientId, treatmentData }: { patientId: number; treatmentData: CreateTreatmentData }) => {
      return createTreatmentUseCase(apiFetcher, patientId, treatmentData);
    },
    onMutate: () => {
      setIsLoadingCreate(true);
    },
    onSuccess: (data, variables) => {
      setIsLoadingCreate(false);
      // Invalidar las queries para refrescar la lista
      queryClient.invalidateQueries({ queryKey: ['treatments', variables.patientId] });
    },
    onError: () => {
      setIsLoadingCreate(false);
    },
  });

  return {
    createTreatmentMutation,
    isLoadingCreate,
  };
};

// Hook para actualizar tratamiento
export const useUpdateTreatment = () => {
  const [isLoadingUpdate, setIsLoadingUpdate] = useState(false);
  const queryClient = useQueryClient();

  const updateTreatmentMutation = useMutation({
    mutationFn: ({ treatmentId, treatmentData }: { treatmentId: number; treatmentData: UpdateTreatmentData }) => {
      return updateTreatmentUseCase(apiFetcher, treatmentId, treatmentData);
    },
    onMutate: () => {
      setIsLoadingUpdate(true);
    },
    onSuccess: (data, variables) => {
      setIsLoadingUpdate(false);
      // Invalidar las queries para refrescar los datos
      queryClient.invalidateQueries({ queryKey: ['treatments'] });
      queryClient.invalidateQueries({ queryKey: ['treatment', variables.treatmentId] });
    },
    onError: () => {
      setIsLoadingUpdate(false);
    },
  });

  return {
    updateTreatmentMutation,
    isLoadingUpdate,
  };
};

// Hook para eliminar tratamiento
export const useDeleteTreatment = () => {
  const [isLoadingDelete, setIsLoadingDelete] = useState(false);
  const queryClient = useQueryClient();

  const deleteTreatmentMutation = useMutation({
    mutationFn: (treatmentId: number) => {
      return deleteTreatmentUseCase(apiFetcher, treatmentId);
    },
    onMutate: () => {
      setIsLoadingDelete(true);
    },
    onSuccess: () => {
      setIsLoadingDelete(false);
      // Invalidar las queries para refrescar la lista
      queryClient.invalidateQueries({ queryKey: ['treatments'] });
    },
    onError: () => {
      setIsLoadingDelete(false);
    },
  });

  return {
    deleteTreatmentMutation,
    isLoadingDelete,
  };
};