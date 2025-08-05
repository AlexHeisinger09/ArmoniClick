// types/calendar.ts
export interface Appointment {
  id: number;
  time: string;
  duration: 30 | 60;
  patient: string;
  service: string;
  status: 'confirmed' | 'pending';
}

export interface AppointmentsData {
  [key: string]: Appointment[];
}

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
}

export interface Service {
  name: string;
  duration: 30 | 60;
  price: string;
}

export type ViewMode = 'month' | 'week' | 'day';

export interface NewAppointmentForm {
  patient: string;
  service: string;
  description: string;
  time: string;
  duration: 30 | 60;
  date: Date | null;
}