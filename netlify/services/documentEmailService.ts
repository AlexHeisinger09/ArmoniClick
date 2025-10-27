import nodemailer, { Transporter } from "nodemailer";
import { EmailService, EmailServiceOptions } from "./email.service";

export interface SendDocumentEmailOptions {
  to: string;
  documentTitle: string;
  pdfBuffer: Buffer;
  patientName: string;
}

export class DocumentEmailService {
  private emailService: EmailService;
  private mailerUser: string;

  constructor(emailService: EmailService, mailerUser: string) {
    this.emailService = emailService;
    this.mailerUser = mailerUser;
  }

  async sendDocumentEmail({
    to,
    documentTitle,
    pdfBuffer,
    patientName,
  }: SendDocumentEmailOptions): Promise<boolean> {
    try {
      const htmlBody = `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px;">
          <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">
            Documento Médico Firmado
          </h2>

          <p>Estimado/a <strong>${patientName}</strong>,</p>

          <p>Su documento <strong>"${documentTitle}"</strong> ha sido firmado exitosamente.</p>

          <div style="background-color: #ecf0f1; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p>Adjuntamos el documento firmado en PDF para su descarga y almacenamiento.</p>
          </div>

          <h3 style="color: #2c3e50;">Información del Documento:</h3>
          <ul style="color: #555;">
            <li><strong>Tipo:</strong> ${documentTitle}</li>
            <li><strong>Estado:</strong> Firmado</li>
            <li><strong>Fecha de Firma:</strong> ${new Date().toLocaleDateString('es-CL')}</li>
          </ul>

          <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 3px;">
            <p style="margin: 0; color: #856404;">
              <strong>Nota Importante:</strong> Este documento ha sido generado electrónicamente y es válido para efectos legales.
            </p>
          </div>

          <p style="color: #777; font-size: 12px; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 10px;">
            Este es un mensaje automático. Por favor no responda a este correo.
            Si tiene consultas, contáctese directamente con su médico tratante.
          </p>
        </div>
      `;

      return await this.emailService.sendEmail({
        from: this.mailerUser,
        to,
        subject: `Documento Firmado: ${documentTitle}`,
        htmlBody,
        attachments: [
          {
            filename: `${documentTitle.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf',
          },
        ],
      });
    } catch (error) {
      console.error('Error sending document email:', error);
      return false;
    }
  }
}
