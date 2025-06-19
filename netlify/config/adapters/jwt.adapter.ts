import { envs } from "../envs";

import { StringValue } from "ms";
import jwt from "jsonwebtoken";

const JWT_SEED = envs.JWT_SEED;

export class JwtAdapter {
  static async generateToken(
    payload: any,
    duration: StringValue | undefined = "2h"
  ) {
    console.log('🔐 Generating JWT token with payload:', payload); // Debug
    console.log('🔐 JWT_SEED available:', JWT_SEED ? 'Yes' : 'No'); // Debug
    console.log('🔐 Duration:', duration); // Debug
    
    return new Promise((resolve) => {
      jwt.sign(payload, JWT_SEED, { expiresIn: duration }, (err, token) => {
        if (err) {
          console.error('❌ Error generating token:', err); // Debug
          return resolve(null);
        }

        console.log('✅ Token generated successfully:', token ? `${token.substring(0, 20)}...` : 'No token'); // Debug
        resolve(token);
      });
    });
  }

  static validateToken<T>(token: string): Promise<T | null> {
    console.log('🔍 Validating JWT token:', token ? `${token.substring(0, 20)}...` : 'No token'); // Debug
    console.log('🔑 JWT_SEED for validation:', JWT_SEED ? 'Available' : 'Missing'); // Debug
    
    return new Promise((resolve) => {
      jwt.verify(token, JWT_SEED, (err, decoded) => {
        if (err) {
          console.error('❌ JWT validation error:', err.message); // Debug
          console.error('❌ JWT error details:', {
            name: err.name,
            message: err.message,
            expiredAt: (err as any).expiredAt,
          }); // Debug
          return resolve(null);
        }

        console.log('✅ JWT validation successful:', decoded); // Debug
        resolve(decoded as T);
      });
    });
  }
}