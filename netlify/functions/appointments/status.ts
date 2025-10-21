import { Handler, HandlerEvent } from "@netlify/functions";
import { validateJWT } from "../../middlewares";
import { HEADERS, fromBodyToObject } from "../../config/utils";
import { AppointmentService } from "../../services/appointment.service";

const handler: Handler = async (event: HandlerEvent) => {
  const { httpMethod, queryStringParameters } = event;
  const body = event.body ? fromBodyToObject(event.body) : {};

  // Manejar preflight OPTIONS
  if (httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: HEADERS.json,
    };
  }

  // Validar JWT
  const user = await validateJWT(event.headers.authorization!);
  if (user.statusCode !== 200) return user;

  const userData = JSON.parse(user.body);

  // Solo permitir PUT
  if (httpMethod !== "PUT") {
    console.log('❌ Method not allowed:', httpMethod);
    return {
      statusCode: 405,
      body: JSON.stringify({
        message: "Method Not Allowed",
        receivedMethod: httpMethod
      }),
      headers: HEADERS.json,
    };
  }

  try {
    // LEER ID DESDE QUERY PARAMETERS
    const rawId = queryStringParameters?.id;
    const appointmentId = rawId ? parseInt(rawId) : null;
    
    console.log('✅ Processing update request:', {
      rawId,
      appointmentId,
      isValid: !!(appointmentId && !isNaN(appointmentId) && appointmentId > 0),
      status: body.status,
      userId: userData.id
    });
    
    if (!appointmentId || isNaN(appointmentId) || appointmentId <= 0) {
      console.log('❌ Invalid appointment ID');
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          message: "ID de cita inválido",
          receivedId: rawId
        }),
        headers: HEADERS.json,
      };
    }

    const { status, reason } = body;

    if (!status) {
      console.log('❌ Status is required');
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "El estado es obligatorio" }),
        headers: HEADERS.json,
      };
    }

    const validStatuses = ["pending", "confirmed", "cancelled", "no-show", "completed"];
    if (!validStatuses.includes(status)) {
      console.log('❌ Invalid status:', status);
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: `Estado no válido: ${status}`
        }),
        headers: HEADERS.json,
      };
    }

    console.log('🔄 Calling AppointmentService.updateStatus...');
    
    const updatedAppointment = await AppointmentService.updateStatus(
      appointmentId,
      userData.id,
      status,
      reason
    );

    if (!updatedAppointment) {
      console.log('❌ Appointment not found');
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

    console.log('✅ SUCCESS! Appointment updated:', {
      id: updatedAppointment.id,
      newStatus: updatedAppointment.status
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        message,
        appointment: updatedAppointment
      }),
      headers: HEADERS.json,
    };

  } catch (error: any) {
    console.error("❌ ERROR in status update:", error);
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