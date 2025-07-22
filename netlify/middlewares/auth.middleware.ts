// netlify/middlewares/auth.middleware.ts - CORREGIDO
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

    // ✅ CORREGIDO: Incluir TODOS los campos necesarios en la selección
    const user = await userService.findOne(usersTable.email, payload.email, {
      id: usersTable.id,
      rut: usersTable.rut,                     // ✅ CAMPO RUT
      name: usersTable.name,
      lastName: usersTable.lastName,        
      username: usersTable.username,        
      email: usersTable.email,
      emailValidated: usersTable.emailValidated,
      img: usersTable.img,
      phone: usersTable.phone,               // ✅ CAMPOS ADICIONALES
      address: usersTable.address,           // ✅ 
      zipCode: usersTable.zipCode,           // ✅ 
      city: usersTable.city,                 // ✅ 
      createdAt: usersTable.createdAt,
      updatedAt: usersTable.updatedAt,
      isActive: usersTable.isActive,         // ✅ CAMPO QUE FALTABA
    });

    if (!user) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: "Invalid token - User not found" }),
        headers: HEADERS.json,
      };
    }

    console.log('🔍 Usuario encontrado en auth middleware:', user); // ✅ DEBUG

    return {
      statusCode: 200,
      body: JSON.stringify(user),
      headers: HEADERS.json,
    };
  } catch (error) {
    console.error('❌ Error en validateJWT:', error); // ✅ DEBUG
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error" }),
      headers: HEADERS.json,
    };
  }
};