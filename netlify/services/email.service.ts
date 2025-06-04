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
  path: string;
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

    const mailOptions = {
      from,
      to,
      subject,
      html: htmlBody,
      attachments,
    };

    try {
      const sentInformation = await this.transporter.sendMail(mailOptions);
      // console.log(sentInformation);

      return true;
    } catch (error) {
      // console.log(error);
      return false;
    }
  }
}
