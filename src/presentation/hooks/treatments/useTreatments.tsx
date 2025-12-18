// src/presentation/hooks/treatments/useTreatments.tsx - ACTUALIZADO CON INVALIDACIÓN COMPLETA Y SISTEMA DE EVOLUCIONES
import { useState, useMemo } from 'react';
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
  addTreatmentSessionUseCase,
  type CreateTreatmentData,
  type UpdateTreatmentData,
  type GetTreatmentsResponse,
  type GetTreatmentByIdResponse,
  type GetBudgetSummariesResponse,
  type GetTreatmentsByBudgetResponse,
  type AddSessionData,
  type Treatment,
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

// Hook para obtener budget_items con tratamientos de un presupuesto específico
export const useTreatmentsByBudget = (budgetId: number, enabled = true) => {
  const queryTreatmentsByBudget = useQuery({
    queryKey: ['treatments', 'budget', budgetId],
    queryFn: () => getTreatmentsByBudgetUseCase(apiFetcher, budgetId),
    enabled: enabled && !!budgetId,
    staleTime: 2 * 60 * 1000, // ✅ REDUCIDO: 2 minutos
  });

  return {
    queryTreatmentsByBudget,
    budgetItems: queryTreatmentsByBudget.data?.budgetItems || [], // ✅ CAMBIO: Retorna budgetItems
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

      // ✅ INVALIDAR HISTORIAL MÉDICO (para que aparezca la actualización)
      queryClient.invalidateQueries({ queryKey: ['medicalHistory'] });
      queryClient.invalidateQueries({ queryKey: ['auditHistory'] });
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

      // ✅ INVALIDAR HISTORIAL MÉDICO Y DE AUDITORÍA (para que aparezca el log inmediatamente)
      if (variables.patientId) {
        queryClient.invalidateQueries({ queryKey: ['auditHistory', variables.patientId] });
        queryClient.invalidateQueries({ queryKey: ['medicalHistory', variables.patientId] });
        console.log('✅ Historial médico y de auditoría invalidado para patient:', variables.patientId);
      } else if (patientId) {
        queryClient.invalidateQueries({ queryKey: ['auditHistory', patientId] });
        queryClient.invalidateQueries({ queryKey: ['medicalHistory', patientId] });
        console.log('✅ Historial médico y de auditoría invalidado para patient:', patientId);
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

// ✅ NUEVO: Hook para agregar sesión/evolución a un tratamiento
export const useAddTreatmentSession = (patientId?: number) => {
  const [isLoadingAddSession, setIsLoadingAddSession] = useState(false);
  const queryClient = useQueryClient();

  const addSessionMutation = useMutation({
    mutationFn: ({ patientId: pid, sessionData }: { patientId: number; sessionData: AddSessionData }) => {
      return addTreatmentSessionUseCase(apiFetcher, pid, sessionData);
    },
    onMutate: () => {
      setIsLoadingAddSession(true);
    },
    onSuccess: (_, variables) => {
      setIsLoadingAddSession(false);

      console.log('🔄 Invalidando queries después de agregar sesión...');

      // Invalidar todas las queries relacionadas
      const pid = variables.patientId || patientId;
      if (pid) {
        invalidateAllTreatmentQueries(queryClient, pid);
      }

      // Refetch inmediato
      queryClient.refetchQueries({
        queryKey: ['treatments', 'budget'],
        type: 'active'
      });

      // ✅ Invalidar historial médico Y de auditoría
      if (pid) {
        queryClient.invalidateQueries({ queryKey: ['auditHistory', pid] });
        queryClient.invalidateQueries({ queryKey: ['medicalHistory', pid] });
        console.log('✅ Historial médico invalidado para patient:', pid);
      }
    },
    onError: () => {
      setIsLoadingAddSession(false);
    },
  });

  return {
    addSessionMutation,
    isLoadingAddSession,
  };
};

// ✅ NUEVO: Helper para agrupar tratamientos por budget_item_id
export interface TreatmentGroup {
  budget_item_id: number | null;
  mainTreatment: Treatment; // Tratamiento principal (el primero creado) o fantasma si no hay treatments
  sessions: Treatment[]; // Sesiones/evoluciones adicionales
  totalSessions: number;
  status: string;
  budget_item_pieza?: string;
  budget_item_valor?: string;
  hasTreatments?: boolean; // ✅ NUEVO: Indica si tiene treatments reales (no fantasma)
}

/**
 * Agrupa tratamientos por budget_item_id para mostrar tratamiento principal + sesiones
 * @param treatments - Lista de tratamientos
 * @returns Array de grupos de tratamientos
 */
export const groupTreatmentsByBudgetItem = (treatments: Treatment[]): TreatmentGroup[] => {
  const groups = new Map<number | string, TreatmentGroup>();

  // Primero, ordenar tratamientos por fecha de creación (más antiguos primero)
  const sortedTreatments = [...treatments].sort((a, b) => {
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

  sortedTreatments.forEach(treatment => {
    const key = treatment.budget_item_id ?? `standalone-${treatment.id_tratamiento}`;

    if (!groups.has(key)) {
      // Primer tratamiento del grupo = tratamiento principal
      groups.set(key, {
        budget_item_id: treatment.budget_item_id ?? null,
        mainTreatment: treatment,
        sessions: [],
        totalSessions: 0,
        status: treatment.status || 'pending',
        budget_item_pieza: treatment.budget_item_pieza,
        budget_item_valor: treatment.budget_item_valor,
      });
    } else {
      // Tratamientos subsecuentes = sesiones
      const group = groups.get(key)!;
      group.sessions.push(treatment);
      group.totalSessions = group.sessions.length;

      // Actualizar estado del grupo (si alguna sesión está en_proceso, el grupo está en_proceso)
      if (treatment.status === 'en_proceso' && group.status === 'planificado') {
        group.status = 'en_proceso';
      }
      if (treatment.status === 'completado') {
        group.status = 'completado';
      }
    }
  });

  return Array.from(groups.values());
};

// ✅ Hook mejorado - budgetItems ya vienen agrupados del backend
export const useTreatmentsByBudgetGrouped = (budgetId: number, enabled = true) => {
  const { budgetItems, isLoadingTreatmentsByBudget, ...rest } = useTreatmentsByBudget(budgetId, enabled);

  // ✅ NUEVO: Convertir budgetItems a TreatmentGroup para compatibilidad con UI
  // Siempre muestra todos los budget_items, tengan o no treatments
  const groupedTreatments = useMemo(() => {
    console.log('🔄 Agrupando budgetItems:', {
      count: budgetItems.length,
      items: budgetItems.map(item => ({
        id: item.id,
        accion: item.accion,
        treatments: item.treatments.length
      }))
    });

    return budgetItems.map(item => {
      const hasTreatments = item.treatments.length > 0;

      const group = {
        budget_item_id: item.id,
        mainTreatment: hasTreatments
          ? item.treatments[0]
          : {
              // ✅ Tratamiento "fantasma" para budget_items sin treatments
              id_tratamiento: 0,
              id_paciente: 0,
              id_doctor: 0,
              budget_item_id: item.id,
              fecha_control: '',
              hora_control: '',
              nombre_servicio: item.accion + (item.pieza ? ` - Pieza ${item.pieza}` : ''),
              descripcion: '',
              status: item.status,
              created_at: item.created_at,
              is_active: true,
              budget_item_pieza: item.pieza,
              budget_item_valor: item.valor,
            },
        sessions: hasTreatments ? item.treatments.slice(1) : [], // Sesiones adicionales
        totalSessions: hasTreatments ? item.treatments.length - 1 : 0,
        status: item.status,
        budget_item_pieza: item.pieza,
        budget_item_valor: item.valor,
        hasTreatments, // ✅ NUEVO: Indica si tiene treatments reales
      };

      console.log('📦 Grupo creado:', {
        budget_item_id: group.budget_item_id,
        accion: item.accion,
        hasTreatments: group.hasTreatments,
        mainTreatment_id: group.mainTreatment.id_tratamiento
      });

      return group;
    });
  }, [budgetItems]);

  return {
    budgetItems,
    groupedTreatments,
    isLoadingTreatmentsByBudget,
    ...rest,
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
  const addSession = useAddTreatmentSession(patientId);

  return {
    // Datos
    ...treatments,
    ...budgets,

    // Operaciones con invalidación mejorada
    createTreatment: createTreatment.createTreatmentMutation.mutateAsync,
    updateTreatment: updateTreatment.updateTreatmentMutation.mutateAsync,
    completeTreatment: completeTreatment.completeTreatmentMutation.mutateAsync,
    deleteTreatment: deleteTreatment.deleteTreatmentMutation.mutateAsync,
    addSession: addSession.addSessionMutation.mutateAsync,

    // Estados de carga
    isLoadingCreate: createTreatment.isLoadingCreate,
    isLoadingUpdate: updateTreatment.isLoadingUpdate,
    isLoadingComplete: completeTreatment.isLoadingComplete,
    isLoadingDelete: deleteTreatment.isLoadingDelete,
    isLoadingAddSession: addSession.isLoadingAddSession,

    // Mutaciones para manejo de errores
    createTreatmentMutation: createTreatment.createTreatmentMutation,
    updateTreatmentMutation: updateTreatment.updateTreatmentMutation,
    completeTreatmentMutation: completeTreatment.completeTreatmentMutation,
    deleteTreatmentMutation: deleteTreatment.deleteTreatmentMutation,
    addSessionMutation: addSession.addSessionMutation,
  };
};