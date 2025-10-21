// src/presentation/pages/calendar/types/calendar.ts - ACTUALIZADO
export type AppointmentStatus = 'confirmed' | 'pending' | 'cancelled' | 'no-show' | 'completed';

export interface Appointment {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  meta?: Record<string, unknown>;
  
  time: string;
  duration: number;
  patient: string;
  service: string;
  status: AppointmentStatus;
  type?: 'consultation' | 'treatment' | 'follow-up' | 'emergency';
  notes?: string;
  email?: string;
  phone?: string;
  patientId?: number;
  patientName?: string;
  guestName?: string;
}

export interface CalendarAppointment {
  id: string;
  time: string;
  duration: number;
  patient: string;
  service: string;
  status: AppointmentStatus;
  type?: 'consultation' | 'treatment' | 'follow-up' | 'emergency';
  notes?: string;
  email?: string;
  phone?: string;
  
  // Campos adicionales para el menú contextual
  patientId?: number;
  patientName?: string;
  guestName?: string;
  
  // Para compatibilidad con Appointment
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  meta?: Record<string, unknown>;
}

export interface AppointmentsData {
  [key: string]: CalendarAppointment[];
}

export interface AppointmentsCalendarData {
  [key: string]: CalendarAppointment[];
}

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
}

export interface NewAppointmentForm {
  patient: string;
  service: string;
  description: string;
  time: string;
  duration: number;
  date: Date | null;
  
  patientId?: number;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  guestRut?: string;
}

export type ViewMode = 'month' | 'week' | 'day';

export interface Service {
  name: string;
  duration: number;
  price: string;
}

export interface CalendarRange {
  start: Date;
  end: Date;
}

export interface DayCell {
  date: Date;
  inCurrentMonth: boolean;
  appointments: Appointment[];
}

export interface CalendarState {
  view: ViewMode;
  cursor: Date;
}

// Utils de fecha
export function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function endOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}

export function endOfMonth(d: Date): Date {
  return endOfDay(new Date(d.getFullYear(), d.getMonth() + 1, 0));
}

export function startOfWeek(d: Date, weekStartsOn: 0 | 1 = 1): Date {
  const date = startOfDay(d);
  const day = date.getDay();
  const diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
  date.setDate(date.getDate() - diff);
  return date;
}

export function addDays(d: Date, days: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

export function addMonths(d: Date, months: number): Date {
  const x = new Date(d);
  x.setMonth(x.getMonth() + months);
  return x;
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export function clampToDay(date: Date): string {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}