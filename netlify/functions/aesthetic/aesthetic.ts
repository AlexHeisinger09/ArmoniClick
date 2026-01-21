// netlify/functions/aesthetic/aesthetic.ts
import type { HandlerEvent, Handler } from "@netlify/functions";
import { fromBodyToObject, HEADERS } from "../../config/utils";
import { validateJWT } from "../../middlewares";
import { db } from "../../data/db";
import { setTenantContext } from "../../config/tenant-context";
import { aestheticNotesTable } from "../../data/schemas";
import { eq, and, desc } from "drizzle-orm";

const handler: Handler = async (event: HandlerEvent) => {
  const { httpMethod, path } = event;
  const body = event.body ? fromBodyToObject(event.body) : {};

  // Manejar preflight CORS
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: HEADERS.json,
    };
  }

  // Validar autenticación
  const user = await validateJWT(event.headers.authorization!);
  if (user.statusCode !== 200) return user;

  const userData = JSON.parse(user.body);
  const doctorId = userData.id;

  // Setear contexto de tenant para Row-Level Security
  await setTenantContext(db, doctorId);

  // Extraer parámetros de la URL
  const pathParts = path.split('/');
  const aestheticIndex = pathParts.findIndex(part => part === 'aesthetic');

  try {
    // POST /aesthetic/patient/{patientId} - Guardar ficha estética
    if (httpMethod === "POST" && path.includes('/patient/')) {
      const patientId = pathParts[aestheticIndex + 2] ? parseInt(pathParts[aestheticIndex + 2]) : null;

      if (!patientId || isNaN(patientId)) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "ID de paciente inválido",
          }),
          headers: HEADERS.json,
        };
      }

      const { budgetId, facialData, drawingsData, gender } = body;

      if (!facialData || !drawingsData) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "Datos de ficha estética incompletos",
          }),
          headers: HEADERS.json,
        };
      }

      // Insertar la ficha estética
      const [aestheticNote] = await db.insert(aestheticNotesTable).values({
        patient_id: patientId,
        doctor_id: doctorId,
        budget_id: budgetId ? parseInt(budgetId) : null,
        facial_data: facialData,
        drawings_data: drawingsData,
        gender: gender || 'female',
      }).returning();

      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          aestheticNoteId: aestheticNote.id,
          message: "Ficha estética guardada exitosamente",
        }),
        headers: HEADERS.json,
      };
    }

    // GET /aesthetic/patient/{patientId} - Obtener todas las fichas estéticas de un paciente
    if (httpMethod === "GET" && path.includes('/patient/') && !path.includes('/budget/')) {
      const patientId = pathParts[aestheticIndex + 2] ? parseInt(pathParts[aestheticIndex + 2]) : null;

      if (!patientId || isNaN(patientId)) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "ID de paciente inválido",
          }),
          headers: HEADERS.json,
        };
      }

      const notes = await db
        .select()
        .from(aestheticNotesTable)
        .where(
          and(
            eq(aestheticNotesTable.patient_id, patientId),
            eq(aestheticNotesTable.doctor_id, doctorId)
          )
        )
        .orderBy(desc(aestheticNotesTable.created_at));

      return {
        statusCode: 200,
        body: JSON.stringify(notes),
        headers: HEADERS.json,
      };
    }

    // GET /aesthetic/budget/{budgetId} - Obtener ficha estética por presupuesto
    if (httpMethod === "GET" && path.includes('/budget/')) {
      const budgetId = pathParts[aestheticIndex + 2] ? parseInt(pathParts[aestheticIndex + 2]) : null;

      if (!budgetId || isNaN(budgetId)) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "ID de presupuesto inválido",
          }),
          headers: HEADERS.json,
        };
      }

      const [note] = await db
        .select()
        .from(aestheticNotesTable)
        .where(
          and(
            eq(aestheticNotesTable.budget_id, budgetId),
            eq(aestheticNotesTable.doctor_id, doctorId)
          )
        )
        .orderBy(desc(aestheticNotesTable.created_at))
        .limit(1);

      return {
        statusCode: 200,
        body: JSON.stringify(note || null),
        headers: HEADERS.json,
      };
    }

    // Ruta no encontrada
    return {
      statusCode: 404,
      body: JSON.stringify({
        message: "Ruta no encontrada",
      }),
      headers: HEADERS.json,
    };
  } catch (error) {
    console.error("Error en endpoint de aesthetic:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error interno del servidor",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      headers: HEADERS.json,
    };
  }
};

export { handler };
