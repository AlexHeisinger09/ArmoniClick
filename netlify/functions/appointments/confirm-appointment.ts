// netlify/functions/appointments/confirm-appointment.ts - TIPOS CORREGIDOS
import { Handler, HandlerEvent } from "@netlify/functions";
import { HEADERS } from "../../config/utils";
import { db } from "../../data/db";
import { appointmentsTable } from "../../data/schemas/appointment.schema";
import { eq } from "drizzle-orm";

const handler: Handler = async (event: HandlerEvent) => {
  console.log('🔍 Confirm appointment function called:', {
    httpMethod: event.httpMethod,
    path: event.path,
    headers: event.headers,
    queryStringParameters: event.queryStringParameters
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
    console.log('❌ Method not allowed:', httpMethod);
    return {
      statusCode: 405,
      body: JSON.stringify({
        message: "Method Not Allowed"
      }),
      headers: HEADERS.json,
    };
  }

  try {
    // ✅ CORREGIDO - Solo parsing manual del path (sin pathParameters)
    console.log('🔍 Extracting token from path:', path);
    
    let confirmationToken: string | null = null;
    
    const pathParts = path.split('/');
    console.log('🔍 Path parts:', pathParts);
    
    // Buscar el índice después de 'confirm-appointment' o 'appointments-confirm-appointment'
    const confirmIndex = pathParts.findIndex(part => 
      part === 'appointments-confirm-appointment' || 
      part === 'confirm-appointment'
    );
    
    if (confirmIndex !== -1 && pathParts[confirmIndex + 1]) {
      confirmationToken = pathParts[confirmIndex + 1];
      console.log('✅ Token found by parsing:', confirmationToken);
    } else {
      // Método alternativo: tomar el último segmento que no esté vacío
      const lastSegment = pathParts[pathParts.length - 1];
      if (lastSegment && lastSegment.length > 10) { // tokens son largos
        confirmationToken = lastSegment;
        console.log('✅ Token found as last segment:', confirmationToken);
      }
    }

    if (!confirmationToken) {
      console.log('❌ No token found in path:', path);
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Token de confirmación requerido"
        }),
        headers: HEADERS.json,
      };
    }

    console.log('🔍 Confirming appointment with token:', confirmationToken);

    // Buscar la cita por token
    const appointments = await db
      .select()
      .from(appointmentsTable)
      .where(eq(appointmentsTable.confirmationToken, confirmationToken))
      .limit(1);

    const appointment = appointments[0];
    console.log('🔍 Found appointment:', appointment ? { id: appointment.id, status: appointment.status } : null);

    if (!appointment) {
      console.log('❌ Appointment not found for token:', confirmationToken);
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: "Cita no encontrada o token inválido"
        }),
        headers: HEADERS.json,
      };
    }

    // Verificar si la cita ya está confirmada
    if (appointment.status === 'confirmed') {
      console.log('⚠️ Appointment already confirmed:', appointment.id);
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

    // Verificar que la cita no esté cancelada
    if (appointment.status === 'cancelled') {
      console.log('❌ Cannot confirm cancelled appointment:', appointment.id);
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "No se puede confirmar una cita cancelada"
        }),
        headers: HEADERS.json,
      };
    }

    // Verificar que la cita no haya pasado
    const appointmentDate = new Date(appointment.appointmentDate);
    const now = new Date();
    
    if (appointmentDate < now) {
      console.log('❌ Cannot confirm past appointment:', {
        appointmentId: appointment.id,
        appointmentDate: appointmentDate.toISOString(),
        now: now.toISOString()
      });
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "No se puede confirmar una cita que ya pasó"
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

    console.log('✅ Appointment confirmed successfully:', updatedAppointment.id);

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
    console.error("❌ Error confirming appointment:", error);
    console.error("❌ Error stack:", error.stack);
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