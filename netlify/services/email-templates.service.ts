// netlify/services/email-templates.service.ts
import { envs } from '../config/envs';

export interface AppointmentEmailData {
  patientName: string;
  patientEmail: string;
  doctorName: string;
  appointmentDate: string;
  appointmentTime: string;
  service: string;
  duration: number;
  notes?: string;
  confirmationToken?: string;
  type: 'confirmation' | 'reminder';
}

export class EmailTemplatesService {
  private static getBaseUrl(): string {
    return envs.FRONTEND_URL;
  }

  // Template para confirmación de cita
  static getConfirmationEmailTemplate(data: AppointmentEmailData): string {
    const appointmentDateTime = new Date(`${data.appointmentDate}T${data.appointmentTime}`);
    const formattedDate = appointmentDateTime.toLocaleDateString('es-CL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const formattedTime = appointmentDateTime.toLocaleTimeString('es-CL', {
      hour: '2-digit',
      minute: '2-digit'
    });

    return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Cita Confirmada</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                background-color: #f8fafc;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                background: white;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
                background: linear-gradient(135deg, #0891b2 0%, #06b6d4 100%);
                color: white;
                text-align: center;
                padding: 30px 20px;
            }
            .header h1 {
                font-size: 24px;
                margin-bottom: 8px;
            }
            .header p {
                opacity: 0.9;
                font-size: 16px;
            }
            .content {
                padding: 30px;
            }
            .appointment-card {
                background: #f1f5f9;
                border-radius: 8px;
                padding: 24px;
                margin: 20px 0;
                border-left: 4px solid #0891b2;
            }
            .appointment-detail {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 12px;
                padding-bottom: 8px;
                border-bottom: 1px solid #e2e8f0;
            }
            .appointment-detail:last-child {
                margin-bottom: 0;
                border-bottom: none;
                padding-bottom: 0;
            }
            .detail-label {
                font-weight: 600;
                color: #475569;
                min-width: 120px;
            }
            .detail-value {
                color: #1e293b;
                font-weight: 500;
            }
            .success-icon {
                display: inline-block;
                width: 60px;
                height: 60px;
                background: #10b981;
                border-radius: 50%;
                margin: 20px auto;
                position: relative;
            }
            .success-icon::after {
                content: "✓";
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                color: white;
                font-size: 24px;
                font-weight: bold;
            }
            .footer {
                background: #f8fafc;
                padding: 20px;
                text-align: center;
                border-top: 1px solid #e2e8f0;
            }
            .footer p {
                color: #64748b;
                font-size: 14px;
            }
            .contact-info {
                margin-top: 20px;
                padding: 20px;
                background: #f1f5f9;
                border-radius: 8px;
                text-align: center;
            }
            .contact-info h3 {
                color: #475569;
                margin-bottom: 10px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>¡Cita Confirmada!</h1>
                <p>Tu cita ha sido agendada exitosamente</p>
            </div>
            
            <div class="content">
                <div style="text-align: center;">
                    <div class="success-icon"></div>
                </div>
                
                <p>Estimado/a <strong>${data.patientName}</strong>,</p>
                <p>Te confirmamos que tu cita ha sido agendada correctamente con los siguientes datos:</p>
                
                <div class="appointment-card">
                    <div class="appointment-detail">
                        <span class="detail-label">📅 Fecha:</span>
                        <span class="detail-value">${formattedDate}</span>
                    </div>
                    <div class="appointment-detail">
                        <span class="detail-label">⏰ Hora:</span>
                        <span class="detail-value">${formattedTime}</span>
                    </div>
                    <div class="appointment-detail">
                        <span class="detail-label">💼 Tratamiento:</span>
                        <span class="detail-value">${data.service}</span>
                    </div>
                    <div class="appointment-detail">
                        <span class="detail-label">⏱️ Duración:</span>
                        <span class="detail-value">${data.duration} minutos</span>
                    </div>
                    <div class="appointment-detail">
                        <span class="detail-label">👩‍⚕️ Profesional:</span>
                        <span class="detail-value">${data.doctorName}</span>
                    </div>
                    ${data.notes ? `
                    <div class="appointment-detail">
                        <span class="detail-label">📝 Notas:</span>
                        <span class="detail-value">${data.notes}</span>
                    </div>
                    ` : ''}
                </div>

                <div class="contact-info">
                    <h3>Información de Contacto</h3>
                    <p>Si necesitas reprogramar o cancelar tu cita, por favor contáctanos con anticipación.</p>
                    <p>Te enviaremos un recordatorio 24 horas antes de tu cita.</p>
                </div>
            </div>
            
            <div class="footer">
                <p>Este es un correo automático, por favor no responder directamente.</p>
                <p>© ${new Date().getFullYear()} Sistema de Citas Médicas</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  // Template para recordatorio de cita
  static getReminderEmailTemplate(data: AppointmentEmailData): string {
    const appointmentDateTime = new Date(`${data.appointmentDate}T${data.appointmentTime}`);
    const formattedDate = appointmentDateTime.toLocaleDateString('es-CL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const formattedTime = appointmentDateTime.toLocaleTimeString('es-CL', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const confirmUrl = `${this.getBaseUrl()}/confirm-appointment/${data.confirmationToken}`;
    const cancelUrl = `${this.getBaseUrl()}/cancel-appointment/${data.confirmationToken}`;

    return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Recordatorio de Cita</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                background-color: #f8fafc;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                background: white;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
                background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
                color: white;
                text-align: center;
                padding: 30px 20px;
            }
            .header h1 {
                font-size: 24px;
                margin-bottom: 8px;
            }
            .reminder-icon {
                display: inline-block;
                width: 60px;
                height: 60px;
                background: #f59e0b;
                border-radius: 50%;
                margin: 20px auto;
                position: relative;
            }
            .reminder-icon::after {
                content: "🔔";
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 24px;
            }
            .content {
                padding: 30px;
            }
            .appointment-card {
                background: #fef3c7;
                border-radius: 8px;
                padding: 24px;
                margin: 20px 0;
                border-left: 4px solid #f59e0b;
            }
            .appointment-detail {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 12px;
                padding-bottom: 8px;
                border-bottom: 1px solid #fbbf24;
            }
            .appointment-detail:last-child {
                margin-bottom: 0;
                border-bottom: none;
                padding-bottom: 0;
            }
            .detail-label {
                font-weight: 600;
                color: #92400e;
                min-width: 120px;
            }
            .detail-value {
                color: #78350f;
                font-weight: 500;
            }
            .buttons {
                text-align: center;
                margin: 30px 0;
            }
            .btn {
                display: inline-block;
                padding: 12px 24px;
                margin: 0 10px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                font-size: 14px;
                transition: all 0.3s ease;
            }
            .btn-confirm {
                background: #10b981;
                color: white;
            }
            .btn-confirm:hover {
                background: #059669;
                transform: translateY(-1px);
            }
            .btn-cancel {
                background: #ef4444;
                color: white;
            }
            .btn-cancel:hover {
                background: #dc2626;
                transform: translateY(-1px);
            }
            .footer {
                background: #f8fafc;
                padding: 20px;
                text-align: center;
                border-top: 1px solid #e2e8f0;
            }
            .urgency-notice {
                background: #fef2f2;
                border: 1px solid #fecaca;
                border-radius: 8px;
                padding: 16px;
                margin: 20px 0;
                text-align: center;
            }
            .urgency-notice strong {
                color: #dc2626;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Recordatorio de Cita</h1>
                <p>Tu cita es mañana</p>
            </div>
            
            <div class="content">
                <div style="text-align: center;">
                    <div class="reminder-icon"></div>
                </div>
                
                <p>Estimado/a <strong>${data.patientName}</strong>,</p>
                <p>Te recordamos que tienes una cita programada para mañana:</p>
                
                <div class="appointment-card">
                    <div class="appointment-detail">
                        <span class="detail-label">📅 Fecha:</span>
                        <span class="detail-value">${formattedDate}</span>
                    </div>
                    <div class="appointment-detail">
                        <span class="detail-label">⏰ Hora:</span>
                        <span class="detail-value">${formattedTime}</span>
                    </div>
                    <div class="appointment-detail">
                        <span class="detail-label">💼 Tratamiento:</span>
                        <span class="detail-value">${data.service}</span>
                    </div>
                    <div class="appointment-detail">
                        <span class="detail-label">⏱️ Duración:</span>
                        <span class="detail-value">${data.duration} minutos</span>
                    </div>
                    <div class="appointment-detail">
                        <span class="detail-label">👩‍⚕️ Profesional:</span>
                        <span class="detail-value">${data.doctorName}</span>
                    </div>
                    ${data.notes ? `
                    <div class="appointment-detail">
                        <span class="detail-label">📝 Notas:</span>
                        <span class="detail-value">${data.notes}</span>
                    </div>
                    ` : ''}
                </div>

                <div class="urgency-notice">
                    <strong>¡Importante!</strong> Por favor confirma tu asistencia o cancela con anticipación si no podrás asistir.
                </div>

                <div class="buttons">
                    <a href="${confirmUrl}" class="btn btn-confirm">✓ Confirmar Cita</a>
                    <a href="${cancelUrl}" class="btn btn-cancel">✗ Cancelar Cita</a>
                </div>

                <p style="text-align: center; color: #64748b; font-size: 14px; margin-top: 20px;">
                    Si no puedes usar los botones, copia y pega estos enlaces en tu navegador:<br>
                    <strong>Confirmar:</strong> ${confirmUrl}<br>
                    <strong>Cancelar:</strong> ${cancelUrl}
                </p>
            </div>
            
            <div class="footer">
                <p>Este es un correo automático, por favor no responder directamente.</p>
                <p>© ${new Date().getFullYear()} Sistema de Citas Médicas</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }
}