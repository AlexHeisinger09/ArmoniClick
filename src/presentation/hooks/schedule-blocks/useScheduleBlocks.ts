// src/presentation/hooks/schedule-blocks/useScheduleBlocks.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getScheduleBlocksUseCase, createScheduleBlockUseCase, updateScheduleBlockUseCase, deleteScheduleBlockUseCase, CreateScheduleBlockData, UpdateScheduleBlockData } from '@/core/use-cases/schedule-blocks';
import { ScheduleBlock } from '@/core/entities/ScheduleBlock';

export function useScheduleBlocks(doctorId: number) {
  const queryClient = useQueryClient();

  // GET - Obtener bloques de agenda del doctor
  const { data: blocksData, isLoading, error, refetch } = useQuery({
    queryKey: ['scheduleBlocks', doctorId],
    queryFn: () => getScheduleBlocksUseCase(doctorId),
    enabled: !!doctorId
  });

  // CREATE - Crear nuevo bloque
  const createBlockMutation = useMutation({
    mutationFn: (data: CreateScheduleBlockData) => createScheduleBlockUseCase(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduleBlocks', doctorId] });
    }
  });

  // UPDATE - Actualizar bloque
  const updateBlockMutation = useMutation({
    mutationFn: ({ blockId, data }: { blockId: number; data: UpdateScheduleBlockData }) =>
      updateScheduleBlockUseCase(blockId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduleBlocks', doctorId] });
    }
  });

  // DELETE - Eliminar bloque
  const deleteBlockMutation = useMutation({
    mutationFn: (blockId: number) => deleteScheduleBlockUseCase(blockId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduleBlocks', doctorId] });
    }
  });

  return {
    blocks: blocksData?.blocks || [],
    total: blocksData?.total || 0,
    isLoading,
    error,
    refetch,

    // Operaciones
    createBlock: (data: CreateScheduleBlockData) => createBlockMutation.mutateAsync(data),
    updateBlock: (blockId: number, data: UpdateScheduleBlockData) =>
      updateBlockMutation.mutateAsync({ blockId, data }),
    deleteBlock: (blockId: number) => deleteBlockMutation.mutateAsync(blockId),

    // Estados de loading
    isCreating: createBlockMutation.isPending,
    isUpdating: updateBlockMutation.isPending,
    isDeleting: deleteBlockMutation.isPending,

    // Errores
    createError: createBlockMutation.error,
    updateError: updateBlockMutation.error,
    deleteError: deleteBlockMutation.error
  };
}
