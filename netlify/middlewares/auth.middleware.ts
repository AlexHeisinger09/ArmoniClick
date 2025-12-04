// netlify/middlewares/auth.middleware.ts - CORREGIDO COMPLETAMENTE
import { UserService } from '../services/user.service';
import { usersTable } from '../data/schemas/user.schema';
import { JwtAdapter } from '../config/adapters/jwt.adapter';
import { EmailResponse } from '../interfaces/response.interface';
import { HEADERS } from '../config/utils/constants';

/**
 * Extracts the authorization header from Netlify Function event headers
 * Handles case-insensitive header names (authorization vs Authorization)
 * Netlify Functions typically convert headers to lowercase
 */
export const getAuthorizationHeader = (headers: Record<string, any> | undefined): string | undefined => {
  if (!headers) return undefined;
  // Try different case variations since Netlify might normalize headers
  return headers.authorization || headers.Authorization || headers.AUTHORIZATION;
};

export const validateJWT = async (authorization: string) => {
  const userService = new UserService();

  console.log('🔐 validateJWT called with authorization header:', {
    provided: !!authorization,
    startsWithBearer: authorization?.startsWith("Bearer "),
    headerLength: authorization?.length || 0
  });

  if (!authorization) {
    console.warn('❌ No authorization header provided');
    return {
      statusCode: 401,
      body: JSON.stringify({ message: "No token provided" }),
      headers: HEADERS.json,
    };
  }

  if (!authorization.startsWith("Bearer ")) {
    console.warn('❌ Authorization header does not start with "Bearer ":', authorization.substring(0, 20));
    return {
      statusCode: 401,
      body: JSON.stringify({ message: "Invalid Bearer token" }),
      headers: HEADERS.json,
    };
  }

  const token = authorization.split(" ").at(1) || "";

  if (!token) {
    console.warn('❌ Token is empty after splitting');
    return {
      statusCode: 401,
      body: JSON.stringify({ message: "Invalid token format" }),
      headers: HEADERS.json,
    };
  }

  try {
    console.log('🔐 Validating token, length:', token.length);
    const payload = await JwtAdapter.validateToken<EmailResponse>(token);

    if (!payload) {
      console.error('❌ JWT validation failed - payload is null/undefined');
      return {
        statusCode: 401,
        body: JSON.stringify({ message: "Invalid token" }),
        headers: HEADERS.json,
      };
    }

    console.log('✅ JWT validation successful, payload:', {
      email: payload.email,
      id: (payload as any).id
    });

    // ✅ CORREGIDO: Usar findOne sin especificar campos para obtener TODOS los campos
    const user = await userService.findOne(usersTable.email, payload.email);

    if (!user) {
      console.error('❌ User not found for email:', payload.email);
      return {
        statusCode: 401,
        body: JSON.stringify({ message: "Invalid token - User not found" }),
        headers: HEADERS.json,
      };
    }

    console.log('✅ Usuario encontrado en auth middleware:', { id: user.id, email: user.email });

    // ✅ VALIDAR SI LA CUENTA HA EXPIRADO
    if (user.expirationDate) {
      const now = new Date();
      if (now > new Date(user.expirationDate)) {
        console.warn('⏰ Cuenta expirada para usuario:', user.email);
        return {
          statusCode: 401,
          body: JSON.stringify({
            message: "Tu cuenta de prueba ha expirado",
            code: "ACCOUNT_EXPIRED"
          }),
          headers: HEADERS.json,
        };
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify(user),
      headers: HEADERS.json,
    };
  } catch (error) {
    console.error('❌ Error en validateJWT:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error", error: String(error) }),
      headers: HEADERS.json,
    };
  }
};