// netlify/services/notification.service.ts
import { EmailService } from './email.service';
import { EmailTemplatesService, AppointmentEmailData } from './email-templates.service';
import { TokenService } from './token.service';
import { envs } from '../config/envs';

export interface NotificationData {
  appointmentId: number;
  patientName: string;
  patientEmail: string;
  doctorName: string;
  appointmentDate: Date;
  service: string;
  duration: number;
  notes?: string;
  confirmationToken?: string;
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
      const emailData: AppointmentEmailData = {
        patientName: data.patientName,
        patientEmail: data.patientEmail,
        doctorName: data.doctorName,
        appointmentDate: data.appointmentDate.toISOString().split('T')[0],
        appointmentTime: data.appointmentDate.toTimeString().split(' ')[0].substring(0, 5),
        service: data.service,
        duration: data.duration,
        notes: data.notes,
        type: 'confirmation'
      };

      const htmlContent = EmailTemplatesService.getConfirmationEmailTemplate(emailData);

      const emailSent = await this.emailService.sendEmail({
        from: envs.MAILER_EMAIL,
        to: data.patientEmail,
        subject: '✅ Cita Confirmada - Sistema de Citas',
        htmlBody: htmlContent
      });

      console.log(`📧 Confirmation email sent to ${data.patientEmail}:`, emailSent);
      return emailSent;
    } catch (error) {
      console.error('❌ Error sending confirmation email:', error);
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