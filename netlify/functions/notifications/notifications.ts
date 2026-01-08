import { Handler, HandlerEvent } from "@netlify/functions";
import { HEADERS } from "../../config/utils";
import { validateJWT } from "../../middlewares";
import { db } from "../../data/db";
import { notificationsTable } from "../../data/schemas/notification.schema";
import { eq, desc, and } from "drizzle-orm";

const handler: Handler = async (event: HandlerEvent) => {
  const { httpMethod, path } = event;

  // Manejar preflight OPTIONS
  if (httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: HEADERS.json,
    };
  }

  // Validar autenticación
  const authHeader = event.headers.authorization;
  if (!authHeader) {
    return {
      statusCode: 401,
      body: JSON.stringify({
        message: "No autorizado - Token no proporcionado"
      }),
      headers: HEADERS.json,
    };
  }

  const userResult = await validateJWT(authHeader);
  if (userResult.statusCode !== 200) {
    return userResult;
  }

  const user = JSON.parse(userResult.body);

  try {
    // GET /notifications - Obtener notificaciones del doctor
    if (httpMethod === "GET") {
      const notifications = await db
        .select()
        .from(notificationsTable)
        .where(eq(notificationsTable.doctorId, user.id))
        .orderBy(desc(notificationsTable.createdAt))
        .limit(20); // Últimas 20 notificaciones

      return {
        statusCode: 200,
        body: JSON.stringify(notifications),
        headers: HEADERS.json,
      };
    }

    // PUT /notifications/mark-read - Marcar notificaciones como leídas
    if (httpMethod === "PUT" && path.includes("/mark-read")) {
      // Marcar todas las notificaciones no leídas como leídas
      await db
        .update(notificationsTable)
        .set({
          isRead: true,
          readAt: new Date(),
          updatedAt: new Date()
        })
        .where(
          and(
            eq(notificationsTable.doctorId, user.id),
            eq(notificationsTable.isRead, false)
          )
        );

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Notificaciones marcadas como leídas"
        }),
        headers: HEADERS.json,
      };
    }

    // PUT /notifications/:id/mark-read - Marcar una notificación específica como leída
    if (httpMethod === "PUT" && path.match(/\/notifications\/\d+$/)) {
      const notificationId = parseInt(path.split("/").pop() || "0");

      if (!notificationId) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "ID de notificación inválido"
          }),
          headers: HEADERS.json,
        };
      }

      const [updatedNotification] = await db
        .update(notificationsTable)
        .set({
          isRead: true,
          readAt: new Date(),
          updatedAt: new Date()
        })
        .where(
          and(
            eq(notificationsTable.id, notificationId),
            eq(notificationsTable.doctorId, user.id)
          )
        )
        .returning();

      if (!updatedNotification) {
        return {
          statusCode: 404,
          body: JSON.stringify({
            message: "Notificación no encontrada"
          }),
          headers: HEADERS.json,
        };
      }

      return {
        statusCode: 200,
        body: JSON.stringify(updatedNotification),
        headers: HEADERS.json,
      };
    }

    // DELETE /notifications/:id - Eliminar una notificación
    if (httpMethod === "DELETE") {
      const notificationId = parseInt(path.split("/").pop() || "0");

      if (!notificationId) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "ID de notificación inválido"
          }),
          headers: HEADERS.json,
        };
      }

      await db
        .delete(notificationsTable)
        .where(
          and(
            eq(notificationsTable.id, notificationId),
            eq(notificationsTable.doctorId, user.id)
          )
        );

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Notificación eliminada"
        }),
        headers: HEADERS.json,
      };
    }

    return {
      statusCode: 405,
      body: JSON.stringify({
        message: "Method Not Allowed"
      }),
      headers: HEADERS.json,
    };

  } catch (error: any) {
    console.error("Error in notifications function:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: error.message || "Error interno del servidor"
      }),
      headers: HEADERS.json,
    };
  }
};

export { handler };
