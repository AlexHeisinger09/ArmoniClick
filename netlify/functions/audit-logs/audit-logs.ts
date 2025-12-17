// netlify/functions/audit-logs/audit-logs.ts
import type { HandlerEvent, Handler } from "@netlify/functions";
import { HEADERS, fromBodyToObject } from "../../config/utils";
import { validateJWT } from "../../middlewares";
import { db } from "../../data/db";
import { setTenantContext } from "../../config/tenant-context";
import { auditLogsTable, AUDIT_ENTITY_TYPES, AUDIT_ACTIONS } from "../../data/schemas/audit.schema";
import { usersTable } from "../../data/schemas/user.schema";
import { eq, and, desc } from "drizzle-orm";

const handler: Handler = async (event: HandlerEvent) => {
  const { httpMethod, path, queryStringParameters } = event;

  // Manejar preflight CORS
  if (httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: HEADERS.json,
    };
  }

  // Validar autenticación
  const user = await validateJWT(event.headers.authorization!);
  if (user.statusCode !== 200) return user;

  const userData = JSON.parse(user.body);
  const userId = userData.id;

  // ✅ Setear contexto de tenant para Row-Level Security
  await setTenantContext(db, userId);

  // Extraer parámetros de la URL
  const pathParts = path.split('/');
  const auditLogsIndex = pathParts.findIndex(part => part === 'audit-logs');

  try {
    // ✅ GET /audit-logs/patient/{patientId} - Obtener audit logs de un paciente
    if (httpMethod === "GET" && path.includes('/patient/')) {
      const patientId = pathParts[auditLogsIndex + 2] ? parseInt(pathParts[auditLogsIndex + 2]) : null;

      if (!patientId || isNaN(patientId)) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "ID de paciente inválido",
          }),
          headers: HEADERS.json,
        };
      }

      // Obtener todos los audit logs del paciente con información del doctor
      const auditLogsRaw = await db
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
          // Datos del doctor que realizó el cambio
          doctor_name: usersTable.name,
          doctor_lastName: usersTable.lastName,
        })
        .from(auditLogsTable)
        .innerJoin(usersTable, eq(auditLogsTable.changed_by, usersTable.id))
        .where(eq(auditLogsTable.patient_id, patientId))
        .orderBy(desc(auditLogsTable.created_at));

      // ✅ Parsear old_values y new_values si vienen como strings JSON
      const auditLogs = auditLogsRaw.map(log => {
        let oldValues = log.old_values;
        let newValues = log.new_values;

        // Parsear old_values si es string
        if (typeof log.old_values === 'string') {
          try {
            oldValues = JSON.parse(log.old_values);
          } catch (e) {
            console.error('Error parsing old_values:', e);
            oldValues = null;
          }
        }

        // Parsear new_values si es string
        if (typeof log.new_values === 'string') {
          try {
            newValues = JSON.parse(log.new_values);
          } catch (e) {
            console.error('Error parsing new_values:', e);
            newValues = null;
          }
        }

        return {
          ...log,
          old_values: oldValues,
          new_values: newValues,
        };
      });

      return {
        statusCode: 200,
        body: JSON.stringify({
          auditLogs,
          total: auditLogs.length,
        }),
        headers: HEADERS.json,
      };
    }

    // Método no permitido
    return {
      statusCode: 405,
      body: JSON.stringify({
        message: "Method Not Allowed",
      }),
      headers: HEADERS.json,
    };

  } catch (error: any) {
    console.error('❌ Error en audit-logs:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error interno del servidor",
        error: error.message,
      }),
      headers: HEADERS.json,
    };
  }
};

export { handler };
