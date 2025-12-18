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

    // Construir el archivo .ics
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//ArmoniClick//Appointment System//ES',
      'CALSCALE:GREGORIAN',
      'METHOD:REQUEST',
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART:${formatDate(startDate)}`,
      `DTEND:${formatDate(endDate)}`,
      `SUMMARY:${this.escapeText(summary)}`,
      description ? `DESCRIPTION:${this.escapeText(description)}` : '',
      location ? `LOCATION:${this.escapeText(location)}` : '',
      organizerEmail ? `ORGANIZER;CN=${this.escapeText(organizerName)}:mailto:${organizerEmail}` : '',
      attendeeEmail ? `ATTENDEE;CN=${this.escapeText(attendeeName)};RSVP=TRUE:mailto:${attendeeEmail}` : '',
      'STATUS:CONFIRMED',
      'SEQUENCE:0',
      'BEGIN:VALARM',
      'TRIGGER:-PT24H', // Recordatorio 24 horas antes
      'ACTION:DISPLAY',
      `DESCRIPTION:Recordatorio: ${this.escapeText(summary)}`,
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ].filter(line => line !== '').join('\r\n');

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
    return Buffer.from(icsContent, 'utf-8');
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
