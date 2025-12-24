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
      console.log('📧 [NotificationService] Starting to send doctor confirmation...', {
        doctorEmail: data.doctorEmail,
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
        type: 'confirmation_doctor'
      };

      const htmlContent = EmailTemplatesService.getDoctorConfirmationEmailTemplate(emailData);
      console.log('✅ [NotificationService] Doctor HTML template generated');

      // Generar archivo .ics para el doctor también
      try {
        const endDate = new Date(data.appointmentDate.getTime() + data.duration * 60000);
        console.log('📅 [NotificationService] Generating .ics file for doctor...', {
          startDate: data.appointmentDate.toISOString(),
          endDate: endDate.toISOString(),
          location: data.location
        });

        const icsBuffer = ICSService.generateICSBuffer({
          summary: `${data.service} - ${data.patientName}`,
          description: data.notes || `Cita con paciente ${data.patientName}`,
          location: data.location || '',
          startDate: data.appointmentDate,
          endDate: endDate,
          organizerName: data.doctorName,
          organizerEmail: data.doctorEmail,
          attendeeName: data.patientName,
          attendeeEmail: data.patientEmail
        });

        console.log('✅ [NotificationService] .ics buffer generated for doctor, size:', icsBuffer.length, 'bytes');

        const icsFilename = ICSService.generateFilename(data.service, data.appointmentDate);
        console.log('✅ [NotificationService] .ics filename:', icsFilename);

        console.log('📤 [NotificationService] Sending email to doctor with .ics attachment...');
        const emailSent = await this.emailService.sendEmail({
          from: envs.MAILER_EMAIL,
          to: data.doctorEmail,
          subject: '📅 Nueva Cita Agendada - Sistema de Citas',
          htmlBody: htmlContent,
          attachments: [
            {
              filename: icsFilename,
              content: icsBuffer,
              contentType: 'text/calendar; method=REQUEST; name="' + icsFilename + '"'
            }
          ]
        });

        console.log(`✅ [NotificationService] Doctor confirmation email with .ics sent to ${data.doctorEmail}:`, emailSent);
        return emailSent;
      } catch (icsError) {
        console.error('❌ [NotificationService] Error generating .ics file for doctor:', icsError);
        // Si falla el .ics, intentar enviar el email sin archivo adjunto
        console.log('⚠️ [NotificationService] Attempting to send email to doctor without .ics attachment...');
        const emailSent = await this.emailService.sendEmail({
          from: envs.MAILER_EMAIL,
          to: data.doctorEmail,
          subject: '📅 Nueva Cita Agendada - Sistema de Citas',
          htmlBody: htmlContent
        });
        console.log(`📧 [NotificationService] Doctor confirmation email sent (without .ics) to ${data.doctorEmail}:`, emailSent);
        return emailSent;
      }
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

  // Notificar al doctor cuando un paciente confirma la cita
  async notifyDoctorAboutConfirmation(data: {
    appointmentId: number;
    patientName: string;
    doctorName: string;
    doctorEmail: string;
    appointmentDate: Date;
    service: string;
    location?: string;
  }): Promise<boolean> {
    try {
      console.log('📧 [NotificationService] Notifying doctor about patient confirmation...', {
        doctorEmail: data.doctorEmail,
        patientName: data.patientName,
        appointmentDate: data.appointmentDate
      });

      const formattedDate = data.appointmentDate.toLocaleDateString('es-CL', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      const formattedTime = data.appointmentDate.toLocaleTimeString('es-CL', {
        hour: '2-digit',
        minute: '2-digit'
      });

      const htmlContent = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Paciente Confirmó Cita</title>
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f5f7fa; margin: 0; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; text-align: center; padding: 35px 20px 30px;">
                    <h1 style="font-size: 28px; font-weight: 700; margin: 0 0 12px 0; color: #ffffff;">✅ Cita Confirmada por Paciente</h1>
                    <p style="font-size: 16px; margin: 0; color: #ffffff; font-weight: 500;">Notificación del Sistema de Citas</p>
                </div>

                <!-- Content -->
                <div style="padding: 40px 30px;">
                    <p style="font-size: 16px; margin-bottom: 20px; color: #0f172a; font-weight: 500;">
                        Hola <strong style="color: #059669;">Dr. ${data.doctorName}</strong>,
                    </p>

                    <p style="font-size: 15px; margin-bottom: 25px; color: #334155;">
                        El paciente <strong>${data.patientName}</strong> ha <strong style="color: #10b981;">confirmado</strong> su cita.
                    </p>

                    <!-- Appointment Card -->
                    <div style="background: #d1fae5; border-left: 4px solid #10b981; padding: 20px; border-radius: 6px; margin-bottom: 25px;">
                        <div style="margin-bottom: 12px;">
                            <strong style="color: #065f46; font-size: 14px;">📅 Fecha:</strong>
                            <p style="margin: 5px 0 0 0; color: #047857; font-size: 15px; font-weight: 600;">${formattedDate}</p>
                        </div>
                        <div style="margin-bottom: 12px;">
                            <strong style="color: #065f46; font-size: 14px;">🕐 Hora:</strong>
                            <p style="margin: 5px 0 0 0; color: #047857; font-size: 15px; font-weight: 600;">${formattedTime}</p>
                        </div>
                        <div style="margin-bottom: 12px;">
                            <strong style="color: #065f46; font-size: 14px;">👤 Paciente:</strong>
                            <p style="margin: 5px 0 0 0; color: #047857; font-size: 15px;">${data.patientName}</p>
                        </div>
                        <div style="margin-bottom: 12px;">
                            <strong style="color: #065f46; font-size: 14px;">💼 Servicio:</strong>
                            <p style="margin: 5px 0 0 0; color: #047857; font-size: 15px;">${data.service}</p>
                        </div>
                        ${data.location ? `
                        <div>
                            <strong style="color: #065f46; font-size: 14px;">📍 Ubicación:</strong>
                            <p style="margin: 5px 0 0 0; color: #047857; font-size: 15px;">${data.location}</p>
                        </div>
                        ` : ''}
                    </div>

                    <p style="font-size: 14px; color: #64748b; margin-top: 25px;">
                        Esta es una notificación automática del sistema.
                    </p>
                </div>

                <!-- Footer -->
                <div style="background: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="font-size: 13px; color: #94a3b8; margin: 0;">© ${new Date().getFullYear()} ArmoniClick. Sistema de Gestión de Citas Médicas.</p>
                </div>
            </div>
        </body>
        </html>
      `;

      const emailSent = await this.emailService.sendEmail({
        from: envs.MAILER_EMAIL,
        to: data.doctorEmail,
        subject: `✅ ${data.patientName} confirmó su cita del ${formattedDate}`,
        htmlBody: htmlContent
      });

      console.log(`✅ [NotificationService] Doctor notification sent to ${data.doctorEmail}:`, emailSent);
      return emailSent;
    } catch (error) {
      console.error('❌ [NotificationService] Error sending doctor notification:', error);
      return false;
    }
  }

  // Notificar al doctor cuando un paciente cancela la cita
  async notifyDoctorAboutCancellation(data: {
    appointmentId: number;
    patientName: string;
    doctorName: string;
    doctorEmail: string;
    appointmentDate: Date;
    service: string;
    location?: string;
    cancellationReason?: string;
  }): Promise<boolean> {
    try {
      console.log('📧 [NotificationService] Notifying doctor about patient cancellation...', {
        doctorEmail: data.doctorEmail,
        patientName: data.patientName,
        appointmentDate: data.appointmentDate
      });

      const formattedDate = data.appointmentDate.toLocaleDateString('es-CL', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      const formattedTime = data.appointmentDate.toLocaleTimeString('es-CL', {
        hour: '2-digit',
        minute: '2-digit'
      });

      const htmlContent = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Paciente Canceló Cita</title>
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f5f7fa; margin: 0; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; text-align: center; padding: 35px 20px 30px;">
                    <h1 style="font-size: 28px; font-weight: 700; margin: 0 0 12px 0; color: #ffffff;">❌ Cita Cancelada por Paciente</h1>
                    <p style="font-size: 16px; margin: 0; color: #ffffff; font-weight: 500;">Notificación del Sistema de Citas</p>
                </div>

                <!-- Content -->
                <div style="padding: 40px 30px;">
                    <p style="font-size: 16px; margin-bottom: 20px; color: #0f172a; font-weight: 500;">
                        Hola <strong style="color: #dc2626;">Dr. ${data.doctorName}</strong>,
                    </p>

                    <p style="font-size: 15px; margin-bottom: 25px; color: #334155;">
                        El paciente <strong>${data.patientName}</strong> ha <strong style="color: #ef4444;">cancelado</strong> su cita.
                    </p>

                    <!-- Appointment Card -->
                    <div style="background: #fee2e2; border-left: 4px solid #ef4444; padding: 20px; border-radius: 6px; margin-bottom: 25px;">
                        <div style="margin-bottom: 12px;">
                            <strong style="color: #991b1b; font-size: 14px;">📅 Fecha:</strong>
                            <p style="margin: 5px 0 0 0; color: #dc2626; font-size: 15px; font-weight: 600;">${formattedDate}</p>
                        </div>
                        <div style="margin-bottom: 12px;">
                            <strong style="color: #991b1b; font-size: 14px;">🕐 Hora:</strong>
                            <p style="margin: 5px 0 0 0; color: #dc2626; font-size: 15px; font-weight: 600;">${formattedTime}</p>
                        </div>
                        <div style="margin-bottom: 12px;">
                            <strong style="color: #991b1b; font-size: 14px;">👤 Paciente:</strong>
                            <p style="margin: 5px 0 0 0; color: #dc2626; font-size: 15px;">${data.patientName}</p>
                        </div>
                        <div style="margin-bottom: 12px;">
                            <strong style="color: #991b1b; font-size: 14px;">💼 Servicio:</strong>
                            <p style="margin: 5px 0 0 0; color: #dc2626; font-size: 15px;">${data.service}</p>
                        </div>
                        ${data.location ? `
                        <div style="margin-bottom: 12px;">
                            <strong style="color: #991b1b; font-size: 14px;">📍 Ubicación:</strong>
                            <p style="margin: 5px 0 0 0; color: #dc2626; font-size: 15px;">${data.location}</p>
                        </div>
                        ` : ''}
                        ${data.cancellationReason ? `
                        <div>
                            <strong style="color: #991b1b; font-size: 14px;">📝 Motivo:</strong>
                            <p style="margin: 5px 0 0 0; color: #dc2626; font-size: 15px;">${data.cancellationReason}</p>
                        </div>
                        ` : ''}
                    </div>

                    <!-- Suggestions -->
                    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 6px; margin-bottom: 25px;">
                        <h3 style="color: #92400e; font-size: 16px; margin: 0 0 12px 0;">💡 Acciones Recomendadas:</h3>
                        <ul style="margin: 0; padding-left: 20px; color: #78350f;">
                            <li style="margin-bottom: 8px;">Contactar al paciente para reagendar</li>
                            <li style="margin-bottom: 8px;">Verificar disponibilidad de horarios alternativos</li>
                            <li style="margin-bottom: 8px;">Ofrecer el horario liberado a lista de espera</li>
                            <li>Actualizar tu calendario personal</li>
                        </ul>
                    </div>

                    <p style="font-size: 14px; color: #64748b; margin-top: 25px;">
                        Esta es una notificación automática del sistema. El horario ahora está disponible para nuevas citas.
                    </p>
                </div>

                <!-- Footer -->
                <div style="background: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                    <p style="font-size: 13px; color: #94a3b8; margin: 0;">© ${new Date().getFullYear()} ArmoniClick. Sistema de Gestión de Citas Médicas.</p>
                </div>
            </div>
        </body>
        </html>
      `;

      const emailSent = await this.emailService.sendEmail({
        from: envs.MAILER_EMAIL,
        to: data.doctorEmail,
        subject: `❌ ${data.patientName} canceló su cita del ${formattedDate}`,
        htmlBody: htmlContent
      });

      console.log(`✅ [NotificationService] Doctor cancellation notification sent to ${data.doctorEmail}:`, emailSent);
      return emailSent;
    } catch (error) {
      console.error('❌ [NotificationService] Error sending doctor cancellation notification:', error);
      return false;
    }
  }

  // Método helper para obtener datos formateados de fecha
  private getFormattedDate(date: Date): { date: string; time: string } {
    return {
      date: date.toISOString().split('T')[0],
      time: date.toTimeString().split(' ')[0].substring(0, 5)
    };
  }
}