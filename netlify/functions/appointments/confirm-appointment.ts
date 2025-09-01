// netlify/functions/appointments/confirm-appointment.ts
import { Handler, HandlerEvent } from "@netlify/functions";
import { HEADERS } from "../../config/utils";
import { AppointmentService } from "../../services/appointment.service";
import { db } from "../../data/db";
import { appointmentsTable } from "../../data/schemas/appointment.schema";
import { eq } from "drizzle-orm";

const handler: Handler = async (event: HandlerEvent) => {
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
    // Extraer token de la URL
    const pathParts = path.split('/');
    const tokenIndex = pathParts.findIndex(part => part === 'confirm-appointment') + 1;
    const confirmationToken = pathParts[tokenIndex];

    if (!confirmationToken) {
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

    if (!appointment) {
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
    console.error("❌ Error confirming appointment:", error);
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