// src/core/entities/appointment.entity.ts
import { AppointmentStatus, AppointmentType } from '@/infrastructure/interfaces/appointment.response';

export interface Appointment {
  id: number;
  title: string;
  description?: string;
  appointmentDate: Date;
  duration: number;
  status: AppointmentStatus;
  type: AppointmentType;
  notes?: string;
  cancellationReason?: string;
  confirmedAt?: Date;
  reminderSent: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Información del paciente
  patient: {
    id?: number;
    name: string;
    lastName?: string;
    email?: string;
    phone?: string;
    rut?: string;
    isGuest: boolean;
  };
  
  // Información del doctor
  doctor: {
    name: string;
    lastName: string;
  };
}

export interface CreateAppointment {
  patientId?: number;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  guestRut?: string;
  title: string;
  description?: string;
  appointmentDate: Date;
  duration?: number;
  type?: AppointmentType;
  notes?: string;
}

export interface UpdateAppointment {
  title?: string;
  description?: string;
  appointmentDate?: Date;
  duration?: number;
  type?: AppointmentType;
  notes?: string;
  status?: AppointmentStatus;
  cancellationReason?: string;
}