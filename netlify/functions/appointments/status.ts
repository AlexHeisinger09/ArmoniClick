// netlify/functions/appointments/status.ts
import { Handler, HandlerEvent } from "@netlify/functions";
import { validateJWT } from "../../middlewares";
import { HEADERS, fromBodyToObject } from "../../config/utils";
import { AppointmentService } from "../../services/appointment.service";

const handler: Handler = async (event: HandlerEvent) => {
  const { httpMethod, path } = event;
  const body = event.body ? fromBodyToObject(event.body) : {};

  // Manejar preflight OPTIONS
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: HEADERS.json,
    };
  }

  // Validar JWT
  const user = await validateJWT(event.headers.authorization!);
  if (user.statusCode !== 200) return user;

  const userData = JSON.parse(user.body);

  // Solo permitir PUT para actualizar estado
  if (httpMethod !== "PUT") {
    return {
      statusCode: 405,
      body: JSON.stringify({
        message: "Method Not Allowed"
      }),
      headers: HEADERS.json,
    };
  }

  try {
    // Extraer ID de la cita del path
    const appointmentId = parseInt(path.split("/").slice(-2, -1)[0] || "0");
    
    if (!appointmentId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "ID de cita inválido" }),
        headers: HEADERS.json,
      };
    }

    const { status, reason } = body;

    // Validar que se proporcione el nuevo estado
    if (!status) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "El estado es obligatorio"
        }),
        headers: HEADERS.json,
      };
    }

    // Validar estados permitidos
    const validStatuses = ["pending", "confirmed", "cancelled", "no-show", "completed"];
    if (!validStatuses.includes(status)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Estado no válido. Estados permitidos: " + validStatuses.join(", ")
        }),
        headers: HEADERS.json,
      };
    }

    // Si se cancela, se requiere razón
    if (status === "cancelled" && !reason) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "La razón de cancelación es obligatoria"
        }),
        headers: HEADERS.json,
      };
    }

    const updatedAppointment = await AppointmentService.updateStatus(
      appointmentId,
      userData.id,
      status,
      reason
    );

    if (!updatedAppointment) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Cita no encontrada" }),
        headers: HEADERS.json,
      };
    }

    let message = "Estado actualizado exitosamente";
    switch (status) {
      case "confirmed":
        message = "Cita confirmada exitosamente";
        break;
      case "cancelled":
        message = "Cita cancelada exitosamente";
        break;
      case "completed":
        message = "Cita marcada como completada";
        break;
      case "no-show":
        message = "Cita marcada como no asistió";
        break;
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message,
        appointment: updatedAppointment
      }),
      headers: HEADERS.json,
    };

  } catch (error: any) {
    console.error("Error updating appointment status:", error);
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