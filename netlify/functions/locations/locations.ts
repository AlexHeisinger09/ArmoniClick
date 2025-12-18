// netlify/functions/locations/locations.ts
import type { Context } from "@netlify/functions";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, and } from "drizzle-orm";
import { envs } from "../../config/envs";
import { validateJWT } from "../../middlewares";
import { fromBodyToObject, HEADERS } from "../../config/utils";
import { locationsTable } from "../../data/schemas/location.schema";

const sql = neon(envs.DATABASE_URL);
const db = drizzle(sql);

export default async (req: Request, context: Context) => {
  const url = new URL(req.url);
  const pathParts = url.pathname.split("/").filter(Boolean);
  const locationId = pathParts[pathParts.length - 1];

  // Manejar preflight CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      },
    });
  }

  // Validar JWT y obtener el ID del doctor
  const authHeader = req.headers.get("authorization");
  const user = await validateJWT(authHeader || "");
  if (user.statusCode !== 200) {
    return new Response(user.body, {
      status: user.statusCode,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  const userData = JSON.parse(user.body);
  const doctorId = userData.id;

  try {
    // GET - Obtener todas las ubicaciones del doctor o una específica
    if (req.method === "GET") {
      // Si hay un ID numérico al final de la ruta, obtener una ubicación específica
      if (locationId && !isNaN(Number(locationId))) {
        const location = await db
          .select()
          .from(locationsTable)
          .where(
            and(
              eq(locationsTable.id, Number(locationId)),
              eq(locationsTable.user_id, doctorId)
            )
          )
          .limit(1);

        if (location.length === 0) {
          return new Response(
            JSON.stringify({ error: "Ubicación no encontrada" }),
            { status: 404, headers: { "Content-Type": "application/json" } }
          );
        }

        return new Response(JSON.stringify(location[0]), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Obtener todas las ubicaciones del doctor
      const locations = await db
        .select()
        .from(locationsTable)
        .where(eq(locationsTable.user_id, doctorId))
        .orderBy(locationsTable.created_at);

      return new Response(JSON.stringify(locations), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // POST - Crear nueva ubicación
    if (req.method === "POST") {
      const bodyText = await req.text();
      const body = fromBodyToObject(bodyText);
      const { name, address, city, google_calendar_id, is_active } = body;

      // Validación de campos requeridos
      if (!name || !address || !city) {
        return new Response(
          JSON.stringify({
            error: "Los campos nombre, dirección y ciudad son obligatorios",
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      const newLocation = await db
        .insert(locationsTable)
        .values({
          user_id: doctorId,
          name: name.trim(),
          address: address.trim(),
          city: city.trim(),
          google_calendar_id: google_calendar_id || null,
          is_active: is_active ?? true,
        })
        .returning();

      return new Response(JSON.stringify(newLocation[0]), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    }

    // PUT - Actualizar ubicación existente
    if (req.method === "PUT") {
      if (!locationId || isNaN(Number(locationId))) {
        return new Response(
          JSON.stringify({ error: "ID de ubicación inválido" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      const bodyText = await req.text();
      const body = fromBodyToObject(bodyText);
      const { name, address, city, google_calendar_id, is_active } = body;

      // Verificar que la ubicación existe y pertenece al doctor
      const existingLocation = await db
        .select()
        .from(locationsTable)
        .where(
          and(
            eq(locationsTable.id, Number(locationId)),
            eq(locationsTable.user_id, doctorId)
          )
        )
        .limit(1);

      if (existingLocation.length === 0) {
        return new Response(
          JSON.stringify({ error: "Ubicación no encontrada" }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }

      const updatedLocation = await db
        .update(locationsTable)
        .set({
          name: name?.trim() || existingLocation[0].name,
          address: address?.trim() || existingLocation[0].address,
          city: city?.trim() || existingLocation[0].city,
          google_calendar_id: google_calendar_id !== undefined ? google_calendar_id : existingLocation[0].google_calendar_id,
          is_active: is_active !== undefined ? is_active : existingLocation[0].is_active,
          updated_at: new Date(),
        })
        .where(eq(locationsTable.id, Number(locationId)))
        .returning();

      return new Response(JSON.stringify(updatedLocation[0]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // DELETE - Eliminar ubicación
    if (req.method === "DELETE") {
      if (!locationId || isNaN(Number(locationId))) {
        return new Response(
          JSON.stringify({ error: "ID de ubicación inválido" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      // Verificar que la ubicación existe y pertenece al doctor
      const existingLocation = await db
        .select()
        .from(locationsTable)
        .where(
          and(
            eq(locationsTable.id, Number(locationId)),
            eq(locationsTable.user_id, doctorId)
          )
        )
        .limit(1);

      if (existingLocation.length === 0) {
        return new Response(
          JSON.stringify({ error: "Ubicación no encontrada" }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }

      await db
        .delete(locationsTable)
        .where(eq(locationsTable.id, Number(locationId)));

      return new Response(
        JSON.stringify({ message: "Ubicación eliminada correctamente" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Método no permitido
    return new Response(
      JSON.stringify({ error: "Método no permitido" }),
      { status: 405, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error en endpoint de ubicaciones:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Error interno del servidor" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
