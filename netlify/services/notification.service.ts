// netlify/services/notification.service.ts
import { EmailService } from './email.service';
import { EmailTemplatesService, AppointmentEmailData } from './email-templates.service';
import { TokenService } from './token.service';
import { ICSService } from './ics.service';
import { envs } from '../config/envs';

export interface NotificationData {
  appointmentId: number;
  patientName: string;
  patientEmail: string;
  doctorName: string;
  doctorEmail?: string;
  appointmentDate: Date;
  service: string;
  duration: number;
  notes?: string;
  confirmationToken?: string;
  location?: string;
}

export class NotificationService {
  private emailService: EmailService;

  constructor() {
    this.emailService = new EmailService({
      mailerHost: envs.MAILER_HOST,
      mailerPort: envs.MAILER_PORT,
      mailerUser: envs.MAILER_USER,
      senderEmailPassword: envs.MAILER_SECRET_KEY,
      postToProvider: envs.SEND_EMAIL,
    });
  }

  // Enviar confirmación de cita creada
  async sendAppointmentConfirmation(data: NotificationData): Promise<boolean> {
    try {
      console.log('📧 [NotificationService] Starting to send appointment confirmation...', {
        patientEmail: data.patientEmail,
        service: data.service,
        appointmentDate: data.appointmentDate,
        location: data.location
      });

      const emailData: AppointmentEmailData = {
        patientName: data.patientName,
        patientEmail: data.patientEmail,
        doctorName: data.doctorName,
        appointmentDate: data.appointmentDate.toISOString().split('T')[0],
        appointmentTime: data.appointmentDate.toTimeString().split(' ')[0].substring(0, 5),
        service: data.service,
        duration: data.duration,
        notes: data.notes,
        location: data.location,
        type: 'confirmation'
      };

      const htmlContent = EmailTemplatesService.getConfirmationEmailTemplate(emailData);
      console.log('✅ [NotificationService] HTML template generated');

      // Generar archivo .ics para agregar al calendario
      try {
        const endDate = new Date(data.appointmentDate.getTime() + data.duration * 60000);
        console.log('📅 [NotificationService] Generating .ics file...', {
          startDate: data.appointmentDate.toISOString(),
          endDate: endDate.toISOString(),
          location: data.location
        });

        const icsBuffer = ICSService.generateICSBuffer({
          summary: `${data.service} - ${data.doctorName}`,
          description: data.notes || `Cita médica con ${data.doctorName}`,
          location: data.location || '',
          startDate: data.appointmentDate,
          endDate: endDate,
          organizerName: data.doctorName,
          organizerEmail: data.doctorEmail || envs.MAILER_EMAIL,
          attendeeName: data.patientName,
          attendeeEmail: data.patientEmail
        });

        console.log('✅ [NotificationService] .ics buffer generated, size:', icsBuffer.length, 'bytes');

        const icsFilename = ICSService.generateFilename(data.service, data.appointmentDate);
        console.log('✅ [NotificationService] .ics filename:', icsFilename);

        console.log('📤 [NotificationService] Sending email with .ics attachment...');
        const emailSent = await this.emailService.sendEmail({
          from: envs.MAILER_EMAIL,
          to: data.patientEmail,
          subject: '✅ Cita Confirmada - Sistema de Citas',
          htmlBody: htmlContent,
          attachments: [
            {
              filename: icsFilename,
              content: icsBuffer,
              contentType: 'text/calendar; method=REQUEST; name="' + icsFilename + '"'
            }
          ]
        });

        console.log(`✅ [NotificationService] Confirmation email with .ics sent to ${data.patientEmail}:`, emailSent);
        return emailSent;
      } catch (icsError) {
        console.error('❌ [NotificationService] Error generating .ics file:', icsError);
        // Si falla el .ics, intentar enviar el email sin archivo adjunto
        console.log('⚠️ [NotificationService] Attempting to send email without .ics attachment...');
        const emailSent = await this.emailService.sendEmail({
          from: envs.MAILER_EMAIL,
          to: data.patientEmail,
          subject: '✅ Cita Confirmada - Sistema de Citas',
          htmlBody: htmlContent
        });
        console.log(`📧 [NotificationService] Confirmation email sent (without .ics) to ${data.patientEmail}:`, emailSent);
        return emailSent;
      }
    } catch (error) {
      console.error('❌ [NotificationService] Error sending confirmation email:', error);
      return false;
    }
  }

  // Enviar recordatorio de cita
  async sendAppointmentReminder(data: NotificationData): Promise<boolean> {
    try {
      if (!data.confirmationToken) {
        console.error('❌ No confirmation token provided for reminder');
        return false;
      }

      const emailData: AppointmentEmailData = {
        patientName: data.patientName,
        patientEmail: data.patientEmail,
        doctorName: data.doctorName,
        appointmentDate: data.appointmentDate.toISOString().split('T')[0],
        appointmentTime: data.appointmentDate.toTimeString().split(' ')[0].substring(0, 5),
        service: data.service,
        duration: data.duration,
        notes: data.notes,
        location: data.location,
        confirmationToken: data.confirmationToken,
        type: 'reminder'
      };

      const htmlContent = EmailTemplatesService.getReminderEmailTemplate(emailData);

      const emailSent = await this.emailService.sendEmail({
        from: envs.MAILER_EMAIL,
        to: data.patientEmail,
        subject: '🔔 Recordatorio de Cita - Mañana tienes una cita',
        htmlBody: htmlContent
      });

      console.log(`📧 Reminder email sent to ${data.patientEmail}:`, emailSent);
      return emailSent;
    } catch (error) {
      console.error('❌ Error sending reminder email:', error);
      return false;
    }
  }

  // Enviar confirmación de cita al doctor
  async sendAppointmentConfirmationToDoctor(data: NotificationData & { doctorEmail: string }): Promise<boolean> {
    try {
      const emailData: AppointmentEmailData = {
        patientName: data.patientName,
        patientEmail: data.patientEmail,
        doctorName: data.doctorName,
        appointmentDate: data.appointmentDate.toISOString().split('T')[0],
        appointmentTime: data.appointmentDate.toTimeString().split(' ')[0].substring(0, 5),
        service: data.service,
        duration: data.duration,
        notes: data.notes,
        location: data.location,
        type: 'confirmation_doctor'
      };

      const htmlContent = EmailTemplatesService.getDoctorConfirmationEmailTemplate(emailData);

      const emailSent = await this.emailService.sendEmail({
        from: envs.MAILER_EMAIL,
        to: data.doctorEmail,
        subject: '📅 Nueva Cita Agendada - Sistema de Citas',
        htmlBody: htmlContent
      });

      console.log(`📧 Doctor confirmation email sent to ${data.doctorEmail}:`, emailSent);
      return emailSent;
    } catch (error) {
      console.error('❌ Error sending doctor confirmation email:', error);
      return false;
    }
  }

  // Validar datos antes del envío
  private validateNotificationData(data: NotificationData): boolean {
    const required = [
      data.patientName,
      data.patientEmail,
      data.doctorName,
      data.appointmentDate,
      data.service
    ];

    const isValid = required.every(field => field !== undefined && field !== null && field !== '');

    if (!isValid) {
      console.error('❌ Invalid notification data:', data);
    }

    return isValid;
  }

  // Método helper para obtener datos formateados de fecha
  private getFormattedDate(date: Date): { date: string; time: string } {
    return {
      date: date.toISOString().split('T')[0],
      time: date.toTimeString().split(' ')[0].substring(0, 5)
    };
  }
}