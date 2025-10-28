// src/presentation/pages/calendar/utils/calendar.ts - TIPOS CORREGIDOS
import { CalendarDay, AppointmentsCalendarData, CalendarAppointment } from '../types/calendar';
import { monthNames } from '../constants/calendar';

export const formatDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getDaysInMonth = (date: Date): CalendarDay[] => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = (firstDay.getDay() + 6) % 7;

  const days: CalendarDay[] = [];

  // Días del mes anterior
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const prevDate = new Date(year, month, -i);
    days.push({ date: prevDate, isCurrentMonth: false });
  }

  // Días del mes actual
  for (let day = 1; day <= daysInMonth; day++) {
    days.push({ date: new Date(year, month, day), isCurrentMonth: true });
  }

  // Días del siguiente mes
  const remainingCells = 42 - days.length;
  for (let day = 1; day <= remainingCells; day++) {
    days.push({ date: new Date(year, month + 1, day), isCurrentMonth: false });
  }

  return days;
};

export const getWeekDays = (date: Date): Date[] => {
  const startOfWeek = new Date(date);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - ((day + 6) % 7);
  startOfWeek.setDate(diff);

  const weekDays: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    weekDays.push(day);
  }
  return weekDays;
};

export const getWeekRange = (date: Date): string => {
  const weekDays = getWeekDays(date);
  const start = weekDays[0];
  const end = weekDays[6];

  if (start.getMonth() === end.getMonth()) {
    return `${start.getDate()} - ${end.getDate()} ${monthNames[start.getMonth()]} ${start.getFullYear()}`;
  } else {
    return `${start.getDate()} ${monthNames[start.getMonth()]} - ${end.getDate()} ${monthNames[end.getMonth()]} ${start.getFullYear()}`;
  }
};

export const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

export const isTimeSlotAvailable = (
  appointments: AppointmentsCalendarData,
  date: Date,
  time: string,
  duration: number = 60
): boolean => {
  const dateKey = formatDateKey(date);
  const dayAppointments = appointments[dateKey] || [];

  // Convertir tiempo inicial a minutos desde las 00:00
  const [hours, minutes] = time.split(':').map(Number);
  const startMinutes = hours * 60 + minutes;
  const endMinutes = startMinutes + duration;

  // Verificar si hay conflictos con otras citas
  const hasConflict = dayAppointments.some((appointment: CalendarAppointment) => {
    const [appHours, appMinutes] = appointment.time.split(':').map(Number);
    const appStart = appHours * 60 + appMinutes;
    const appEnd = appStart + appointment.duration;

    // Hay conflicto si los tiempos se solapan
    const conflicts = startMinutes < appEnd && endMinutes > appStart;

    if (conflicts) {
      console.log(`⚠️ CONFLICTO DETECTADO:`, {
        newAppointment: {
          time,
          startMinutes,
          endMinutes,
          duration,
          timeRange: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}-${String(Math.floor(endMinutes / 60)).padStart(2, '0')}:${String(endMinutes % 60).padStart(2, '0')}`
        },
        existingAppointment: {
          time: appointment.time,
          startMinutes: appStart,
          endMinutes: appEnd,
          duration: appointment.duration,
          timeRange: `${String(appHours).padStart(2, '0')}:${String(appMinutes).padStart(2, '0')}-${String(Math.floor(appEnd / 60)).padStart(2, '0')}:${String(appEnd % 60).padStart(2, '0')}`
        }
      });
    }

    return conflicts;
  });

  return !hasConflict;
};

export const hasOverlap = (
  appointments: AppointmentsCalendarData,
  date: Date,
  time: string,
  duration: number = 60
): boolean => {
  const dateKey = formatDateKey(date);
  const dayAppointments = appointments[dateKey] || [];

  // Convertir tiempo inicial a minutos desde las 00:00
  const [hours, minutes] = time.split(':').map(Number);
  const startMinutes = hours * 60 + minutes;
  const endMinutes = startMinutes + duration;

  // Verificar si hay conflictos con otras citas
  const hasConflict = dayAppointments.some((appointment: CalendarAppointment) => {
    const [appHours, appMinutes] = appointment.time.split(':').map(Number);
    const appStart = appHours * 60 + appMinutes;
    const appEnd = appStart + appointment.duration;

    // Hay conflicto si los tiempos se solapan
    return startMinutes < appEnd && endMinutes > appStart;
  });

  return hasConflict;
};

export const getAppointmentsForDate = (
  appointments: AppointmentsCalendarData,
  date: Date
): CalendarAppointment[] => {
  const dateKey = formatDateKey(date);
  return appointments[dateKey] || [];
};