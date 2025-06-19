import { UserService } from '../services/user.service';
import { usersTable } from '../data/schemas/user.schema';

import { JwtAdapter } from '../config/adapters/jwt.adapter';

import { EmailResponse } from '../interfaces/response.interface';
import { HEADERS } from '../config/utils/constants';

export const validateJWT = async (authorization: string) => {
  const userService = new UserService();

  console.log('🔐 validateJWT - authorization header:', authorization ? `Bearer ***` : 'No header'); // Debug

  if (!authorization) {
    console.log('❌ No authorization header provided'); // Debug
    return {
      statusCode: 401,
      body: JSON.stringify({ message: "No token provided" }),
      headers: HEADERS.json,
    };
  }

  if (!authorization.startsWith("Bearer ")) {
    console.log('❌ Invalid Bearer token format:', authorization.substring(0, 20)); // Debug
    return {
      statusCode: 401,
      body: JSON.stringify({ message: "Invalid Bearer token" }),
      headers: HEADERS.json,
    };
  }

  const token = authorization.split(" ").at(1) || "";
  console.log('🔑 Extracted token:', token ? `${token.substring(0, 20)}...` : 'Empty token'); // Debug

  try {
    console.log('🔍 About to validate token with JwtAdapter...'); // Debug
    const payload = await JwtAdapter.validateToken<EmailResponse>(token);
    console.log('✅ Token validation result:', payload ? `Email: ${payload.email}` : 'No payload'); // Debug
    
    if (!payload) {
      console.log('❌ Token validation failed - payload is null'); // Debug
      return {
        statusCode: 401,
        body: JSON.stringify({ message: "Invalid token" }),
        headers: HEADERS.json,
      };
    }

    console.log('👤 Looking for user with email:', payload.email); // Debug
    const user = await userService.findOne(usersTable.email, payload.email, {
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      emailValidated: usersTable.emailValidated,
      img: usersTable.img,
    });

    if (!user) {
      console.log('❌ User not found in database for email:', payload.email); // Debug
      return {
        statusCode: 401,
        body: JSON.stringify({ message: "Invalid token - User not found" }),
        headers: HEADERS.json,
      };
    }

    console.log('✅ User found and validated:', user.email); // Debug
    return {
      statusCode: 200,
      body: JSON.stringify(user),
      headers: HEADERS.json,
    };
  } catch (error) {
    console.error('💥 Token validation error:', error); // Debug
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error" }),
      headers: HEADERS.json,
    };
  }
};