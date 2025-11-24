import React from 'react';
import { ScheduleBlock } from '@/core/entities/ScheduleBlock';
import { formatDateKey } from '../utils/calendar';

interface ScheduleBlockVisualProps {
  blocks: ScheduleBlock[];
  date: Date;
  viewType: 'day' | 'week';
}

export const ScheduleBlockVisual: React.FC<ScheduleBlockVisualProps> = ({
  blocks,
  date,
  viewType
}) => {
  // Obtener los bloques que aplican a esta fecha
  const getBlocksForDate = (): ScheduleBlock[] => {
    const dateKey = formatDateKey(date);
    const dayOfWeekMap = {
      0: 'monday',
      1: 'tuesday',
      2: 'wednesday',
      3: 'thursday',
      4: 'friday',
      5: 'saturday',
      6: 'sunday'
    };

    const jsDay = date.getDay();
    const adjustedDay = jsDay === 0 ? 6 : jsDay - 1;
    const currentDayName = dayOfWeekMap[adjustedDay as keyof typeof dayOfWeekMap];

    return blocks.filter(block => {
      if (block.blockType === 'single_date') {
        const blockDateKey = formatDateKey(new Date(block.blockDate));
        return blockDateKey === dateKey;
      } else if (block.blockType === 'recurring') {
        if (new Date(dateKey) < new Date(formatDateKey(new Date(block.blockDate)))) {
          return false;
        }

        if (block.recurringEndDate && new Date(dateKey) > new Date(formatDateKey(new Date(block.recurringEndDate)))) {
          return false;
        }

        if (block.recurringPattern === 'daily') {
          return true;
        } else if (block.recurringPattern === 'weekly') {
          const blockDay = new Date(block.blockDate).getDay();
          const blockAdjustedDay = blockDay === 0 ? 6 : blockDay - 1;
          const blockDayName = dayOfWeekMap[blockAdjustedDay as keyof typeof dayOfWeekMap];
          return blockDayName === currentDayName;
        } else if (block.recurringPattern && dayOfWeekMap[adjustedDay as keyof typeof dayOfWeekMap] === block.recurringPattern) {
          return true;
        }
      }
      return false;
    });
  };

  const applicableBlocks = getBlocksForDate();

  if (applicableBlocks.length === 0) {
    return null;
  }

  // Renderizar bloques en DayView (altura: 80px por slot de 30 min)
  if (viewType === 'day') {
    return (
      <>
        {applicableBlocks.map((block, index) => {
          const [startHours, startMinutes] = block.startTime.split(':').map(Number);
          const [endHours, endMinutes] = block.endTime.split(':').map(Number);

          const startTotal = startHours * 60 + startMinutes;
          const endTotal = endHours * 60 + endMinutes;

          // Usar la misma lógica que AppointmentBlock:
          // El calendario muestra desde 09:00 en adelante
          const START_OF_CALENDAR = 9 * 60; // 09:00 = 540 minutos
          const SLOT_HEIGHT_PX = 80; // 80px per 30-minute slot
          const MINUTES_PER_SLOT = 30;

          // Calcular posición relativa a las 09:00
          const minutesFromStart = startTotal - START_OF_CALENDAR;
          const pixelPerMinute = SLOT_HEIGHT_PX / MINUTES_PER_SLOT;
          const topPx = minutesFromStart * pixelPerMinute;

          // Calcular altura
          const durationMinutes = endTotal - startTotal;
          const heightPx = (durationMinutes / MINUTES_PER_SLOT) * SLOT_HEIGHT_PX;

          return (
            <div
              key={`${block.id}-${index}`}
              className="absolute inset-x-0 bg-slate-200 bg-opacity-40 border-l-4 border-slate-300 pointer-events-none z-20 group"
              style={{
                top: `${topPx}px`,
                height: `${heightPx}px`,
                minHeight: '20px'
              }}
              title={`Bloqueado: ${block.startTime} - ${block.endTime}`}
            >
              <div className="px-2 py-1 text-xs font-medium text-slate-600 opacity-90 truncate font-semibold">
                BLOQUEADO
              </div>
            </div>
          );
        })}
      </>
    );
  }

  // Renderizar bloques en WeekView (altura: 8px por slot de 30 min en desktop, 6px en mobile)
  if (viewType === 'week') {
    const WEEK_SLOT_HEIGHT = 8; // 8px per 30-minute slot on desktop
    const MINUTES_PER_SLOT = 30;

    return (
      <>
        {applicableBlocks.map((block, index) => {
          const [startHours, startMinutes] = block.startTime.split(':').map(Number);
          const [endHours, endMinutes] = block.endTime.split(':').map(Number);

          const startTotal = startHours * 60 + startMinutes;
          const endTotal = endHours * 60 + endMinutes;

          // Usar porcentaje basado en 24 horas (WeekView muestra el día completo)
          const topPercent = (startTotal / (24 * 60)) * 100;
          const durationMinutes = endTotal - startTotal;
          const heightPercent = (durationMinutes / (24 * 60)) * 100;

          return (
            <div
              key={`${block.id}-${index}`}
              className="absolute inset-x-0 bg-slate-200 bg-opacity-40 border-l-2 border-slate-300 pointer-events-none z-20"
              style={{
                top: `${topPercent}%`,
                height: `${heightPercent}%`,
                minHeight: '8px'
              }}
              title={`Bloqueado: ${block.startTime} - ${block.endTime}`}
            />
          );
        })}
      </>
    );
  }

  return null;
};
