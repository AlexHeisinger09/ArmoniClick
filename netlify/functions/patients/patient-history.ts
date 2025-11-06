// netlify/functions/patients/patient-history.ts
import { Handler } from '@netlify/functions';
import { db } from '@/netlify/data/db';
import { auditLogsTable } from '@/netlify/data/schemas';
import { eq } from 'drizzle-orm';
import { validateJWT } from '@/netlify/middlewares/auth.middleware';
import { getAuthorizationHeader } from '@/netlify/middlewares/auth.middleware';

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

    // Obtener logs de auditoría ordenados por fecha descendente
    const logs = await db
      .select()
      .from(auditLogsTable)
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
          old_values: log.old_values ? JSON.parse(log.old_values as any) : null,
          new_values: log.new_values ? JSON.parse(log.new_values as any) : null,
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
