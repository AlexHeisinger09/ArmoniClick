// src/presentation/hooks/treatments/useTreatments.tsx - ACTUALIZADO CON INVALIDACIÓN COMPLETA
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetcher } from '@/config/adapters/api.adapter';
import {
  getTreatmentsUseCase,
  getTreatmentByIdUseCase,
  createTreatmentUseCase,
  updateTreatmentUseCase,
  deleteTreatmentUseCase,
  getBudgetsByPatientUseCase,
  getTreatmentsByBudgetUseCase,
  completeTreatmentUseCase,
  type CreateTreatmentData,
  type UpdateTreatmentData,
  type GetTreatmentsResponse,
  type GetTreatmentByIdResponse,
  type GetBudgetSummariesResponse,
  type GetTreatmentsByBudgetResponse,
} from '@/core/use-cases/treatments';

// Hook para obtener la lista de tratamientos de un paciente
export const useTreatments = (patientId: number, enabled = true) => {
  const queryTreatments = useQuery({
    queryKey: ['treatments', patientId],
    queryFn: () => getTreatmentsUseCase(apiFetcher, patientId),
    enabled: enabled && !!patientId,
    staleTime: 2 * 60 * 1000, // ✅ REDUCIDO: 2 minutos para más frescura
  });

  return {
    queryTreatments,
  };
};

// ✅ Hook para obtener presupuestos de un paciente
export const useBudgetsByPatient = (patientId: number, enabled = true) => {
  const queryBudgets = useQuery({
    queryKey: ['treatments', 'budgets', patientId],
    queryFn: () => getBudgetsByPatientUseCase(apiFetcher, patientId),
    enabled: enabled && !!patientId,
    staleTime: 1 * 60 * 1000, // ✅ REDUCIDO: 1 minuto para presupuestos
  });

  return {
    queryBudgets,
    budgets: queryBudgets.data?.budgets || [],
    activeBudget: queryBudgets.data?.budgets.find(b => b.status === 'activo') || null,
    isLoadingBudgets: queryBudgets.isLoading,
    errorBudgets: queryBudgets.error,
  };
};

// Hook para obtener tratamientos de un presupuesto específico
export const useTreatmentsByBudget = (budgetId: number, enabled = true) => {
  const queryTreatmentsByBudget = useQuery({
    queryKey: ['treatments', 'budget', budgetId],
    queryFn: () => getTreatmentsByBudgetUseCase(apiFetcher, budgetId),
    enabled: enabled && !!budgetId,
    staleTime: 2 * 60 * 1000, // ✅ REDUCIDO: 2 minutos
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
    staleTime: 5 * 60 * 1000,
  });

  return {
    queryTreatment,
  };
};

// ✅ FUNCIÓN HELPER PARA INVALIDAR TODAS LAS QUERIES RELACIONADAS
const invalidateAllTreatmentQueries = (queryClient: any, patientId: number) => {
  // Invalidar tratamientos del paciente
  queryClient.invalidateQueries({ queryKey: ['treatments', patientId] });

  // Invalidar presupuestos del paciente
  queryClient.invalidateQueries({ queryKey: ['treatments', 'budgets', patientId] });

  // Invalidar todos los tratamientos por presupuesto
  queryClient.invalidateQueries({ queryKey: ['treatments', 'budget'] });

  // ✅ TAMBIÉN INVALIDAR QUERIES DE PRESUPUESTOS GENERALES (si existen)
  queryClient.invalidateQueries({ queryKey: ['budgets'] });
  queryClient.invalidateQueries({ queryKey: ['budgets', 'patient', patientId] });

  // ✅ INVALIDAR ESTADÍSTICAS DE PRESUPUESTOS
  queryClient.invalidateQueries({ queryKey: ['budgets', 'stats'] });
};

