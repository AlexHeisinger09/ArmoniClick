// netlify/services/token.service.ts
import { randomBytes, createHash } from 'crypto';

export class TokenService {
  // Generar token único para confirmación de cita
  static generateConfirmationToken(): string {
    const timestamp = Date.now().toString();
    const randomData = randomBytes(16).toString('hex');
    const combined = timestamp + randomData;
    
    // Crear hash SHA-256 para mayor seguridad
    return createHash('sha256').update(combined).digest('hex').substring(0, 32);
  }

  // Verificar si un token es válido (opcional, para validaciones futuras)
  static isValidToken(token: string): boolean {
    return typeof token === 'string' && token.length === 32;
  }

  // Generar token con expiración (para futuras implementaciones)
  static generateTokenWithExpiry(hoursValid: number = 48): { token: string; expiresAt: Date } {
    const token = this.generateConfirmationToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + hoursValid);
    
    return { token, expiresAt };
  }
}