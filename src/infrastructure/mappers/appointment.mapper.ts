// src/infrastructure/mappers/appointment.mapper.ts - ACTUALIZADO
import { AppointmentResponse, CreateAppointmentRequest } from '@/infrastructure/interfaces/appointment.response';
import { 
  Appointment, 
  CalendarAppointment, 
  AppointmentsCalendarData, 
  ViewMode,
  NewAppointmentForm,
  AppointmentStatus
} from '@/presentation/pages/calendar/types/calendar';

export class AppointmentMapper {
  
  // Convertir de respuesta del backend a formato de calendario
  static fromBackendToCalendarData(appointments: AppointmentResponse[]): AppointmentsCalendarData {
    const calendarData: AppointmentsCalendarData = {};
    
    appointments.forEach(apt => {
      const date = new Date(apt.appointmentDate);
      const dateKey = this.formatDateKey(date);
      const endDate = new Date(date.getTime() + (apt.duration * 60000));
      
      const calendarAppointment: CalendarAppointment = {
        id: apt.id.toString(),
        time: this.formatTime(date),
        duration: apt.duration as number,
        patient: this.getPatientName(apt),
        service: apt.title,
        status: this.mapStatus(apt.status),
        type: apt.type,
        notes: apt.notes || undefined,
        email: this.getPatientEmail(apt),
        phone: this.getPatientPhone(apt),
        
        // Propiedades adicionales para compatibilidad
        title: `${this.getPatientName(apt)} - ${apt.title}`,
        start: date,
        end: endDate,
        allDay: false,
        meta: apt as unknown as Record<string, unknown>
      };
      
      if (!calendarData[dateKey]) {
        calendarData[dateKey] = [];
      }
      
      calendarData[dateKey].push(calendarAppointment);
    });
    
    return calendarData;
  }
  
  // ✅ ACTUALIZADO - Convertir de formulario del calendario a request del backend
  static fromCalendarFormToBackendRequest(form: NewAppointmentForm): CreateAppointmentRequest {
    if (!form.date) {
      throw new Error('La fecha es obligatoria');
    }
    
    // Combinar fecha y hora
    const [hours, minutes] = form.time.split(':').map(Number);
    const appointmentDateTime = new Date(form.date);
    appointmentDateTime.setHours(hours, minutes, 0, 0);
    
    // ✅ NUEVO - Crear request con campos correctos según tipo de paciente
    const request: CreateAppointmentRequest = {
      title: form.service,
      description: form.description || undefined,
      appointmentDate: appointmentDateTime.toISOString(),
      duration: form.duration,
      type: 'consultation',
      notes: form.description || undefined
    };

    // Si es paciente registrado
    if (form.patientId) {
      request.patientId = form.patientId;
    }
    // Si es paciente invitado
    else if (form.guestName) {
      request.guestName = form.guestName;
      request.guestEmail = form.guestEmail;
      request.guestPhone = form.guestPhone;
      request.guestRut = form.guestRut;
    }
    // Fallback para compatibilidad (si solo viene el nombre)
    else if (form.patient) {
      request.guestName = form.patient;
    }

    return request;
  }
  
  // Obtener rango de fechas para vista del calendario
  static getDateRangeForCalendarView(currentDate: Date, viewMode: ViewMode) {
    const start = new Date(currentDate);
    const end = new Date(currentDate);
    
    start.setHours(0, 0, 0, 0);
    
    switch (viewMode) {
      case 'month':
        start.setDate(1);
        end.setMonth(end.getMonth() + 1, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'week':
        const dayOfWeek = (start.getDay() + 6) % 7;
        start.setDate(start.getDate() - dayOfWeek);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        break;
      case 'day':
        end.setHours(23, 59, 59, 999);
        break;
    }
    
    const result = {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    };
    
    console.log('📅 Date range for calendar view:', {
      viewMode,
      currentDate: currentDate.toISOString(),
      startDate: result.startDate,
      endDate: result.endDate,
      start: start.toISOString(),
      end: end.toISOString()
    });
    
    return result;
  }
  
  // Convertir AppointmentResponse a Appointment (para Big Calendar)
  static fromResponseToCalendarEvents(appointments: AppointmentResponse[]): Appointment[] {
    return appointments.map(apt => {
      const startDate = new Date(apt.appointmentDate);
      const endDate = new Date(startDate.getTime() + (apt.duration * 60000));
      
      return {
        id: apt.id.toString(),
        title: `${this.getPatientName(apt)} - ${apt.title}`,
        start: startDate,
        end: endDate,
        allDay: false,
        meta: apt as unknown as Record<string, unknown>,
        // Propiedades adicionales para compatibilidad
        time: this.formatTime(startDate),
        duration: apt.duration,
        patient: this.getPatientName(apt),
        service: apt.title,
        status: this.mapStatus(apt.status),
        type: apt.type,
        notes: apt.notes || undefined,
        email: this.getPatientEmail(apt),
        phone: this.getPatientPhone(apt)
      };
    });
  }
  
  // Utilidades privadas
  private static formatDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  private static formatTime(date: Date): string {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }
  
  // ✅ MEJORADO - Obtener nombre del paciente con mejor lógica
  private static getPatientName(apt: AppointmentResponse): string {
    // Prioridad: Paciente registrado > Invitado > Fallback
    if (apt.patientName && apt.patientLastName) {
      return `${apt.patientName} ${apt.patientLastName}`;
    }
    if (apt.patientName) {
      return apt.patientName;
    }
    if (apt.guestName) {
      return apt.guestName;
    }
    return 'Paciente sin nombre';
  }
  
  private static getPatientEmail(apt: AppointmentResponse): string | undefined {
    return apt.patientEmail || apt.guestEmail || undefined;
  }
  
  private static getPatientPhone(apt: AppointmentResponse): string | undefined {
    return apt.patientPhone || apt.guestPhone || undefined;
  }
  
  // Función para mapear status
  private static mapStatus(status: any): AppointmentStatus {
    switch (status) {
      case 'completed':
      case 'confirmed':
      case 'pending':
      case 'cancelled':
      case 'no-show':
        return status;
      default:
        return 'pending';
    }
  }
}