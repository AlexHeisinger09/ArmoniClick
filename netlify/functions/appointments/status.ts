// netlify/functions/appointments/status.ts - CORREGIDO
import { Handler, HandlerEvent } from "@netlify/functions";
import { validateJWT } from "../../middlewares";
import { HEADERS, fromBodyToObject } from "../../config/utils";
import { AppointmentService } from "../../services/appointment.service";

const handler: Handler = async (event: HandlerEvent) => {
  const { httpMethod, path } = event;
  const body = event.body ? fromBodyToObject(event.body) : {};

  console.log('🔍 Status endpoint called:', {
    httpMethod,
    path,
    queryStringParameters: event.queryStringParameters,
    body
  });

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
        receivedMethod: httpMethod,
        expectedMethod: "PUT"
      }),
      headers: HEADERS.json,
    };
  }

  try {
    // ✅ EXTRAER ID DEL PATH O QUERY PARAMETERS
    let appointmentId: number | null = null;

    // Método 1: Del path (preferido) - /.netlify/functions/appointments-status/54
    const pathParts = path.split('/').filter(p => p);
    const statusIndex = pathParts.findIndex(p => p === 'appointments-status' || p === 'status');
    
    if (statusIndex !== -1 && pathParts[statusIndex + 1]) {
      const rawId = pathParts[statusIndex + 1];
      appointmentId = parseInt(rawId);
      console.log('✅ ID found in path:', appointmentId);
    }
    
    // Método 2: De query parameters (fallback)
    if (!appointmentId && event.queryStringParameters?.id) {
      appointmentId = parseInt(event.queryStringParameters.id);
      console.log('✅ ID found in query:', appointmentId);
    }

    console.log('🔍 Final appointment ID:', appointmentId);

    // Validar ID
    if (!appointmentId || isNaN(appointmentId) || appointmentId <= 0) {
      console.log('❌ Invalid appointment ID:', appointmentId);
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          message: "ID de cita inválido",
          receivedId: appointmentId,
          path,
          queryParams: event.queryStringParameters
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
          message: `Estado no válido: ${status}`,
          validStatuses
        }),
        headers: HEADERS.json,
      };
    }

    console.log('🔄 Updating appointment:', {
      appointmentId,
      status,
      reason,
      userId: userData.id
    });
    
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
    console.error("❌ Stack trace:", error.stack);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: error.message || "Error interno del servidor",
        details: error.toString()
      }),
      headers: HEADERS.json,
    };
  }
};

export { handler };