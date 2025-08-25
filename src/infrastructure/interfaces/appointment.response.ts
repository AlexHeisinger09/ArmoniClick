// src/infrastructure/interfaces/appointment.response.ts
export interface AppointmentResponse {
  id: number;
  title: string;
  description?: string;
  appointmentDate: string;
  duration: number;
  status: AppointmentStatus;
  type: AppointmentType;
  notes?: string;
  cancellationReason?: string;
  confirmedAt?: string;
  reminderSent: boolean;
  createdAt: string;
  updatedAt: string;
  
  // Datos del paciente
  patientId?: number;
  patientName?: string;
  patientLastName?: string;
  patientEmail?: string;
  patientPhone?: string;
  patientRut?: string;
  
  // Datos del invitado
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  guestRut?: string;
  
  // Datos del doctor
  doctorName?: string;
  doctorLastName?: string;
}

export interface CreateAppointmentRequest {
  patientId?: number;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  guestRut?: string;
  title: string;
  description?: string;
  appointmentDate: string;
  duration?: number;
  type?: AppointmentType;
  notes?: string;
}

export interface UpdateAppointmentRequest {
  title?: string;
  description?: string;
  appointmentDate?: string;
  duration?: number;
  type?: AppointmentType;
  notes?: string;
  status?: AppointmentStatus;
  cancellationReason?: string;
}

export interface AppointmentAvailabilityResponse {
  available: boolean;
  date: string;
  duration: number;
  conflictingAppointments: {
    id: number;
    title: string;
    appointmentDate: string;
    duration: number;
    patientName?: string;
    status: AppointmentStatus;
  }[];
}

export type AppointmentStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'cancelled' 
  | 'no-show' 
  | 'completed';

export type AppointmentType = 
  | 'consultation' 
  | 'treatment' 
  | 'follow-up' 
  | 'emergency';

// Para el calendario
export interface CalendarAppointment {
  id: number;
  time: string;
  duration: 30 | 60;
  patient: string;
  service: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'no-show';
  type?: AppointmentType;
  notes?: string;
  email?: string;
  phone?: string;
}

export interface AppointmentsCalendarData {
  [key: string]: CalendarAppointment[];
}