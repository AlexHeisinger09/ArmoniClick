import { EmailService, UserService } from "../../../services";
import { usersTable } from '../../../data/schemas/user.schema';

import { BcriptAdapter, JwtAdapter } from "../../../config/adapters";
import { HEADERS } from "../../../config/utils";
import { envs } from "../../../config/envs";

import { HandlerResponse } from "@netlify/functions";

interface CreateDemoUserDto {
  email: string;
  name: string;
  lastName: string;
  password?: string;
  trialDays?: number; // Días de vigencia (default: 15)
}

interface CreateDemoUserUseCase {
  execute(dto: CreateDemoUserDto): Promise<HandlerResponse>;
}

export class CreateDemoUser implements CreateDemoUserUseCase {
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

  private sendDemoUserEmail = async (email: string, userName: string, password: string, expirationDate: Date) => {
    const formattedDate = expirationDate.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const htmlBody = /*html*/ `
      <h2>¡Bienvenido a ArmoniClick!</h2>
      <p>Tu cuenta de demostración ha sido creada exitosamente.</p>

      <h3>Credenciales de acceso:</h3>
      <p>
        <strong>Email:</strong> ${email}<br>
        <strong>Contraseña:</strong> ${password}
      </p>

      <h3>Información importante:</h3>
      <p>
        Tu cuenta de demostración <strong>expirará el ${formattedDate}</strong>
      </p>

      <p>
        Accede a tu cuenta aquí: <a href="${envs.FRONTEND_URL}/auth/login">ArmoniClick Login</a>
      </p>

      <p>Si tienes preguntas, no dudes en contactarnos.</p>
    `;

    const options = {
      from: envs.MAILER_EMAIL,
      to: email,
      subject: "ArmoniClick - Tu cuenta de demostración",
      htmlBody,
    };

    const isSent = await this.emailService.sendEmail(options);
    if (!isSent) throw new Error("Error enviando email de cuenta de demostración");

    return true;
  };

  public async execute(dto: CreateDemoUserDto): Promise<HandlerResponse> {
    const normalizedEmail = dto.email.toLowerCase().trim();
    const trialDays = dto.trialDays || 15;
    const hashedPassword = dto.password || this.generateRandomPassword();

    try {
      // Verificar si el usuario ya existe
      const existUser = await this.userService.findOne(usersTable.email, normalizedEmail);

      if (existUser) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "El usuario ya existe",
          }),
          headers: HEADERS.json,
        };
      }

      // Calcular fecha de expiración
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + trialDays);

      // Hash de la contraseña
      const password = BcriptAdapter.hash(hashedPassword);

      // Crear usuario con expirationDate
      const newUser = await this.userService.insert({
        email: normalizedEmail,
        name: dto.name,
        lastName: dto.lastName,
        password,
        username: this.generateUsername(dto.name, dto.lastName),
        expirationDate, // ✅ Agregar fecha de expiración
        emailValidated: true, // Las cuentas de demo ya están validadas
      });

      // Enviar email con credenciales
      await this.sendDemoUserEmail(normalizedEmail, dto.name, hashedPassword, expirationDate);

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Cuenta de demostración creada correctamente",
          user: {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            expirationDate: newUser.expirationDate,
          },
        }),
        headers: HEADERS.json,
      };
    } catch (error) {
      console.error('❌ Error en CreateDemoUser:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: typeof error === "object" && error !== null && "message" in error ? (error as { message: string }).message : "Error desconocido",
        }),
        headers: HEADERS.json,
      };
    }
  }

  private generateRandomPassword(): string {
    const length = 12;
    const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  }

  private generateUsername(name: string, lastName: string): string {
    const timestamp = Date.now();
    return `${name.toLowerCase()}.${lastName.toLowerCase()}.${timestamp}`;
  }
}
