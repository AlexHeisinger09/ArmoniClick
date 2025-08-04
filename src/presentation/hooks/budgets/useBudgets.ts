// src/presentation/hooks/budgets/useBudgets.ts - ACTUALIZADO PARA MÚLTIPLES PRESUPUESTOS
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetcher } from '@/config/adapters/api.adapter';
import {
  getBudgetStatsUseCase,
  getAllBudgetsByPatientUseCase,
  getActiveBudgetByPatientUseCase,
  saveBudgetUseCase,
  activateBudgetUseCase,
  completeBudgetUseCase,
  revertBudgetUseCase,
  deleteBudgetByIdUseCase,
  CreateBudgetData,
  Budget,
  BudgetUtils,
} from "@/core/use-cases/budgets";

// ✅ Hook para obtener TODOS los presupuestos de un paciente
export const useAllBudgets = (patientId: number) => {
  const queryAllBudgets = useQuery({
    queryKey: ['budgets', 'patient', patientId, 'all'],
    queryFn: () => getAllBudgetsByPatientUseCase(apiFetcher, patientId),
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  return {
    queryAllBudgets,
    budgets: queryAllBudgets.data?.budgets || [],
    sortedBudgets: queryAllBudgets.data?.budgets 
      ? BudgetUtils.sortBudgetsByPriority(queryAllBudgets.data.budgets)
      : [],
    total: queryAllBudgets.data?.total || 0,
    isLoadingAll: queryAllBudgets.isLoading,
    errorAll: queryAllBudgets.error,
  };
};

// ✅ Hook para obtener solo el presupuesto ACTIVO de un paciente
export const useActiveBudget = (patientId: number) => {
  const queryActiveBudget = useQuery({
    queryKey: ['budgets', 'patient', patientId, 'active'],
    queryFn: () => getActiveBudgetByPatientUseCase(apiFetcher, patientId),
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  return {
    queryActiveBudget,
    activeBudget: queryActiveBudget.data?.budget,
    canModifyActive: queryActiveBudget.data?.canModify ?? false,
    isLoadingActive: queryActiveBudget.isLoading,
    errorActive: queryActiveBudget.error,
  };
};

// ✅ Hook legacy para compatibilidad (devuelve el primer presupuesto encontrado)
export const useBudget = (patientId: number) => {
  const { budgets, isLoadingAll, errorAll } = useAllBudgets(patientId);
  
  // Devolver el primer presupuesto (priorizando activo)
  const budget = budgets.length > 0 ? budgets[0] : null;
  const canModify = budget ? BudgetUtils.canModify(budget) : false;

  return {
    queryBudget: { data: { budget, canModify }, isLoading: isLoadingAll, error: errorAll },
    budget,
    canModify,
    isLoading: isLoadingAll,
    error: errorAll,
  };
};

// ✅ Hook para guardar presupuesto
export const useSaveBudget = () => {
  const queryClient = useQueryClient();

  const saveBudgetMutation = useMutation({
    mutationFn: (budgetData: CreateBudgetData) => 
      saveBudgetUseCase(apiFetcher, budgetData),
    onSuccess: (data, variables) => {
      // Invalidar todas las queries relacionadas con presupuestos de este paciente
      queryClient.invalidateQueries({ 
        queryKey: ['budgets', 'patient', variables.patientId] 
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

// ✅ Hook para activar presupuesto
export const useActivateBudget = () => {
  const queryClient = useQueryClient();

  const activateBudgetMutation = useMutation({
    mutationFn: (budgetId: number) => 
      activateBudgetUseCase(apiFetcher, budgetId),
    onSuccess: (data, budgetId) => {
      // Invalidar todas las queries de presupuestos
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budget'] });
    },
  });

  return {
    activateBudgetMutation,
    activateBudget: activateBudgetMutation.mutateAsync,
    isLoadingActivate: activateBudgetMutation.isPending,
  };
};

// ✅ Hook para completar presupuesto
export const useCompleteBudget = () => {
  const queryClient = useQueryClient();

  const completeBudgetMutation = useMutation({
    mutationFn: (budgetId: number) => 
      completeBudgetUseCase(apiFetcher, budgetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budget'] });
    },
  });

  return {
    completeBudgetMutation,
    completeBudget: completeBudgetMutation.mutateAsync,
    isLoadingComplete: completeBudgetMutation.isPending,
  };
};

// ✅ Hook para revertir presupuesto a borrador
export const useRevertBudget = () => {
  const queryClient = useQueryClient();

  const revertBudgetMutation = useMutation({
    mutationFn: (budgetId: number) => 
      revertBudgetUseCase(apiFetcher, budgetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budget'] });
    },
  });

  return {
    revertBudgetMutation,
    revertBudget: revertBudgetMutation.mutateAsync,
    isLoadingRevert: revertBudgetMutation.isPending,
  };
};

// ✅ Hook para eliminar presupuesto por ID
export const useDeleteBudgetById = () => {
  const queryClient = useQueryClient();

  const deleteBudgetMutation = useMutation({
    mutationFn: (budgetId: number) => 
      deleteBudgetByIdUseCase(apiFetcher, budgetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budget'] });
    },
  });

  return {
    deleteBudgetMutation,
    deleteBudget: deleteBudgetMutation.mutateAsync,
    isLoadingDelete: deleteBudgetMutation.isPending,
  };
};

// Hook para estadísticas de presupuestos (sin cambios)
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

// ✅ Hook combinado para manejar todas las operaciones de presupuestos múltiples
export const useMultipleBudgetOperations = (patientId: number) => {
  const allBudgets = useAllBudgets(patientId);
  const activeBudget = useActiveBudget(patientId);
  const saveBudget = useSaveBudget();
  const activateBudget = useActivateBudget();
  const completeBudget = useCompleteBudget();
  const revertBudget = useRevertBudget();
  const deleteBudget = useDeleteBudgetById();

  return {
    // Datos de presupuestos
    ...allBudgets,
    ...activeBudget,
    
    // Operaciones
    saveBudget: saveBudget.saveBudget,
    activateBudget: activateBudget.activateBudget,
    completeBudget: completeBudget.completeBudget,
    revertBudget: revertBudget.revertBudget,
    deleteBudget: deleteBudget.deleteBudget,
    
    // Estados de carga
    isLoadingSave: saveBudget.isLoadingSave,
    isLoadingActivate: activateBudget.isLoadingActivate,
    isLoadingComplete: completeBudget.isLoadingComplete,
    isLoadingRevert: revertBudget.isLoadingRevert,
    isLoadingDelete: deleteBudget.isLoadingDelete,
    
    // Mutaciones para manejo de errores
    saveBudgetMutation: saveBudget.saveBudgetMutation,
    activateBudgetMutation: activateBudget.activateBudgetMutation,
    completeBudgetMutation: completeBudget.completeBudgetMutation,
    revertBudgetMutation: revertBudget.revertBudgetMutation,
    deleteBudgetMutation: deleteBudget.deleteBudgetMutation,
  };
};

// ✅ Hook legacy para compatibilidad con el código existente
export const useBudgetOperations = (patientId: number) => {
  const budget = useBudget(patientId);
  const saveBudget = useSaveBudget();
  const activateBudget = useActivateBudget();
  const deleteBudget = useDeleteBudgetById();

  return {
    // Datos del presupuesto (compatibilidad)
    ...budget,
    
    // Operaciones principales
    saveBudget: saveBudget.saveBudget,
    updateBudgetStatus: async ({ budgetId, statusData }: { budgetId: number; statusData: { status: string } }) => {
      // Mapear a las nuevas operaciones según el estado
      if (statusData.status === 'activo') {
        return activateBudget.activateBudget(budgetId);
      }
      throw new Error('Estado no soportado');
    },
    deleteBudget: (budgetId: number) => deleteBudget.deleteBudget(budgetId),
    
    // Estados de carga
    isLoadingSave: saveBudget.isLoadingSave,
    isLoadingUpdateStatus: activateBudget.isLoadingActivate,
    isLoadingDelete: deleteBudget.isLoadingDelete,
    
    // Mutaciones
    saveBudgetMutation: saveBudget.saveBudgetMutation,
    updateStatusMutation: activateBudget.activateBudgetMutation,
    deleteBudgetMutation: deleteBudget.deleteBudgetMutation,
  };
};