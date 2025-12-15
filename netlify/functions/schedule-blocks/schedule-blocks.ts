// netlify/functions/schedule-blocks/schedule-blocks.ts
import { Handler, HandlerEvent } from "@netlify/functions";
import { validateJWT, getAuthorizationHeader } from "../../middlewares";
import { HEADERS, fromBodyToObject } from "../../config/utils";
import { db } from "../../data/db";
import { scheduleBlocksTable } from "../../data/schemas/schedule-block.schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { setTenantContext } from "../../config/tenant-context";

interface CreateScheduleBlockRequest {
  blockType: 'single_date' | 'recurring';
  blockDate: string;
  startTime: string;
  endTime: string;
  recurringPattern?: string;
  recurringEndDate?: string;
  reason?: string;
}

const handler: Handler = async (event: HandlerEvent) => {
  const { httpMethod, path, queryStringParameters } = event;
  const body = event.body ? fromBodyToObject(event.body) : {};

  // Manejar preflight OPTIONS
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: HEADERS.json,
    };
  }

  // Validar JWT
  const authHeader = getAuthorizationHeader(event.headers);
  const user = await validateJWT(authHeader || "");
  if (user.statusCode !== 200) return user;

  const userData = JSON.parse(user.body);
  const doctorId = userData.id;

  // ✅ NUEVO: Setear contexto de tenant para Row-Level Security
  await setTenantContext(db, doctorId);

  try {
    // Función auxiliar para extraer ID de la URL
    const extractBlockId = (path: string): number | null => {
      const pathSegments = path.split('/').filter(segment =>
        segment && segment !== '.netlify' && segment !== 'functions' && segment !== 'schedule-blocks'
      );
      const lastSegment = pathSegments[pathSegments.length - 1];

      if (lastSegment && !isNaN(parseInt(lastSegment))) {
        return parseInt(lastSegment);
      }
      return null;
    };

    const blockId = extractBlockId(path);
    const hasBlockId = blockId !== null;

    console.log('🔍 Schedule Blocks Debug:', {
      httpMethod,
      path,
      hasBlockId,
      blockId,
      queryStringParameters,
      doctorId
    });

    // GET /schedule-blocks - Obtener todos los bloqueos del doctor
    if (httpMethod === "GET" && !hasBlockId) {
      const blocks = await db
        .select()
        .from(scheduleBlocksTable)
        .where(eq(scheduleBlocksTable.doctorId, doctorId));

      return {
        statusCode: 200,
        body: JSON.stringify({
          blocks,
          total: blocks.length
        }),
        headers: HEADERS.json,
      };
    }

    // POST /schedule-blocks - Crear nuevo bloqueo
    if (httpMethod === "POST" && !hasBlockId) {
      const { blockType, blockDate, startTime, endTime, recurringPattern, recurringEndDate, reason } = body as CreateScheduleBlockRequest;

      // Validaciones básicas
      if (!blockType || !blockDate || !startTime || !endTime) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: "Datos requeridos faltantes" }),
          headers: HEADERS.json,
        };
      }

      if (startTime >= endTime) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: "La hora de fin debe ser posterior a la hora de inicio" }),
          headers: HEADERS.json,
        };
      }

      const newBlock = await db
        .insert(scheduleBlocksTable)
        .values({
          doctorId,
          blockType,
          blockDate: new Date(blockDate),
          startTime,
          endTime,
          recurringPattern: blockType === 'recurring' ? (recurringPattern || 'weekly') : undefined,
          recurringEndDate: recurringEndDate ? new Date(recurringEndDate) : undefined,
          reason: reason || undefined,
        })
        .returning();

      return {
        statusCode: 201,
        body: JSON.stringify({
          message: "Bloqueo de agenda creado exitosamente",
          block: newBlock[0]
        }),
        headers: HEADERS.json,
      };
    }

    // PUT /schedule-blocks/:blockId - Actualizar bloqueo
    if (httpMethod === "PUT" && hasBlockId) {
      // Verificar que el bloqueo pertenece al doctor
      const existingBlock = await db
        .select()
        .from(scheduleBlocksTable)
        .where(and(
          eq(scheduleBlocksTable.id, blockId),
          eq(scheduleBlocksTable.doctorId, doctorId)
        ));

      if (existingBlock.length === 0) {
        return {
          statusCode: 404,
          body: JSON.stringify({ message: "Bloqueo no encontrado" }),
          headers: HEADERS.json,
        };
      }

      const { blockType, blockDate, startTime, endTime, recurringPattern, recurringEndDate, reason } = body;

      // Validaciones básicas
      if (startTime && endTime && startTime >= endTime) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: "La hora de fin debe ser posterior a la hora de inicio" }),
          headers: HEADERS.json,
        };
      }

      const updateData: any = {};
      if (blockType) updateData.blockType = blockType;
      if (blockDate) updateData.blockDate = new Date(blockDate);
      if (startTime) updateData.startTime = startTime;
      if (endTime) updateData.endTime = endTime;
      if (recurringPattern) updateData.recurringPattern = recurringPattern;
      if (recurringEndDate !== undefined) updateData.recurringEndDate = recurringEndDate ? new Date(recurringEndDate) : null;
      if (reason !== undefined) updateData.reason = reason || null;

      const updatedBlock = await db
        .update(scheduleBlocksTable)
        .set(updateData)
        .where(eq(scheduleBlocksTable.id, blockId))
        .returning();

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Bloqueo de agenda actualizado exitosamente",
          block: updatedBlock[0]
        }),
        headers: HEADERS.json,
      };
    }

    // DELETE /schedule-blocks/:blockId - Eliminar bloqueo
    if (httpMethod === "DELETE" && hasBlockId) {
      // Verificar que el bloqueo pertenece al doctor
      const existingBlock = await db
        .select()
        .from(scheduleBlocksTable)
        .where(and(
          eq(scheduleBlocksTable.id, blockId),
          eq(scheduleBlocksTable.doctorId, doctorId)
        ));

      if (existingBlock.length === 0) {
        return {
          statusCode: 404,
          body: JSON.stringify({ message: "Bloqueo no encontrado" }),
          headers: HEADERS.json,
        };
      }

      await db
        .delete(scheduleBlocksTable)
        .where(eq(scheduleBlocksTable.id, blockId));

      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Bloqueo de agenda eliminado exitosamente" }),
        headers: HEADERS.json,
      };
    }

    // Método no permitido
    return {
      statusCode: 405,
      body: JSON.stringify({ message: "Método no permitido" }),
      headers: HEADERS.json,
    };
  } catch (error) {
    console.error("❌ Error en schedule-blocks:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error del servidor",
        error: error instanceof Error ? error.message : "Unknown error"
      }),
      headers: HEADERS.json,
    };
  }
};

export { handler };
