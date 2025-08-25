import { Handler, HandlerEvent } from "@netlify/functions";
import { validateJWT } from "../../middlewares";
import { HEADERS } from "../../config/utils";
import { AppointmentService } from "../../services/appointment.service";

// 🔥 DEFINIR EL TIPO PARA LAS CITAS CONFLICTIVAS
interface ConflictingAppointment {
  id: number;
  title: string;
  appointmentDate: string;
  duration: number;
  patientName: string;
  status: string;
}

const handler: Handler = async (event: HandlerEvent) => {
  const { httpMethod, queryStringParameters } = event;

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

  // Validar JWT
  const user = await validateJWT(event.headers.authorization!);
  if (user.statusCode !== 200) return user;

  const userData = JSON.parse(user.body);

  try {
    const { date, duration, excludeId } = queryStringParameters || {};

    // Validar parámetros requeridos
    if (!date) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "La fecha es obligatoria"
        }),
        headers: HEADERS.json,
      };
    }

    const appointmentDate = new Date(date);
    const appointmentDuration = duration ? parseInt(duration) : 60;
    const excludeAppointmentId = excludeId ? parseInt(excludeId) : undefined;

    // Validar que la fecha sea válida
    if (isNaN(appointmentDate.getTime())) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Fecha inválida"
        }),
        headers: HEADERS.json,
      };
    }

    // Verificar disponibilidad
    const isAvailable = await AppointmentService.checkAvailability(
      userData.id,
      appointmentDate,
      appointmentDuration,
      excludeAppointmentId
    );

    // 🔥 DEFINIR TIPO EXPLÍCITAMENTE
    let conflictingAppointments: ConflictingAppointment[] = [];
    
    if (!isAvailable) {
      const startTime = new Date(appointmentDate);
      const endTime = new Date(appointmentDate.getTime() + appointmentDuration * 60000);
      
      const conflicts = await AppointmentService.findByDateRange(
        userData.id,
        startTime,
        endTime
      );

      // Mapear y asegurar que todos los campos sean del tipo correcto
      conflictingAppointments = conflicts.map(apt => ({
        id: apt.id,
        title: apt.title,
        appointmentDate: apt.appointmentDate.toISOString(),
        duration: apt.duration || 60, // 🔥 Proveer valor por defecto si es null
        patientName: apt.patientName || 'Paciente sin nombre', // 🔥 Proveer valor por defecto si es null
        status: apt.status || 'pending' // 🔥 Proveer valor por defecto si es null
      }));
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        available: isAvailable,
        date: appointmentDate.toISOString(),
        duration: appointmentDuration,
        conflictingAppointments
      }),
      headers: HEADERS.json,
    };

  } catch (error: any) {
    console.error("Error checking availability:", error);
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