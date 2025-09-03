// netlify/data/db.ts - CONFIGURACIÓN SIMPLE SIN CONVERSIONES AUTOMÁTICAS
import { envs } from '../config/envs';

import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { sql } from "drizzle-orm";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

// ✅ CONFIGURAR POOL SIMPLE
const pool = new Pool({ 
  connectionString: envs.DATABASE_URL,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
});

export const db = drizzle(pool);

// ✅ FUNCIÓN SIMPLE PARA EVITAR CONVERSIONES DE TIMEZONE
export const setupChileTimezone = async () => {
  try {
    // REMOVER CONFIGURACIONES DE TIMEZONE QUE CAUSAN CONVERSIONES
    console.log('✅ Using simple datetime without timezone conversions');
    return true;
  } catch (error) {
    console.error('❌ Error in timezone setup:', error);
    return false;
  }
};

// ✅ FUNCIÓN PARA VERIFICAR COMO SE GUARDAN LAS FECHAS
export const checkCurrentTimezone = async () => {
  try {
    const result = await db.execute(sql`
      SELECT 
        current_setting('timezone') as current_timezone,
        NOW() as current_time,
        '2025-09-04 09:00:00'::timestamp as simple_timestamp
    `);
    
    console.log('🔍 Database timezone status:', result.rows[0]);
    return result.rows[0];
  } catch (error) {
    console.error('❌ Error checking timezone:', error);
    return null;
  }
};