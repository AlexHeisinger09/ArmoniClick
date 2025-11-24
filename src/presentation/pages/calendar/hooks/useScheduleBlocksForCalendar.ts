// src/presentation/pages/calendar/hooks/useScheduleBlocksForCalendar.ts
import { useQuery } from '@tanstack/react-query';
import { getScheduleBlocksUseCase } from '@/core/use-cases/schedule-blocks';
import { useLoginMutation, useProfile } from '@/presentation/hooks';
import { ScheduleBlock } from '@/core/entities/ScheduleBlock';

interface ScheduleBlocksByDate {
  [dateKey: string]: ScheduleBlock[];
}

export const useScheduleBlocksForCalendar = () => {
  const { token } = useLoginMutation();
  const { queryProfile } = useProfile(token || '');
  const doctorId = queryProfile.data?.id || 0;

  const { data: blocksData, isLoading, error } = useQuery({
    queryKey: ['scheduleBlocks', doctorId],
    queryFn: () => getScheduleBlocksUseCase(doctorId),
    enabled: !!doctorId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Organizar bloques por fecha para acceso rápido
  const blocksByDate: ScheduleBlocksByDate = {};

  if (blocksData?.blocks) {
    blocksData.blocks.forEach((block: ScheduleBlock) => {
      const dateKey = formatDateKey(new Date(block.blockDate));
      if (!blocksByDate[dateKey]) {
        blocksByDate[dateKey] = [];
      }
      blocksByDate[dateKey].push(block);
    });
  }

  return {
    blocks: blocksData?.blocks || [],
    blocksByDate,
    isLoading,
    error
  };
};

// Función auxiliar para formatear fecha
export const formatDateKey = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Función para validar si un horario está bloqueado
export const isTimeSlotBlocked = (
  blocks: ScheduleBlock[],
  date: Date,
  time: string,
  duration: number = 60,
  dayOfWeek?: number
): boolean => {
  if (!blocks || blocks.length === 0) return false;

  // Convertir tiempo a minutos desde las 00:00
  const [hours, minutes] = time.split(':').map(Number);
  const startMinutes = hours * 60 + minutes;
  const endMinutes = startMinutes + duration;

  const dateKey = formatDateKey(date);

  // Obtener el día de la semana (0 = lunes, 6 = domingo)
  const dayOfWeekMap = {
    0: 'monday',
    1: 'tuesday',
    2: 'wednesday',
    3: 'thursday',
    4: 'friday',
    5: 'saturday',
    6: 'sunday'
  };

  // JavaScript getDay() devuelve 0 = domingo, necesitamos ajustar
  const jsDay = date.getDay();
  const adjustedDay = jsDay === 0 ? 6 : jsDay - 1;
  const currentDayName = dayOfWeekMap[adjustedDay as keyof typeof dayOfWeekMap];

  // Verificar cada bloque
  for (const block of blocks) {
    // Para bloques single_date, debe coincidir exactamente la fecha
    if (block.blockType === 'single_date') {
      const blockDateKey = formatDateKey(block.blockDate);
      if (blockDateKey !== dateKey) continue;
    }
    // Para bloques recurrentes, verificar patrón y fecha
    else if (block.blockType === 'recurring') {
      // Si hay una fecha de fin y la fecha actual es después, no aplica
      if (block.recurringEndDate && new Date(block.blockDate) > new Date(block.recurringEndDate)) {
        continue;
      }

      // Validar que la fecha sea igual o posterior a la fecha de inicio del bloque recurrente
      if (new Date(dateKey) < new Date(formatDateKey(block.blockDate))) {
        continue;
      }

      // Si hay una fecha de fin y la actual es después, no aplica
      if (block.recurringEndDate && new Date(dateKey) > new Date(formatDateKey(block.recurringEndDate))) {
        continue;
      }

      // Validar el patrón de recurrencia
      if (block.recurringPattern === 'daily') {
        // Todos los días
      } else if (block.recurringPattern === 'weekly') {
        // Solo los mismos días de la semana
        const blockDay = new Date(block.blockDate).getDay();
        const blockAdjustedDay = blockDay === 0 ? 6 : blockDay - 1;
        const blockDayName = dayOfWeekMap[blockAdjustedDay as keyof typeof dayOfWeekMap];
        if (blockDayName !== currentDayName) continue;
      } else if (block.recurringPattern && dayOfWeekMap[adjustedDay as keyof typeof dayOfWeekMap] !== block.recurringPattern) {
        // Patrón específico de día (lunes, martes, etc)
        continue;
      }
    }

    // Validar rango de horario
    const [blockHours, blockMinutes] = block.startTime.split(':').map(Number);
    const [blockEndHours, blockEndMinutes] = block.endTime.split(':').map(Number);

    const blockStart = blockHours * 60 + blockMinutes;
    const blockEnd = blockEndHours * 60 + blockEndMinutes;

    // Verificar si hay solapamiento entre el horario solicitado y el bloqueo
    if (startMinutes < blockEnd && endMinutes > blockStart) {
      return true;
    }
  }

  return false;
};