// Hook para crear tratamiento - ✅ MEJORADO
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

      console.log('🔄 Invalidando queries después de crear tratamiento...');

      // ✅ INVALIDAR TODAS LAS QUERIES RELACIONADAS
      invalidateAllTreatmentQueries(queryClient, variables.patientId);

      // ✅ REFRESCAR INMEDIATAMENTE las queries críticas
      queryClient.refetchQueries({
        queryKey: ['treatments', 'budgets', variables.patientId],
        type: 'active'
      });

      // Si se vinculó a un presupuesto, refrescar específicamente ese presupuesto
      if (variables.treatmentData.selectedBudgetId) {
        queryClient.refetchQueries({
          queryKey: ['treatments', 'budget', variables.treatmentData.selectedBudgetId],
          type: 'active'
        });
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

// Hook para actualizar tratamiento - ✅ MEJORADO
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

      console.log('🔄 Invalidando queries después de actualizar tratamiento...');

      // ✅ INVALIDAR TODAS LAS QUERIES RELACIONADAS
      queryClient.invalidateQueries({ queryKey: ['treatments'] });
      queryClient.invalidateQueries({ queryKey: ['treatment', variables.treatmentId] });
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

// Hook para completar tratamiento - ✅ MEJORADO CON INVALIDACIÓN ESPECÍFICA
export const useCompleteTreatment = (patientId?: number) => {
  const [isLoadingComplete, setIsLoadingComplete] = useState(false);
  const queryClient = useQueryClient();

  const completeTreatmentMutation = useMutation({
    mutationFn: ({ treatmentId, patientId: pid }: { treatmentId: number; patientId?: number }) => {
      return completeTreatmentUseCase(apiFetcher, treatmentId, pid);
    },
    onMutate: () => {
      setIsLoadingComplete(true);
    },
    onSuccess: (_, variables) => {
      setIsLoadingComplete(false);

      console.log('🔄 Invalidando queries después de completar tratamiento...');

      // ✅ INVALIDAR TODAS LAS QUERIES RELACIONADAS (esto es crítico para completar tratamientos)
      queryClient.invalidateQueries({ queryKey: ['treatments'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });

      // ✅ INVALIDAR HISTORIAL DE AUDITORÍA (NUEVO - para que aparezca el log inmediatamente)
      if (variables.patientId) {
        queryClient.invalidateQueries({ queryKey: ['auditHistory', variables.patientId] });
        console.log('✅ Historial de auditoría invalidado para patient:', variables.patientId);
      } else if (patientId) {
        queryClient.invalidateQueries({ queryKey: ['auditHistory', patientId] });
        console.log('✅ Historial de auditoría invalidado para patient:', patientId);
      }

      // ✅ FORZAR REFETCH INMEDIATO para datos críticos
      queryClient.refetchQueries({
        queryKey: ['treatments', 'budgets'],
        type: 'active'
      });
      queryClient.refetchQueries({
        queryKey: ['treatments', 'budget'],
        type: 'active'
      });
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
    onSuccess: (data, treatmentId) => {
      setIsLoadingDelete(false);

      console.log('🔄 Invalidando queries después de eliminar tratamiento con budget item:', treatmentId);

      // ✅ INVALIDACIÓN COMPLETA - CRÍTICA PARA REFLEJAR CAMBIOS EN PRESUPUESTOS

      // 1. Invalidar todas las queries de tratamientos
      queryClient.invalidateQueries({ queryKey: ['treatments'] });

      // 2. Invalidar todas las queries de presupuestos (CRÍTICO)
      queryClient.invalidateQueries({ queryKey: ['budgets'] });

      // 3. Forzar refetch inmediato de queries activas
      queryClient.refetchQueries({
        queryKey: ['treatments', 'budgets'],
        type: 'active'
      });

      queryClient.refetchQueries({
        queryKey: ['treatments', 'budget'],
        type: 'active'
      });

      // 4. Invalidar estadísticas de presupuestos
      queryClient.invalidateQueries({ queryKey: ['budget', 'stats'] });

      console.log('✅ Invalidación completa realizada');
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

// ✅ Hook combinado mejorado con invalidación específica por paciente
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