import { UserService } from "../../../services";
import { usersTable } from "../../../data/schemas/user.schema";

import { BcriptAdapter, JwtAdapter } from "../../../config/adapters";
import { HEADERS } from "../../../config/utils";
import { EmailResponse } from "../../../interfaces/response.interface";

import { HandlerResponse } from "@netlify/functions";
interface ChangePasswordUseCase {
  execute: (token: string, newPassword: string) => Promise<HandlerResponse>;
}

export class ChangePassword implements ChangePasswordUseCase {
  constructor(private readonly userService: UserService = new UserService()) {}

  public async execute(
    token: string,
    newPassword: string
  ): Promise<HandlerResponse> {
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
      const password = BcriptAdapter.hash(newPassword);

      await this.userService.update({ password }, usersTable.email, user.email);

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Password modificado correctamente",
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
