import { UserService } from '../../../services';
import { usersTable } from "../../../data/schemas/user.schema";

import { LoginUserDto } from "../dtos";
import { BcriptAdapter, JwtAdapter } from "../../../config/adapters";
import { HEADERS } from "../../../config/utils";

import { HandlerResponse } from "@netlify/functions";

interface LoginUserUseCase {
  execute: (dto: LoginUserDto) => Promise<HandlerResponse>;
}

export class LoginUser implements LoginUserUseCase {
  constructor(
    private readonly userService: UserService  = new UserService(),
  ){}

  public async execute(dto: LoginUserDto): Promise<HandlerResponse> {
    const user = await this.userService.findOne(usersTable.email, dto.email);
    
    if (!user) return {
      statusCode: 400,
      body: JSON.stringify({
        message: "El usuario no existe",
      }),
      headers: HEADERS.json,
    }

    if (!user.emailValidated) return {
      statusCode: 403,
      body: JSON.stringify({
        message: "Tu cuenta no ha sido confirmada",
      }),
      headers: HEADERS.json,
    };
    
    const { password, ...newUser } = user;

    const isMatching = BcriptAdapter.compare(dto.password, password);
    if (!isMatching) return {
      statusCode: 400,
      body: JSON.stringify({
        message: "El password es incorrecto",
      }),
      headers: HEADERS.json,
    };

    const token = await JwtAdapter.generateToken({ email: user.email }, "3d");
    if (!token) return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error generando token",
      }),
      headers: HEADERS.json,
    
    };



    return {
      statusCode: 200,
      body: JSON.stringify({
        user: newUser,
        token,
      }),
      headers: HEADERS.json,
    };
      
  }
}
