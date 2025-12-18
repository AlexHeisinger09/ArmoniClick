import nodemailer, { Transporter } from "nodemailer";

export interface EmailServiceOptions {
  mailerHost: string;
  mailerPort: number;
  mailerUser: string;
  senderEmailPassword: string;
  readonly postToProvider: boolean;
}

export interface SendMailOptions {
  from: string;
  to: string | string[];
  subject: string;
  htmlBody: string;
  attachments?: Attachment[];
}

export interface Attachment {
  filename: string;
  path?: string;
  content?: Buffer | string;
  contentType?: string;
}

export class EmailService {
  private transporter: Transporter;
  private postToProvider: boolean;

  constructor({
    mailerHost,
    mailerPort,
    mailerUser,
    senderEmailPassword,
    postToProvider,
  }: EmailServiceOptions) {
    this.postToProvider = postToProvider;

    this.transporter = nodemailer.createTransport({
      host: mailerHost,
      secure: true,
      port: mailerPort,
      auth: {
        user: mailerUser,
        pass: senderEmailPassword,
      },
    });
  }

  async sendEmail({
    from,
    to,
    subject,
    htmlBody,
    attachments = [],
  }: SendMailOptions) {
    if (!this.postToProvider) return true;

    // Convertir attachments al formato de nodemailer
    const nodemailerAttachments = attachments.map(att => {
      const attachment: any = {
        filename: att.filename,
      };

      // Si tiene content (Buffer o string), usarlo
      if (att.content) {
        attachment.content = att.content;
      }
      // Si tiene path, usarlo
      else if (att.path) {
        attachment.path = att.path;
      }

      // Agregar contentType si existe
      if (att.contentType) {
        attachment.contentType = att.contentType;
      }

      return attachment;
    });

    const mailOptions = {
      from,
      to,
      subject,
      html: htmlBody,
      attachments: nodemailerAttachments,
    };

    try {
      console.log('📤 [EmailService] Sending email...', {
        to,
        subject,
        attachmentsCount: nodemailerAttachments.length
      });

      const sentInformation = await this.transporter.sendMail(mailOptions);
      console.log('✅ [EmailService] Email sent successfully:', sentInformation.messageId);

      return true;
    } catch (error) {
      console.error('❌ [EmailService] Error sending email:', error);
      return false;
    }
  }
}
