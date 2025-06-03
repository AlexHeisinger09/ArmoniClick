import { UserService } from "../../../services";
import { usersTable } from "../../../data/schemas/user.schema";

import { JwtAdapter } from "../../../config/adapters";
import { HEADERS } from "../../../config/utils";
import { EmailResponse } from "../../../interfaces/response.interface";

import { HandlerResponse } from "@netlify/functions";

interface ValidateEmailUseCase {
  execute(token: string): Promise<HandlerResponse>;
}

export class ValidateEmail implements ValidateEmailUseCase {
  constructor(private readonly userService: UserService = new UserService()) {}

  public async execute(token: string): Promise<HandlerResponse> {
    const payload = await JwtAdapter.validateToken<EmailResponse>(token);

    if (!payload)
      return {
        statusCode: 401,
        body: JSON.stringify({
          message: "Token inválido",
        }),
        headers: HEADERS.json,
      };

    const { email } = payload;
    if (!email)
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Email no encontrado en el token",
        }),
        headers: HEADERS.json,
      };

    const user = await this.userService.findOne(usersTable.email, email);

    if (!user)
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Usuario no encontrado",
        }),
        headers: HEADERS.json,
      };
    
    try {
      await this.userService.update(
        { emailValidated: true },
        usersTable.email,
        user.email
      );

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Usuario confirmado correctamente",
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
