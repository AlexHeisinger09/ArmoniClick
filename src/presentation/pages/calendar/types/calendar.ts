// Tipos base y utilidades ligeras de fecha

export type CalendarView = 'month';

export interface Appointment {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  meta?: Record<string, unknown>;
}

export interface CalendarRange {
  start: Date; // inclusive
  end: Date;   // inclusive
}

export interface DayCell {
  date: Date;
  inCurrentMonth: boolean;
  appointments: Appointment[];
}

export interface CalendarState {
  view: CalendarView;
  cursor: Date; // punto de referencia (primer día del mes en vista 'month')
}

// ----- Utils pequeñas (sin dependencias) -----

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
  // Por defecto lunes = 1
  const date = startOfDay(d);
  const day = date.getDay(); // 0 = domingo
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
  // YYYY-MM-DD (útil para agrupar por día)
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}
