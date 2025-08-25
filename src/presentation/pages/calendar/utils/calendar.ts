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
  time: string
): boolean => {
  const dateKey = formatDateKey(date);
  const dayAppointments = appointments[dateKey] || [];
  const conflictingAppointments = dayAppointments.filter((appointment: CalendarAppointment) => appointment.time === time);
  return conflictingAppointments.length < 2;
};

export const hasOverlap = (
  appointments: AppointmentsCalendarData,
  date: Date,
  time: string
): boolean => {
  const dateKey = formatDateKey(date);
  const dayAppointments = appointments[dateKey] || [];
  const conflictingAppointments = dayAppointments.filter((appointment: CalendarAppointment) => appointment.time === time);
  return conflictingAppointments.length >= 1;
};

export const getAppointmentsForDate = (
  appointments: AppointmentsCalendarData,
  date: Date
): CalendarAppointment[] => {
  const dateKey = formatDateKey(date);
  return appointments[dateKey] || [];
};