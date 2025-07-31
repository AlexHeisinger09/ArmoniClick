// src/presentation/hooks/budgets/useBudgets.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetcher } from '@/config/adapters/api.adapter';
import { getBudgetStatsUseCase } from "@/core/use-cases/budgets/get-budget-stats.use-case";
import {
  getBudgetByPatientUseCase,
  saveBudgetUseCase,
  updateBudgetStatusUseCase,
  deleteBudgetUseCase,
  CreateBudgetData,
  UpdateBudgetStatusData,
} from "@/core/use-cases/budgets";

// Hook para obtener presupuesto de un paciente
export const useBudget = (patientId: number) => {
  const queryBudget = useQuery({
    queryKey: ['budget', 'patient', patientId],
    queryFn: () => getBudgetByPatientUseCase(apiFetcher, patientId),
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  return {
    queryBudget,
    budget: queryBudget.data?.budget,
    canModify: queryBudget.data?.canModify ?? false,
    isLoading: queryBudget.isLoading,
    error: queryBudget.error,
  };
};

// Hook para guardar presupuesto
export const useSaveBudget = () => {
  const queryClient = useQueryClient();

  const saveBudgetMutation = useMutation({
    mutationFn: (budgetData: CreateBudgetData) => 
      saveBudgetUseCase(apiFetcher, budgetData),
    onSuccess: (data, variables) => {
      // Invalidar y refrescar el presupuesto del paciente
      queryClient.invalidateQueries({ 
        queryKey: ['budget', 'patient', variables.patientId] 
      });
      
      // Invalidar estadísticas de presupuestos
      queryClient.invalidateQueries({ 
        queryKey: ['budget', 'stats'] 
      });
    },
  });

  return {
    saveBudgetMutation,
    saveBudget: saveBudgetMutation.mutateAsync,
    isLoadingSave: saveBudgetMutation.isPending,
  };
};

// Hook para actualizar estado del presupuesto
export const useUpdateBudgetStatus = () => {
  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation({
    mutationFn: ({ budgetId, statusData }: { 
      budgetId: number; 
      statusData: UpdateBudgetStatusData 
    }) => updateBudgetStatusUseCase(apiFetcher, budgetId, statusData),
    onSuccess: (data, variables) => {
      // Invalidar todas las queries relacionadas con presupuestos
      queryClient.invalidateQueries({ queryKey: ['budget'] });
    },
  });

  return {
    updateStatusMutation,
    updateBudgetStatus: updateStatusMutation.mutateAsync,
    isLoadingUpdateStatus: updateStatusMutation.isPending,
  };
};

// Hook para eliminar presupuesto
export const useDeleteBudget = () => {
  const queryClient = useQueryClient();

  const deleteBudgetMutation = useMutation({
    mutationFn: (patientId: number) => 
      deleteBudgetUseCase(apiFetcher, patientId),
    onSuccess: (data, patientId) => {
      // Invalidar el presupuesto específico del paciente
      queryClient.invalidateQueries({ 
        queryKey: ['budget', 'patient', patientId] 
      });
      
      // Invalidar estadísticas
      queryClient.invalidateQueries({ 
        queryKey: ['budget', 'stats'] 
      });
    },
  });

  return {
    deleteBudgetMutation,
    deleteBudget: deleteBudgetMutation.mutateAsync,
    isLoadingDelete: deleteBudgetMutation.isPending,
  };
};

// Hook para estadísticas de presupuestos
export const useBudgetStats = () => {
  const queryStats = useQuery({
    queryKey: ['budget', 'stats'],
    queryFn: () => getBudgetStatsUseCase(apiFetcher),
    staleTime: 10 * 60 * 1000, // 10 minutos
  });

  return {
    queryStats,
    stats: queryStats.data?.stats,
    isLoadingStats: queryStats.isLoading,
    errorStats: queryStats.error,
  };
};

// Hook combinado para manejar todas las operaciones de presupuesto
export const useBudgetOperations = (patientId: number) => {
  const budget = useBudget(patientId);
  const saveBudget = useSaveBudget();
  const updateStatus = useUpdateBudgetStatus();
  const deleteBudget = useDeleteBudget();

  return {
    // Datos del presupuesto
    ...budget,
    
    // Operaciones
    saveBudget: saveBudget.saveBudget,
    updateBudgetStatus: updateStatus.updateBudgetStatus,
    deleteBudget: deleteBudget.deleteBudget,
    
    // Estados de carga
    isLoadingSave: saveBudget.isLoadingSave,
    isLoadingUpdateStatus: updateStatus.isLoadingUpdateStatus,
    isLoadingDelete: deleteBudget.isLoadingDelete,
    
    // Mutaciones para manejo de errores
    saveBudgetMutation: saveBudget.saveBudgetMutation,
    updateStatusMutation: updateStatus.updateStatusMutation,
    deleteBudgetMutation: deleteBudget.deleteBudgetMutation,
  };
};