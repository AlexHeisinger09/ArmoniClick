// netlify/services/ics.service.ts
// Servicio para generar archivos .ics (iCalendar) para eventos de Google Calendar

export interface ICSEventData {
  summary: string; // Título del evento
  description?: string; // Descripción
  location?: string; // Ubicación/dirección
  startDate: Date; // Fecha y hora de inicio
  endDate: Date; // Fecha y hora de fin
  organizerName?: string; // Nombre del organizador
  organizerEmail?: string; // Email del organizador
  attendeeName?: string; // Nombre del asistente
  attendeeEmail?: string; // Email del asistente
}

export class ICSService {
  /**
   * Genera un archivo .ics (iCalendar) compatible con Google Calendar
   */
  static generateICS(eventData: ICSEventData): string {
    console.log('📅 [ICSService] Starting to generate .ics file...', eventData);

    const {
      summary,
      description = '',
      location = '',
      startDate,
      endDate,
      organizerName = '',
      organizerEmail = '',
      attendeeName = '',
      attendeeEmail = ''
    } = eventData;

    // Formatear fechas en formato iCalendar (YYYYMMDDTHHMMSSZ)
    const formatDate = (date: Date): string => {
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');
      const day = String(date.getUTCDate()).padStart(2, '0');
      const hours = String(date.getUTCHours()).padStart(2, '0');
      const minutes = String(date.getUTCMinutes()).padStart(2, '0');
      const seconds = String(date.getUTCSeconds()).padStart(2, '0');
      return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
    };

    // Generar UID único para el evento
    const uid = `${Date.now()}-${Math.random().toString(36).substring(7)}@armoniclick.com`;

    // Timestamp de creación
    const now = new Date();
    const dtstamp = formatDate(now);

    // Construir el archivo .ics con zona horaria
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//ArmoniClick//Appointment System//ES',
      'CALSCALE:GREGORIAN',
      'METHOD:REQUEST',
      // Agregar zona horaria de Chile para mejor compatibilidad con Google Calendar
      'BEGIN:VTIMEZONE',
      'TZID:America/Santiago',
      'BEGIN:STANDARD',
      'DTSTART:19700404T000000',
      'TZOFFSETFROM:-0300',
      'TZOFFSETTO:-0400',
      'RRULE:FREQ=YEARLY;BYMONTH=4;BYDAY=1SU',
      'END:STANDARD',
      'BEGIN:DAYLIGHT',
      'DTSTART:19700906T000000',
      'TZOFFSETFROM:-0400',
      'TZOFFSETTO:-0300',
      'RRULE:FREQ=YEARLY;BYMONTH=9;BYDAY=1SU',
      'END:DAYLIGHT',
      'END:VTIMEZONE',
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART:${formatDate(startDate)}`,
      `DTEND:${formatDate(endDate)}`,
      `SUMMARY:${this.escapeText(summary)}`
    ];

    // Agregar campos opcionales solo si tienen contenido
    if (description && description.trim()) {
      lines.push(`DESCRIPTION:${this.escapeText(description)}`);
    }

    if (location && location.trim()) {
      lines.push(`LOCATION:${this.escapeText(location)}`);
    }

    if (organizerEmail && organizerEmail.trim()) {
      const orgName = organizerName && organizerName.trim() ? this.escapeText(organizerName) : 'Organizador';
      lines.push(`ORGANIZER;CN="${orgName}":mailto:${organizerEmail}`);
    }

    if (attendeeEmail && attendeeEmail.trim()) {
      const attName = attendeeName && attendeeName.trim() ? this.escapeText(attendeeName) : 'Asistente';
      lines.push(`ATTENDEE;CN="${attName}";RSVP=TRUE;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION:mailto:${attendeeEmail}`);
    }

    // Agregar metadatos del evento
    lines.push('STATUS:CONFIRMED');
    lines.push('SEQUENCE:0');
    lines.push('TRANSP:OPAQUE'); // Marcar como ocupado en el calendario

    // Agregar recordatorio
    lines.push('BEGIN:VALARM');
    lines.push('TRIGGER:-PT24H');
    lines.push('ACTION:DISPLAY');
    lines.push(`DESCRIPTION:Recordatorio: ${this.escapeText(summary)}`);
    lines.push('END:VALARM');

    // Cerrar evento y calendario
    lines.push('END:VEVENT');
    lines.push('END:VCALENDAR');

    const icsContent = lines.join('\r\n');

    console.log('✅ [ICSService] .ics content generated successfully, length:', icsContent.length);
    return icsContent;
  }

  /**
   * Escapar caracteres especiales en el texto del .ics
   */
  private static escapeText(text: string): string {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n');
  }

  /**
   * Generar Buffer del archivo .ics para adjuntar en emails
   */
  static generateICSBuffer(eventData: ICSEventData): Buffer {
    const icsContent = this.generateICS(eventData);
    const buffer = Buffer.from(icsContent, 'utf-8');
    console.log('📦 [ICSService] Buffer created, size:', buffer.length, 'bytes');
    console.log('📄 [ICSService] ICS Content preview (first 500 chars):', icsContent.substring(0, 500));
    return buffer;
  }

  /**
   * Generar el nombre del archivo .ics
   */
  static generateFilename(summary: string, startDate: Date): string {
    const dateStr = startDate.toISOString().split('T')[0];
    const sanitizedSummary = summary
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 30);
    return `cita-${sanitizedSummary}-${dateStr}.ics`;
  }
}
