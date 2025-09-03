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
  
  // ✅ CORRECCIÓN DEFINITIVA - Sin conversiones automáticas de JavaScript
  private static createLocalDateTime(date: Date, time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    
    console.log('🔧 Creating precise datetime:', {
      originalDate: date.toISOString(),
      selectedTime: time,
      hours,
      minutes,
      dateDay: date.getDate(),
      dateMonth: date.getMonth() + 1,
      dateYear: date.getFullYear()
    });
    
    // ✅ CONSTRUIR MANUALMENTE SIN QUE JAVASCRIPT HAGA CONVERSIONES
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hoursStr = String(hours).padStart(2, '0');
    const minutesStr = String(minutes).padStart(2, '0');
    
    // ✅ FORMATO ISO SIMPLE - SIN TIMEZONE para evitar conversiones
    const isoDateTime = `${year}-${month}-${day}T${hoursStr}:${minutesStr}:00`;
    
    console.log('🔧 Final appointment date:', {
      isoDateTime,
      shouldShowInCalendar: `${hoursStr}:${minutesStr}`,
      shouldSaveInDB: `${year}-${month}-${day} ${hoursStr}:${minutesStr}:00`
    });
    
    console.log('✅ Generated simple ISO (no timezone conversion):', isoDateTime);
    
    return isoDateTime;
  }

  // ✅ ACTUALIZADO - Convertir de formulario del calendario a request del backend
  static fromCalendarFormToBackendRequest(form: NewAppointmentForm): CreateAppointmentRequest {
    if (!form.date) {
      throw new Error('La fecha es obligatoria');
    }
    
    console.log('🔍 Processing appointment form:', {
      originalDate: form.date.toISOString(),
      originalDateISO: form.date.toISOString(),
      selectedTime: form.time,
      dateDay: form.date.getDate(),
      dateMonth: form.date.getMonth() + 1,
      dateYear: form.date.getFullYear()
    });
    
    // ✅ USAR MÉTODO CORREGIDO
    const appointmentDateTime = this.createLocalDateTime(form.date, form.time);
    
    console.log('📤 Final appointment datetime for backend:', appointmentDateTime);
    
    // Crear request con campos correctos según tipo de paciente
    const request: CreateAppointmentRequest = {
      title: form.service,
      description: form.description || undefined,
      appointmentDate: appointmentDateTime,
      duration: form.duration,
      type: 'consultation',
      notes: form.description || undefined
    };

    // Si es paciente registrado
    if (form.patientId) {
      request.patientId = form.patientId;
      console.log('🔍 Creating appointment for registered patient:', form.patientId);
    }
    // Si es paciente invitado
    else if (form.guestName) {
      request.guestName = form.guestName;
      request.guestEmail = form.guestEmail;
      request.guestPhone = form.guestPhone;
      request.guestRut = form.guestRut;
      console.log('🔍 Creating appointment for guest:', {
        guestName: form.guestName,
        guestEmail: form.guestEmail,
        guestPhone: form.guestPhone,
        guestRut: form.guestRut
      });
    }
    // Fallback para compatibilidad (si solo viene el nombre)
    else if (form.patient) {
      request.guestName = form.patient;
      console.log('🔍 Creating appointment with fallback guest name:', form.patient);
    }

    console.log('📤 Complete backend request:', request);
    return request;
  }
  
  // ✅ MÉTODO CORREGIDO - Convertir de respuesta del backend a formato de calendario
  static fromBackendToCalendarData(appointments: AppointmentResponse[]): AppointmentsCalendarData {
    const calendarData: AppointmentsCalendarData = {};
    
    appointments.forEach(apt => {
      // ✅ PARSEAR FECHA RESPETANDO LA ZONA HORARIA
      const date = new Date(apt.appointmentDate);
      
      console.log('🔍 Processing backend appointment:', {
        id: apt.id,
        backendDate: apt.appointmentDate,
        parsedDate: date.toISOString(),
        localDate: date.toLocaleDateString('es-CL'),
        localTime: date.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
      });
      
      const dateKey = this.formatDateKey(date);
      const endDate = new Date(date.getTime() + (apt.duration * 60000));
      
      // Obtener nombre del paciente correctamente
      const patientName = this.getPatientName(apt);
      const patientEmail = this.getPatientEmail(apt);
      const patientPhone = this.getPatientPhone(apt);
      
      const calendarAppointment: CalendarAppointment = {
        id: apt.id.toString(),
        time: this.formatTime(date),
        duration: apt.duration as number,
        patient: patientName,
        service: apt.title,
        status: this.mapStatus(apt.status),
        type: apt.type,
        notes: apt.notes || undefined,
        email: patientEmail,
        phone: patientPhone,
        
        // Propiedades adicionales para compatibilidad
        title: `${patientName} - ${apt.title}`,
        start: date,
        end: endDate,
        allDay: false,
        meta: apt as unknown as Record<string, unknown>
      };
      
      if (!calendarData[dateKey]) {
        calendarData[dateKey] = [];
      }
      
      calendarData[dateKey].push(calendarAppointment);
      
      console.log('✅ Added appointment to calendar:', {
        dateKey,
        time: calendarAppointment.time,
        patient: calendarAppointment.patient,
        service: calendarAppointment.service
      });
    });
    
    console.log('📋 Final calendar data:', {
      totalDates: Object.keys(calendarData).length,
      dates: Object.keys(calendarData),
      totalAppointments: Object.values(calendarData).reduce((total, dayAppts) => total + dayAppts.length, 0)
    });
    
    return calendarData;
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
      const patientName = this.getPatientName(apt);
      
      return {
        id: apt.id.toString(),
        title: `${patientName} - ${apt.title}`,
        start: startDate,
        end: endDate,
        allDay: false,
        meta: apt as unknown as Record<string, unknown>,
        // Propiedades adicionales para compatibilidad
        time: this.formatTime(startDate),
        duration: apt.duration,
        patient: patientName,
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
  
  // Obtener nombre del paciente con prioridad correcta
  private static getPatientName(apt: AppointmentResponse): string {
    console.log('🔍 Getting patient name from appointment:', {
      patientName: apt.patientName,
      patientLastName: apt.patientLastName,
      guestName: apt.guestName
    });

    // Prioridad 1: Paciente registrado (nombres + apellidos)
    if (apt.patientName && apt.patientLastName) {
      const fullName = `${apt.patientName} ${apt.patientLastName}`;
      console.log('✅ Using registered patient full name:', fullName);
      return fullName;
    }
    
    // Prioridad 2: Solo nombre del paciente registrado
    if (apt.patientName) {
      console.log('✅ Using registered patient name only:', apt.patientName);
      return apt.patientName;
    }
    
    // Prioridad 3: Paciente invitado
    if (apt.guestName) {
      console.log('✅ Using guest name:', apt.guestName);
      return apt.guestName;
    }
    
    // Fallback
    const fallback = 'Paciente sin nombre';
    console.log('⚠️ Using fallback name:', fallback);
    return fallback;
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