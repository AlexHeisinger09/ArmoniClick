// netlify/middlewares/auth.middleware.ts - CORREGIDO COMPLETAMENTE
import { UserService } from '../services/user.service';
import { usersTable } from '../data/schemas/user.schema';
import { JwtAdapter } from '../config/adapters/jwt.adapter';
import { EmailResponse } from '../interfaces/response.interface';
import { HEADERS } from '../config/utils/constants';

export const validateJWT = async (authorization: string) => {
  const userService = new UserService();

  if (!authorization) {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: "No token provided" }),
      headers: HEADERS.json,
    };
  }

  if (!authorization.startsWith("Bearer ")) {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: "Invalid Bearer token" }),
      headers: HEADERS.json,
    };
  }

  const token = authorization.split(" ").at(1) || "";

  try {
    const payload = await JwtAdapter.validateToken<EmailResponse>(token);
    if (!payload) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: "Invalid token" }),
        headers: HEADERS.json,
      };
    }

    // ✅ CORREGIDO: Usar findOne sin especificar campos para obtener TODOS los campos
    const user = await userService.findOne(usersTable.email, payload.email);

    if (!user) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: "Invalid token - User not found" }),
        headers: HEADERS.json,
      };
    }

    console.log('🔍 Usuario encontrado en auth middleware:', user);

    return {
      statusCode: 200,
      body: JSON.stringify(user),
      headers: HEADERS.json,
    };
  } catch (error) {
    console.error('❌ Error en validateJWT:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error" }),
      headers: HEADERS.json,
    };
  }
};