// netlify/functions/confirm.ts - NOMBRE SIMPLE
import { Handler, HandlerEvent } from "@netlify/functions";
import { HEADERS } from "../config/utils";
import { db } from "../data/db";
import { appointmentsTable } from "../data/schemas/appointment.schema";
import { eq } from "drizzle-orm";

const handler: Handler = async (event: HandlerEvent) => {
  console.log('🔍 Confirm function called:', {
    httpMethod: event.httpMethod,
    path: event.path,
  });

  const { httpMethod, path } = event;

  // Manejar preflight OPTIONS
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: HEADERS.json,
    };
  }

  // Solo permitir GET
  if (httpMethod !== "GET") {
    return {
      statusCode: 405,
      body: JSON.stringify({
        message: "Method Not Allowed"
      }),
      headers: HEADERS.json,
    };
  }

  try {
    // Extraer token del query parameter
    const token = event.queryStringParameters?.token;
    
    if (!token) {
      console.log('❌ No token provided');
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Token de confirmación requerido"
        }),
        headers: HEADERS.json,
      };
    }

    console.log('🔍 Confirming appointment with token:', token);

    // Buscar la cita por token
    const appointments = await db
      .select()
      .from(appointmentsTable)
      .where(eq(appointmentsTable.confirmationToken, token))
      .limit(1);

    const appointment = appointments[0];
    
    if (!appointment) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: "Cita no encontrada o token inválido"
        }),
        headers: HEADERS.json,
      };
    }

    // Verificar si ya está confirmada
    if (appointment.status === 'confirmed') {
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "La cita ya estaba confirmada",
          appointment: {
            id: appointment.id,
            title: appointment.title,
            appointmentDate: appointment.appointmentDate,
            status: appointment.status
          }
        }),
        headers: HEADERS.json,
      };
    }

    // Confirmar la cita
    const [updatedAppointment] = await db
      .update(appointmentsTable)
      .set({
        status: 'confirmed',
        confirmedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(appointmentsTable.id, appointment.id))
      .returning();

    console.log('✅ Appointment confirmed:', updatedAppointment.id);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Cita confirmada exitosamente",
        appointment: {
          id: updatedAppointment.id,
          title: updatedAppointment.title,
          appointmentDate: updatedAppointment.appointmentDate,
          status: updatedAppointment.status,
          confirmedAt: updatedAppointment.confirmedAt
        }
      }),
      headers: HEADERS.json,
    };

  } catch (error: any) {
    console.error("❌ Error:", error);
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