// netlify/functions/patients/patient-history.ts
import { Handler } from '@netlify/functions';
import { db } from '../../data/db';
import { auditLogsTable, usersTable } from '../../data/schemas';
import { eq, sql } from 'drizzle-orm';
import { validateJWT, getAuthorizationHeader } from '../../middlewares/auth.middleware';
import { setTenantContext } from '../../config/tenant-context';

const handler: Handler = async (event) => {
  // Solo permitir GET
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Método no permitido' }),
    };
  }

  try {
    // Validar JWT
    const authHeader = getAuthorizationHeader(event.headers);
    const user = await validateJWT(authHeader || '');
    if (user.statusCode !== 200) return user;

    const userData = JSON.parse(user.body);

    // ✅ NUEVO: Setear contexto de tenant para Row-Level Security
    await setTenantContext(db, userData.id);

    // Obtener patientId del path
    const patientIdStr = event.path.split('/').pop();
    const patientId = parseInt(patientIdStr || '0');

    if (!patientId || patientId <= 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'ID de paciente inválido' }),
      };
    }

    console.log('📋 Obteniendo historial del paciente:', patientId);

    // Obtener logs de auditoría con información del doctor
    const logs = await db
      .select({
        id: auditLogsTable.id,
        patient_id: auditLogsTable.patient_id,
        entity_type: auditLogsTable.entity_type,
        entity_id: auditLogsTable.entity_id,
        action: auditLogsTable.action,
        old_values: auditLogsTable.old_values,
        new_values: auditLogsTable.new_values,
        changed_by: auditLogsTable.changed_by,
        created_at: auditLogsTable.created_at,
        notes: auditLogsTable.notes,
        doctor_name: sql`COALESCE(${usersTable.name}, 'Desconocido') || ' ' || COALESCE(${usersTable.lastName}, '')`,
      })
      .from(auditLogsTable)
      .leftJoin(usersTable, eq(auditLogsTable.changed_by, usersTable.id))
      .where(eq(auditLogsTable.patient_id, patientId))
      .orderBy((t) => t.created_at); // Orden ascendente para histórico

    console.log(`✅ Se obtuvieron ${logs.length} registros de auditoría`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        patientId,
        totalLogs: logs.length,
        logs: logs.map((log) => ({
          ...log,
          old_values: log.old_values
            ? typeof log.old_values === 'string'
              ? JSON.parse(log.old_values)
              : log.old_values
            : null,
          new_values: log.new_values
            ? typeof log.new_values === 'string'
              ? JSON.parse(log.new_values)
              : log.new_values
            : null,
        })),
      }),
    };
  } catch (error: any) {
    console.error('❌ Error en patient-history:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error al obtener historial',
        error: error.message,
      }),
    };
  }
};

export { handler };
