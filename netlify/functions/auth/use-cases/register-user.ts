import { EmailService, UserService } from "../../../services";
import { usersTable } from '../../../data/schemas/user.schema';

import { RegisterUserDto } from "../dtos";
import { HEADERS } from "../../../config/utils";
import { BcriptAdapter, JwtAdapter } from "../../../config/adapters";
import { envs } from "../../../config/envs";

import { HandlerResponse } from "@netlify/functions";

interface RegisterUserUseCase {
  execute(dto: RegisterUserDto): Promise<HandlerResponse>;
}

export class RegisterUser implements RegisterUserUseCase {
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

  private sendUserValidation = async (email: string, userName: string) => {
    const token = await JwtAdapter.generateToken({ email });
    if (!token) throw new Error("Error generando token de validación de cuenta");

    const link = `${envs.FRONTEND_URL}/auth/confirmar/${token}`;
    const htmlBody = /*html*/ `
      <p>Hola: ${userName}, comprueba tu cuenta en ArmoniClick</p>
      <p>
        Tu cuenta ya está casi lista, solo debes comprobarla  en siguiente enlace:
        <a href="${link}">Comprobar Cuenta</a>
      </p>

      <p>Si tu no creaste esta cuenta, puedes ignorar este mensaje</p>
    `;

    const options = {
      from: envs.MAILER_EMAIL,
      to: email,
      subject: "ArmoniClick - Valida tu cuenta",
      htmlBody,
    };

    const isSent = await this.emailService.sendEmail(options);
    if (!isSent) throw new Error("Error enviando email de validación de cuenta");

    return true;
  };

  public async execute(dto: RegisterUserDto): Promise<HandlerResponse> { 
    const existUser = await this.userService.findOne(usersTable.email, dto.email);

    if (existUser)
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Usuario ya registrado",
        }),
        headers: HEADERS.json,
      };

    try {
      const password = BcriptAdapter.hash(dto.password);

      await Promise.all([
        this.userService.insert({...dto,password}),
        this.sendUserValidation(dto.email, dto.name),
      ]);

      return {
        statusCode: 200,
        body: JSON.stringify({
          message:
            "Usuario creado correctamente, revisa tu email para confirmar tu cuenta",
        }),
        headers: HEADERS.json,
      };
    } catch (error) {
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
