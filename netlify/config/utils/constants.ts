import { envs } from '../envs';

// Función para obtener el header CORS dinámicamente basado en el origin de la petición
export function getCORSHeaders(origin?: string): Record<string, string> {
  const allowedOrigins = [envs.FRONTEND_URL];

  // Si FRONTEND_URL es armoniclick.cl, permitir también www.armoniclick.cl
  if (envs.FRONTEND_URL.includes('armoniclick.cl')) {
    allowedOrigins.push('https://www.armoniclick.cl');
  }

  // Verificar si el origin de la petición está en la lista de permitidos
  const allowOrigin = origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
    "Content-Type": "application/json",
  };
}

// Determine CORS origin based on FRONTEND_URL
let corsOrigin = envs.FRONTEND_URL;
if (envs.FRONTEND_URL.includes('armoniclick.cl')) {
  // For armoniclick.cl, we'll use wildcard domain to accept both with and without www
  // This is handled via getCORSHeaders() in handlers that need it
  // For now, use armoniclick.cl as default
  corsOrigin = 'https://armoniclick.cl';
}

const CORS = {
  "Access-Control-Allow-Origin": corsOrigin,
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
};

export const HEADERS = {
  json: {
    ...CORS,
    "Content-Type": "application/json",
  },
};