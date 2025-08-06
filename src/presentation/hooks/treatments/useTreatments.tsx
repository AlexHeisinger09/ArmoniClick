// src/presentation/hooks/treatments/useTreatments.tsx - ACTUALIZADO PARA PRESUPUESTOS
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetcher } from '@/config/adapters/api.adapter';
import {
  getTreatmentsUseCase,
  getTreatmentByIdUseCase,
  createTreatmentUseCase,
  updateTreatmentUseCase,
  deleteTreatmentUseCase,
  getBudgetsByPatientUseCase, // ✅ NUEVO
  getTreatmentsByBudgetUseCase, // ✅ NUEVO
  completeTreatmentUseCase, // ✅ NUEVO
  type CreateTreatmentData,
  type UpdateTreatmentData,
  type GetTreatmentsResponse,
  type GetTreatmentByIdResponse,
  type GetBudgetSummariesResponse, // ✅ NUEVO
  type GetTreatmentsByBudgetResponse, // ✅ NUEVO
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

// ✅ NUEVO: Hook para obtener presupuestos de un paciente
export const useBudgetsByPatient = (patientId: number, enabled = true) => {
  const queryBudgets = useQuery({
    queryKey: ['treatments', 'budgets', patientId],
    queryFn: () => getBudgetsByPatientUseCase(apiFetcher, patientId),
    enabled: enabled && !!patientId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  return {
    queryBudgets,
    budgets: queryBudgets.data?.budgets || [],
    activeBudget: queryBudgets.data?.budgets.find(b => b.status === 'activo') || null,
    isLoadingBudgets: queryBudgets.isLoading,
    errorBudgets: queryBudgets.error,
  };
};

// ✅ NUEVO: Hook para obtener tratamientos de un presupuesto específico
export const useTreatmentsByBudget = (budgetId: number, enabled = true) => {
  const queryTreatmentsByBudget = useQuery({
    queryKey: ['treatments', 'budget', budgetId],
    queryFn: () => getTreatmentsByBudgetUseCase(apiFetcher, budgetId),
    enabled: enabled && !!budgetId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  return {
    queryTreatmentsByBudget,
    treatments: queryTreatmentsByBudget.data?.treatments || [],
    budget: queryTreatmentsByBudget.data?.budget || null,
    isLoadingTreatmentsByBudget: queryTreatmentsByBudget.isLoading,
    errorTreatmentsByBudget: queryTreatmentsByBudget.error,
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

      // ✅ INVALIDAR TAMBIÉN QUERIES DE PRESUPUESTOS SI EL TRATAMIENTO ESTÁ VINCULADO
      if (variables.treatmentData.budget_item_id) {
        queryClient.invalidateQueries({ queryKey: ['treatments', 'budget'] });
      }
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

// Hook para actualizar tratamiento - ACTUALIZADO
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

      // ✅ INVALIDAR MÚLTIPLES QUERIES
      queryClient.invalidateQueries({ queryKey: ['treatments'] });
      queryClient.invalidateQueries({ queryKey: ['treatment', variables.treatmentId] });

      // ✅ TAMBIÉN INVALIDAR PRESUPUESTOS por si se cambió algo relacionado
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
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

// Hook para completar tratamiento - ACTUALIZADO
export const useCompleteTreatment = () => {
  const [isLoadingComplete, setIsLoadingComplete] = useState(false);
  const queryClient = useQueryClient();

  const completeTreatmentMutation = useMutation({
    mutationFn: (treatmentId: number) => {
      return completeTreatmentUseCase(apiFetcher, treatmentId);
    },
    onMutate: () => {
      setIsLoadingComplete(true);
    },
    onSuccess: () => {
      setIsLoadingComplete(false);

      // ✅ INVALIDAR TODAS LAS QUERIES RELACIONADAS
      queryClient.invalidateQueries({ queryKey: ['treatments'] });

      // ✅ COMPLETAR UN TRATAMIENTO AFECTA EL PROGRESO DEL PRESUPUESTO
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
    onError: () => {
      setIsLoadingComplete(false);
    },
  });

  return {
    completeTreatmentMutation,
    isLoadingComplete,
  };
};
// Hook para eliminar tratamiento - ACTUALIZADO  
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
      
      // ✅ INVALIDAR TODAS LAS QUERIES RELACIONADAS
      queryClient.invalidateQueries({ queryKey: ['treatments'] });
      
      // ✅ ELIMINAR UN TRATAMIENTO PUEDE AFECTAR EL PROGRESO DEL PRESUPUESTO
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
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

// ✅ NUEVO: Hook combinado mejorado con mejor invalidación
export const useTreatmentsWithBudgets = (patientId: number) => {
  const treatments = useTreatments(patientId);
  const budgets = useBudgetsByPatient(patientId);
  const createTreatment = useCreateTreatment();
  const updateTreatment = useUpdateTreatment();
  const completeTreatment = useCompleteTreatment();
  const deleteTreatment = useDeleteTreatment();

  return {
    // Datos
    ...treatments,
    ...budgets,
    
    // Operaciones con invalidación mejorada
    createTreatment: createTreatment.createTreatmentMutation.mutateAsync,
    updateTreatment: updateTreatment.updateTreatmentMutation.mutateAsync,
    completeTreatment: completeTreatment.completeTreatmentMutation.mutateAsync,
    deleteTreatment: deleteTreatment.deleteTreatmentMutation.mutateAsync,
    
    // Estados de carga
    isLoadingCreate: createTreatment.isLoadingCreate,
    isLoadingUpdate: updateTreatment.isLoadingUpdate,
    isLoadingComplete: completeTreatment.isLoadingComplete,
    isLoadingDelete: deleteTreatment.isLoadingDelete,
    
    // Mutaciones para manejo de errores
    createTreatmentMutation: createTreatment.createTreatmentMutation,
    updateTreatmentMutation: updateTreatment.updateTreatmentMutation,
    completeTreatmentMutation: completeTreatment.completeTreatmentMutation,
    deleteTreatmentMutation: deleteTreatment.deleteTreatmentMutation,
  };
};