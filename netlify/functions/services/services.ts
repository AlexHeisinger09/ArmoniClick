// netlify/functions/services/services.ts
import type { HandlerEvent, Handler } from "@netlify/functions";
import { db } from "../../data/db";
import { servicesTable } from "../../data/schemas/service.schema";
import { eq, and, desc } from "drizzle-orm";
import { fromBodyToObject, HEADERS } from "../../config/utils";
import { validateJWT } from "../../middlewares";

const handler: Handler = async (event: HandlerEvent) => {
  const { httpMethod, path } = event;
  const body = event.body ? fromBodyToObject(event.body) : {};

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

  try {
    // GET /services - Obtener todos los servicios del usuario
    if (httpMethod === "GET" && !path.includes('/services/')) {
      const services = await db
        .select()
        .from(servicesTable)
        .where(
          and(
            eq(servicesTable.user_id, userId),
            eq(servicesTable.is_active, true)
          )
        )
        .orderBy(desc(servicesTable.created_at));

      return {
        statusCode: 200,
        body: JSON.stringify({
          services,
          total: services.length,
        }),
        headers: HEADERS.json,
      };
    }

    // GET /services/:id - Obtener servicio específico
    if (httpMethod === "GET" && path.includes('/services/')) {
      const pathParts = path.split('/');
      const serviceId = parseInt(pathParts[pathParts.length - 1]);

      if (!serviceId || isNaN(serviceId)) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: "ID de servicio inválido" }),
          headers: HEADERS.json,
        };
      }

      const service = await db
        .select()
        .from(servicesTable)
        .where(
          and(
            eq(servicesTable.id, serviceId),
            eq(servicesTable.user_id, userId)
          )
        );

      if (!service[0]) {
        return {
          statusCode: 404,
          body: JSON.stringify({ message: "Servicio no encontrado" }),
          headers: HEADERS.json,
        };
      }

      return {
        statusCode: 200,
        body: JSON.stringify({ service: service[0] }),
        headers: HEADERS.json,
      };
    }

    // POST /services - Crear servicio
    if (httpMethod === "POST") {
      const { nombre, tipo, valor } = body;

      // Validaciones
      if (!nombre || !tipo || !valor) {
        return {
          statusCode: 400,
          body: JSON.stringify({ 
            message: "Todos los campos son requeridos" 
          }),
          headers: HEADERS.json,
        };
      }

      if (!['odontologico', 'estetica'].includes(tipo)) {
        return {
          statusCode: 400,
          body: JSON.stringify({ 
            message: "Tipo debe ser 'odontologico' o 'estetica'" 
          }),
          headers: HEADERS.json,
        };
      }

      const valorNum = parseFloat(valor.toString().replace(/\./g, ''));
      if (isNaN(valorNum) || valorNum <= 0) {
        return {
          statusCode: 400,
          body: JSON.stringify({ 
            message: "Valor debe ser un número válido mayor a 0" 
          }),
          headers: HEADERS.json,
        };
      }

      const [newService] = await db
        .insert(servicesTable)
        .values({
          user_id: userId,
          nombre: nombre.trim(),
          tipo: tipo.trim(),
          valor: valorNum.toString(),
          created_at: new Date(),
        })
        .returning();

      return {
        statusCode: 201,
        body: JSON.stringify({
          message: "Servicio creado exitosamente",
          service: newService,
        }),
        headers: HEADERS.json,
      };
    }

    // PUT /services/:id - Actualizar servicio
    if (httpMethod === "PUT" && path.includes('/services/')) {
      const pathParts = path.split('/');
      const serviceId = parseInt(pathParts[pathParts.length - 1]);

      if (!serviceId || isNaN(serviceId)) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: "ID de servicio inválido" }),
          headers: HEADERS.json,
        };
      }

      const { nombre, tipo, valor } = body;

      // Validaciones
      if (!nombre || !tipo || !valor) {
        return {
          statusCode: 400,
          body: JSON.stringify({ 
            message: "Todos los campos son requeridos" 
          }),
          headers: HEADERS.json,
        };
      }

      if (!['odontologico', 'estetica'].includes(tipo)) {
        return {
          statusCode: 400,
          body: JSON.stringify({ 
            message: "Tipo debe ser 'odontologico' o 'estetica'" 
          }),
          headers: HEADERS.json,
        };
      }

      const valorNum = parseFloat(valor.toString().replace(/\./g, ''));
      if (isNaN(valorNum) || valorNum <= 0) {
        return {
          statusCode: 400,
          body: JSON.stringify({ 
            message: "Valor debe ser un número válido mayor a 0" 
          }),
          headers: HEADERS.json,
        };
      }

      // Verificar que el servicio existe y pertenece al usuario
      const existingService = await db
        .select()
        .from(servicesTable)
        .where(
          and(
            eq(servicesTable.id, serviceId),
            eq(servicesTable.user_id, userId)
          )
        );

      if (!existingService[0]) {
        return {
          statusCode: 404,
          body: JSON.stringify({ message: "Servicio no encontrado" }),
          headers: HEADERS.json,
        };
      }

      const [updatedService] = await db
        .update(servicesTable)
        .set({
          nombre: nombre.trim(),
          tipo: tipo.trim(),
          valor: valorNum.toString(),
          updated_at: new Date(),
        })
        .where(eq(servicesTable.id, serviceId))
        .returning();

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Servicio actualizado exitosamente",
          service: updatedService,
        }),
        headers: HEADERS.json,
      };
    }

    // DELETE /services/:id - Eliminar servicio (soft delete)
    if (httpMethod === "DELETE" && path.includes('/services/')) {
      const pathParts = path.split('/');
      const serviceId = parseInt(pathParts[pathParts.length - 1]);

      if (!serviceId || isNaN(serviceId)) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: "ID de servicio inválido" }),
          headers: HEADERS.json,
        };
      }

      // Verificar que el servicio existe y pertenece al usuario
      const existingService = await db
        .select()
        .from(servicesTable)
        .where(
          and(
            eq(servicesTable.id, serviceId),
            eq(servicesTable.user_id, userId)
          )
        );

      if (!existingService[0]) {
        return {
          statusCode: 404,
          body: JSON.stringify({ message: "Servicio no encontrado" }),
          headers: HEADERS.json,
        };
      }

      await db
        .update(servicesTable)
        .set({
          is_active: false,
          updated_at: new Date(),
        })
        .where(eq(servicesTable.id, serviceId));

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Servicio eliminado exitosamente",
        }),
        headers: HEADERS.json,
      };
    }

    // Método no permitido
    return {
      statusCode: 405,
      body: JSON.stringify({ message: "Method Not Allowed" }),
      headers: HEADERS.json,
    };

  } catch (error: any) {
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