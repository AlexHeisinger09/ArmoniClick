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
                background-color: #f5f7fa;
            }
            .container {
                max-width: 600px;
                margin: 20px auto;
                background: white;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }
            .header {
                background: linear-gradient(135deg, #0891b2 0%, #06b6d4 100%);
                color: white;
                text-align: center;
                padding: 40px 20px 30px;
            }
            .logo {
                max-width: 180px;
                height: auto;
                margin-bottom: 25px;
                display: inline-block;
                background: white;
                padding: 10px 15px;
                border-radius: 6px;
            }
            .header h1 {
                font-size: 32px;
                font-weight: 700;
                margin-bottom: 12px;
                margin-top: 0;
                color: #ffffff;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            .header p {
                font-size: 16px;
                opacity: 1;
                color: #ffffff;
                font-weight: 500;
            }
            .content {
                padding: 40px 30px;
            }
            .greeting {
                font-size: 16px;
                margin-bottom: 20px;
                color: #0f172a;
                line-height: 1.6;
                font-weight: 500;
            }
            .greeting strong {
                color: #0891b2;
            }
            .appointment-card {
                background: #dbeafe;
                border-radius: 8px;
                padding: 28px;
                margin: 30px 0;
                border-left: 5px solid #0891b2;
            }
            .appointment-detail {
                display: flex;
                margin-bottom: 18px;
                align-items: flex-start;
            }
            .appointment-detail:last-child {
                margin-bottom: 0;
            }
            .detail-icon {
                font-size: 20px;
                margin-right: 14px;
                min-width: 24px;
            }
            .detail-content {
                flex: 1;
            }
            .detail-label {
                font-weight: 700;
                color: #0c4a6e;
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 0.8px;
                display: block;
                margin-bottom: 4px;
            }
            .detail-value {
                color: #0f172a;
                font-weight: 600;
                font-size: 16px;
            }
            .info-box {
                background: #eff6ff;
                border-left: 4px solid #0891b2;
                padding: 18px;
                margin: 25px 0;
                border-radius: 4px;
            }
            .info-box p {
                margin: 10px 0;
                color: #0c4a6e;
                font-size: 14px;
                font-weight: 500;
            }
            .footer {
                background: #f8fafc;
                padding: 25px 30px;
                text-align: center;
                border-top: 1px solid #e2e8f0;
            }
            .footer p {
                color: #64748b;
                font-size: 12px;
                margin: 5px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img src="https://res.cloudinary.com/drfvhhrck/image/upload/v1764792657/letras_o42jqi.png" alt="ArmoniClick Logo" class="logo">
                <h1>¡Cita Confirmada! ✓</h1>
                <p>Tu cita ha sido agendada exitosamente</p>
            </div>

            <div class="content">
                <div class="greeting">
                    Estimado/a <strong>${data.patientName}</strong>,
                    <br><br>
                    Te confirmamos que tu cita ha sido agendada correctamente. A continuación encontrarás los detalles:
                </div>

                <div class="appointment-card">
                    <div class="appointment-detail">
                        <div class="detail-icon">📅</div>
                        <div class="detail-content">
                            <span class="detail-label">Fecha</span>
                            <span class="detail-value">${formattedDate}</span>
                        </div>
                    </div>
                    <div class="appointment-detail">
                        <div class="detail-icon">⏰</div>
                        <div class="detail-content">
                            <span class="detail-label">Hora</span>
                            <span class="detail-value">${formattedTime}</span>
                        </div>
                    </div>
                    <div class="appointment-detail">
                        <div class="detail-icon">💼</div>
                        <div class="detail-content">
                            <span class="detail-label">Tratamiento</span>
                            <span class="detail-value">${data.service}</span>
                        </div>
                    </div>
                    <div class="appointment-detail">
                        <div class="detail-icon">⏱️</div>
                        <div class="detail-content">
                            <span class="detail-label">Duración</span>
                            <span class="detail-value">${data.duration} minutos</span>
                        </div>
                    </div>
                    <div class="appointment-detail">
                        <div class="detail-icon">👨‍⚕️</div>
                        <div class="detail-content">
                            <span class="detail-label">Profesional</span>
                            <span class="detail-value">${data.doctorName}</span>
                        </div>
                    </div>
                    ${data.notes ? `
                    <div class="appointment-detail">
                        <div class="detail-icon">📝</div>
                        <div class="detail-content">
                            <span class="detail-label">Notas</span>
                            <span class="detail-value">${data.notes}</span>
                        </div>
                    </div>
                    ` : ''}
                </div>

                <div class="info-box">
                    <p><strong>📌 Importante:</strong></p>
                    <p>• Te enviaremos un recordatorio 24 horas antes de tu cita</p>
                    <p>• Si necesitas reprogramar o cancelar, hazlo con anticipación</p>
                    <p>• Llega 10 minutos antes de la hora agendada</p>
                </div>
            </div>

            <div class="footer">
                <p>Este es un correo automático, por favor no responder directamente.</p>
                <p>© ${new Date().getFullYear()} ArmoniClick - Sistema de Citas Médicas</p>
                <p style="margin-top: 10px; color: #94a3b8; font-size: 11px;">www.armoniclick.cl</p>
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
                background-color: #f5f7fa;
            }
            .container {
                max-width: 600px;
                margin: 20px auto;
                background: white;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }
            .header {
                background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
                color: white;
                text-align: center;
                padding: 40px 20px 30px;
            }
            .logo {
                max-width: 180px;
                height: auto;
                margin-bottom: 25px;
                display: inline-block;
                background: white;
                padding: 10px 15px;
                border-radius: 6px;
            }
            .header h1 {
                font-size: 32px;
                font-weight: 700;
                margin-bottom: 12px;
                margin-top: 0;
                color: #ffffff;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            .header p {
                font-size: 16px;
                opacity: 1;
                color: #ffffff;
                font-weight: 500;
            }
            .content {
                padding: 40px 30px;
            }
            .greeting {
                font-size: 16px;
                margin-bottom: 20px;
                color: #0f172a;
                line-height: 1.6;
                font-weight: 500;
            }
            .greeting strong {
                color: #f59e0b;
            }
            .appointment-card {
                background: #fef3c7;
                border-radius: 8px;
                padding: 28px;
                margin: 30px 0;
                border-left: 5px solid #f59e0b;
            }
            .appointment-detail {
                display: flex;
                margin-bottom: 18px;
                align-items: flex-start;
            }
            .appointment-detail:last-child {
                margin-bottom: 0;
            }
            .detail-icon {
                font-size: 20px;
                margin-right: 14px;
                min-width: 24px;
            }
            .detail-content {
                flex: 1;
            }
            .detail-label {
                font-weight: 700;
                color: #78350f;
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 0.8px;
                display: block;
                margin-bottom: 4px;
            }
            .detail-value {
                color: #451a03;
                font-weight: 600;
                font-size: 16px;
            }
            .urgency-box {
                background: #fee2e2;
                border-left: 4px solid #dc2626;
                padding: 18px;
                margin: 25px 0;
                border-radius: 4px;
            }
            .urgency-box p {
                margin: 10px 0;
                color: #7f1d1d;
                font-size: 14px;
                font-weight: 500;
            }
            .urgency-box strong {
                color: #dc2626;
            }
            .buttons {
                text-align: center;
                margin: 30px 0;
                display: flex;
                gap: 12px;
                flex-wrap: wrap;
                justify-content: center;
            }
            .btn {
                display: inline-block;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 6px;
                font-weight: 600;
                font-size: 14px;
                transition: all 0.3s ease;
                border: none;
                cursor: pointer;
            }
            .btn-confirm {
                background: #10b981;
                color: white;
            }
            .btn-confirm:hover {
                background: #059669;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
            }
            .btn-cancel {
                background: #ef4444;
                color: white;
            }
            .btn-cancel:hover {
                background: #dc2626;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
            }
            .link-info {
                text-align: center;
                color: #64748b;
                font-size: 12px;
                margin-top: 16px;
                padding-top: 16px;
                border-top: 1px solid #e2e8f0;
            }
            .link-info a {
                color: #f59e0b;
                word-break: break-all;
            }
            .footer {
                background: #f8fafc;
                padding: 25px 30px;
                text-align: center;
                border-top: 1px solid #e2e8f0;
            }
            .footer p {
                color: #64748b;
                font-size: 12px;
                margin: 5px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img src="https://res.cloudinary.com/drfvhhrck/image/upload/v1764792657/letras_o42jqi.png" alt="ArmoniClick Logo" class="logo">
                <h1>🔔 Recordatorio de Cita</h1>
                <p>Tu cita es mañana</p>
            </div>

            <div class="content">
                <div class="greeting">
                    Estimado/a <strong>${data.patientName}</strong>,
                    <br><br>
                    Te recordamos que tienes una cita programada para mañana. Por favor revisa los detalles:
                </div>

                <div class="appointment-card">
                    <div class="appointment-detail">
                        <div class="detail-icon">📅</div>
                        <div class="detail-content">
                            <span class="detail-label">Fecha</span>
                            <span class="detail-value">${formattedDate}</span>
                        </div>
                    </div>
                    <div class="appointment-detail">
                        <div class="detail-icon">⏰</div>
                        <div class="detail-content">
                            <span class="detail-label">Hora</span>
                            <span class="detail-value">${formattedTime}</span>
                        </div>
                    </div>
                    <div class="appointment-detail">
                        <div class="detail-icon">💼</div>
                        <div class="detail-content">
                            <span class="detail-label">Tratamiento</span>
                            <span class="detail-value">${data.service}</span>
                        </div>
                    </div>
                    <div class="appointment-detail">
                        <div class="detail-icon">⏱️</div>
                        <div class="detail-content">
                            <span class="detail-label">Duración</span>
                            <span class="detail-value">${data.duration} minutos</span>
                        </div>
                    </div>
                    <div class="appointment-detail">
                        <div class="detail-icon">👨‍⚕️</div>
                        <div class="detail-content">
                            <span class="detail-label">Profesional</span>
                            <span class="detail-value">${data.doctorName}</span>
                        </div>
                    </div>
                    ${data.notes ? `
                    <div class="appointment-detail">
                        <div class="detail-icon">📝</div>
                        <div class="detail-content">
                            <span class="detail-label">Notas</span>
                            <span class="detail-value">${data.notes}</span>
                        </div>
                    </div>
                    ` : ''}
                </div>

                <div class="urgency-box">
                    <p><strong>⚠️ ¡Importante!</strong></p>
                    <p>Por favor confirma tu asistencia. Si no podrás asistir, cancela con anticipación para que otro paciente pueda usar ese horario.</p>
                </div>

                <div class="buttons">
                    <a href="${confirmUrl}" class="btn btn-confirm">✓ Confirmar</a>
                    <a href="${cancelUrl}" class="btn btn-cancel">✗ Cancelar</a>
                </div>

                <div class="link-info">
                    <p><strong>¿No puedes hacer clic en los botones?</strong></p>
                    <p>Copia y pega estos enlaces en tu navegador:</p>
                    <p><strong>Confirmar:</strong><br><a href="${confirmUrl}">${confirmUrl}</a></p>
                    <p style="margin-top: 10px;"><strong>Cancelar:</strong><br><a href="${cancelUrl}">${cancelUrl}</a></p>
                </div>
            </div>

            <div class="footer">
                <p>Este es un correo automático, por favor no responder directamente.</p>
                <p>© ${new Date().getFullYear()} ArmoniClick - Sistema de Citas Médicas</p>
                <p style="margin-top: 10px; color: #94a3b8; font-size: 11px;">www.armoniclick.cl</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }
}