import { EmailService, UserService } from "../../../services";
import { ResetPasswordDto } from "../dtos";

import { usersTable } from "../../../data/schemas/user.schema";

import { JwtAdapter } from "../../../config/adapters";
import { HEADERS } from "../../../config/utils";
import { envs } from "../../../config/envs";

import { HandlerResponse } from "@netlify/functions";

interface ResetPasswordUseCase {
  execute: (dto: ResetPasswordDto) => Promise<HandlerResponse>;
}

export class ResetPassword implements ResetPasswordUseCase {
  constructor(
    private readonly userService: UserService = new UserService(),
    private readonly emailService: EmailService = new EmailService({
      mailerHost: envs.MAILER_HOST,
      mailerPort: envs.MAILER_PORT,
      mailerUser: envs.MAILER_USER,
      senderEmailPassword: envs.MAILER_SECRET_KEY,
      postToProvider: envs.SEND_EMAIL,
    })
  ) {}

  private async sendPasswordValidation(email: string, userName: string) {
    const token = await JwtAdapter.generateToken({ email });
    if (!token)
      throw new Error("Error generando token de cambio de contraseña");

    const link = `${envs.FRONTEND_URL}/auth/olvide-password/${token}`;

    const htmlBody = /*html*/ `
      <p>Hola: ${userName}, ¿olvidaste tu contraseña?</p>
      <p>
        Para cambiar tu contraseña, haz click en el siguiente enlace:
        <a href="${link}">Cambiar Contraseña</a>
      </p>

      <p>Si tu no solicitaste este cambio, puedes ignorar este mensaje</p>
    `;

    const options = {
      from: envs.MAILER_EMAIL,
      to: email,
      subject: "ArmoniClick - Cambio de Contraseña",
      htmlBody,
    };

    const isSent = await this.emailService.sendEmail(options);
    if (!isSent)
      throw new Error("Error enviando email de cambio de contraseña");

    return true;
  }

  public async execute(dto: ResetPasswordDto): Promise<HandlerResponse> {
    const user = await this.userService.findOne(usersTable.email, dto.email);

    if (!user)
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "El usuario no existe",
        }),
        headers: HEADERS.json,
      };

    try {
      await this.sendPasswordValidation(user.email, user.name);
      
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Hemos enviado un email con las instrucciones",
        }),
        headers: HEADERS.json,
      };
    } catch (error: any) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: error.message,
        }),
        headers: HEADERS.json,
      };
    }
  }
}
