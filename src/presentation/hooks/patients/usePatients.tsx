import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetcher } from '@/config/adapters/api.adapter';
import {
  getPatientsUseCase,
  getPatientByIdUseCase,
  createPatientUseCase,
  updatePatientUseCase,
  deletePatientUseCase,
  type CreatePatientData,
  type UpdatePatientData,
  type GetPatientsResponse,
  type GetPatientByIdResponse,
} from '@/core/use-cases/patients';

// Hook para obtener la lista de pacientes
export const usePatients = (searchTerm?: string) => {
  const queryPatients = useQuery({
    queryKey: ['patients', searchTerm],
    queryFn: () => getPatientsUseCase(apiFetcher, searchTerm),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  return {
    queryPatients,
  };
};

// Hook para obtener un paciente específico
export const usePatient = (patientId: number, enabled = true) => {
  const queryPatient = useQuery({
    queryKey: ['patient', patientId],
    queryFn: () => getPatientByIdUseCase(apiFetcher, patientId),
    enabled: enabled && !!patientId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  return {
    queryPatient,
  };
};

// Hook para crear paciente
export const useCreatePatient = () => {
  const [isLoadingCreate, setIsLoadingCreate] = useState(false);
  const queryClient = useQueryClient();

  const createPatientMutation = useMutation({
    mutationFn: (patientData: CreatePatientData) => {
      return createPatientUseCase(apiFetcher, patientData);
    },
    onMutate: () => {
      setIsLoadingCreate(true);
    },
    onSuccess: () => {
      setIsLoadingCreate(false);
      // Invalidar las queries para refrescar la lista
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
    onError: () => {
      setIsLoadingCreate(false);
    },
  });

  return {
    createPatientMutation,
    isLoadingCreate,
  };
};

// Hook para actualizar paciente
export const useUpdatePatient = () => {
  const [isLoadingUpdate, setIsLoadingUpdate] = useState(false);
  const queryClient = useQueryClient();

  const updatePatientMutation = useMutation({
    mutationFn: ({ patientId, patientData }: { patientId: number; patientData: UpdatePatientData }) => {
      return updatePatientUseCase(apiFetcher, patientId, patientData);
    },
    onMutate: () => {
      setIsLoadingUpdate(true);
    },
    onSuccess: (data, variables) => {
      setIsLoadingUpdate(false);
      // Invalidar las queries para refrescar los datos
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['patient', variables.patientId] });
    },
    onError: () => {
      setIsLoadingUpdate(false);
    },
  });

  return {
    updatePatientMutation,
    isLoadingUpdate,
  };
};

// Hook para eliminar paciente
export const useDeletePatient = () => {
  const [isLoadingDelete, setIsLoadingDelete] = useState(false);
  const queryClient = useQueryClient();

  const deletePatientMutation = useMutation({
    mutationFn: (patientId: number) => {
      return deletePatientUseCase(apiFetcher, patientId);
    },
    onMutate: () => {
      setIsLoadingDelete(true);
    },
    onSuccess: () => {
      setIsLoadingDelete(false);
      // Invalidar las queries para refrescar la lista
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
    onError: () => {
      setIsLoadingDelete(false);
    },
  });

  return {
    deletePatientMutation,
    isLoadingDelete,
  };
};