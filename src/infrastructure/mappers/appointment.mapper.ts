import type { Appointment } from '@/presentation/pages/calendar/types/calendar';

export interface AppointmentDTO {
  id: string | number;
  title?: string;
  start: string | Date; // ISO string o Date
  end: string | Date;   // ISO string o Date
  allDay?: boolean;
  [k: string]: unknown;
}

function toDate(value: string | Date): Date {
  if (value instanceof Date) return value;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    // Evitar fallos: si llega algo inválido, usa ahora mismo
    return new Date();
  }
  return d;
}

export function mapAppointment(dto: AppointmentDTO): Appointment {
  return {
    id: String(dto.id),
    title: dto.title ?? '',
    start: toDate(dto.start),
    end: toDate(dto.end),
    allDay: dto.allDay ?? false,
    meta: dto,
  };
}

export function mapAppointments(dtos: AppointmentDTO[] | null | undefined): Appointment[] {
  if (!Array.isArray(dtos)) return [];
  return dtos.map(mapAppointment);
}
