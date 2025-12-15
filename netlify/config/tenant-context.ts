// netlify/config/tenant-context.ts
// Helper para manejar Row-Level Security (RLS) y contexto de tenant

import { sql } from "drizzle-orm";
import type { NeonDatabase } from "drizzle-orm/neon-serverless";

/**
 * Establece el contexto de tenant (doctor) para Row-Level Security
 *
 * IMPORTANTE: Debe llamarse ANTES de cualquier query a la base de datos
 * después de validar el JWT del usuario.
 *
 * @param db - Instancia de Drizzle DB
 * @param doctorId - ID del doctor autenticado
 *
 * @example
 * ```typescript
 * const { id: doctorId } = await validateJWT(token);
 * await setTenantContext(db, doctorId);
 * // Ahora todas las queries solo ven datos de este doctor
 * const patients = await db.select().from(patientsTable);
 * ```
 */
export async function setTenantContext(
  db: NeonDatabase<any>,
  doctorId: number
): Promise<void> {
  try {
    // Setear el ID del doctor actual en la sesión de PostgreSQL
    // RLS usará este valor para filtrar automáticamente todas las queries
    // NOTA: Usamos sql.raw() porque SET no acepta placeholders en Neon
    // NOTA 2: Usamos SET (sin LOCAL) para que persista durante toda la sesión/conexión del pool
    await db.execute(
      sql.raw(`SET app.current_doctor_id = '${doctorId}'`)
    );
  } catch (error) {
    console.error('[Tenant Context] Error setting tenant context:', error);
    throw new Error('Failed to set tenant isolation context');
  }
}

/**
 * Limpia el contexto de tenant (opcional, se limpia automáticamente al final de la transacción)
 *
 * @param db - Instancia de Drizzle DB
 */
export async function clearTenantContext(
  db: NeonDatabase<any>
): Promise<void> {
  try {
    await db.execute(sql.raw(`RESET app.current_doctor_id`));
  } catch (error) {
    console.error('[Tenant Context] Error clearing tenant context:', error);
  }
}

/**
 * Obtiene el ID del tenant actual (para debugging)
 *
 * @param db - Instancia de Drizzle DB
 * @returns ID del doctor actual o null si no está seteado
 */
export async function getCurrentTenantId(
  db: NeonDatabase<any>
): Promise<number | null> {
  try {
    const result = await db.execute<{ current_setting: string }>(
      sql`SELECT current_setting('app.current_doctor_id', true) as current_setting`
    );

    const setting = result.rows[0]?.current_setting;
    return setting ? parseInt(setting, 10) : null;
  } catch (error) {
    console.error('[Tenant Context] Error getting current tenant:', error);
    return null;
  }
}

/**
 * Middleware helper que combina validación JWT + contexto de tenant
 *
 * @param db - Instancia de Drizzle DB
 * @param authHeader - Header de autorización (Bearer token)
 * @param validateJWT - Función de validación JWT
 * @returns Objeto con el usuario validado y doctorId
 *
 * @example
 * ```typescript
 * import { setupTenantFromAuth } from '@/config/tenant-context';
 *
 * export const handler = async (event) => {
 *   const db = await getDB();
 *
 *   try {
 *     const { user, doctorId } = await setupTenantFromAuth(
 *       db,
 *       event.headers.authorization!,
 *       JwtAdapter.validateToken
 *     );
 *
 *     // Ahora todas las queries están aisladas por tenant
 *     const patients = await db.select().from(patientsTable);
 *
 *     return { statusCode: 200, body: JSON.stringify(patients) };
 *   } catch (error) {
 *     return { statusCode: 401, body: 'Unauthorized' };
 *   }
 * };
 * ```
 */
export async function setupTenantFromAuth<T extends { id: number }>(
  db: NeonDatabase<any>,
  authHeader: string,
  validateJWT: (token: string) => Promise<T>
): Promise<{ user: T; doctorId: number }> {
  // Validar JWT
  const user = await validateJWT(authHeader);

  // Setear contexto de tenant
  await setTenantContext(db, user.id);

  return { user, doctorId: user.id };
}

/**
 * Verificar que RLS está habilitado en una tabla
 * Útil para tests y debugging
 *
 * @param db - Instancia de Drizzle DB
 * @param tableName - Nombre de la tabla a verificar
 * @returns true si RLS está habilitado
 */
export async function isRLSEnabled(
  db: NeonDatabase<any>,
  tableName: string
): Promise<boolean> {
  try {
    const result = await db.execute<{ relrowsecurity: boolean }>(
      sql`
        SELECT relrowsecurity
        FROM pg_class
        WHERE relname = ${tableName}
      `
    );

    return result.rows[0]?.relrowsecurity ?? false;
  } catch (error) {
    console.error(`[RLS Check] Error checking RLS for table ${tableName}:`, error);
    return false;
  }
}

/**
 * Obtener todas las políticas RLS activas (para debugging)
 *
 * @param db - Instancia de Drizzle DB
 * @returns Array de políticas RLS
 */
export async function getRLSPolicies(
  db: NeonDatabase<any>
): Promise<Array<{ tablename: string; policyname: string }>> {
  try {
    const result = await db.execute<{ tablename: string; policyname: string }>(
      sql`
        SELECT tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
        ORDER BY tablename, policyname
      `
    );

    return result.rows;
  } catch (error) {
    console.error('[RLS Policies] Error getting RLS policies:', error);
    return [];
  }
}
