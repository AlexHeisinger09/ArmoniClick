import { envs } from "../envs";

import { StringValue } from "ms";
import jwt from "jsonwebtoken";

const JWT_SEED = envs.JWT_SEED;

export class JwtAdapter {
  static async generateToken(
    payload: any,
    duration: StringValue | undefined = "2h"
  ) {
    return new Promise((resolve) => {
      jwt.sign(payload, JWT_SEED, { expiresIn: duration }, (err, token) => {
        if (err) return resolve(null);

        resolve(token);
      });
    });
  }

  static validateToken<T>(token: string): Promise<T | null> {
    return new Promise((resolve) => {
      jwt.verify(token, JWT_SEED, (err, decoded) => {
        if (err) {
          console.error('❌ JWT verification error:', {
            errorName: err.name,
            errorMessage: err.message,
            tokenLength: token.length,
            jwtSeedLength: JWT_SEED.length
          });
          return resolve(null);
        }

        console.log('✅ JWT verified successfully');
        resolve(decoded as T);
      });
    });
  }
}
