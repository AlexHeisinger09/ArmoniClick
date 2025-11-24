// netlify/functions/public-booking/public-booking-info.ts
import { Handler, HandlerEvent } from "@netlify/functions";
import { HEADERS, fromBodyToObject } from "../../config/utils";
import { db } from "../../data/db";
import { users, appointments, scheduleBlocks } from "../../data/schemas";
import { eq } from "drizzle-orm";

const handler: Handler = async (event: HandlerEvent) => {
  const { httpMethod, path } = event;

  // Manejar preflight OPTIONS
  if (httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: HEADERS.json,
    };
  }

  try {
    // Extraer doctorId del path
    const pathSegments = path.split('/').filter(segment => segment && segment !== '.netlify' && segment !== 'functions' && segment !== 'public-booking' && segment !== 'public-booking-info');
    const doctorId = pathSegments[pathSegments.length - 1];

    if (!doctorId || isNaN(parseInt(doctorId))) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Doctor ID inválido" }),
        headers: HEADERS.json,
      };
    }

    const parsedDoctorId = parseInt(doctorId);

    // GET /public-booking-info/:doctorId - Obtener información del doctor y disponibilidad
    if (httpMethod === "GET") {
      // Verificar que el doctor existe
      const doctor = await db
        .select({ id: users.id, nombres: users.nombres, apellidos: users.apellidos })
        .from(users)
        .where(eq(users.id, parsedDoctorId))
        .limit(1);

      if (doctor.length === 0) {
        return {
          statusCode: 404,
          body: JSON.stringify({ message: "Doctor no encontrado" }),
          headers: HEADERS.json,
        };
      }

      const doctorName = `${doctor[0].nombres} ${doctor[0].apellidos}`;

      // Obtener citas del doctor (últimos 90 días y próximos 90 días)
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 90);
      const endDate = new Date(today);
      endDate.setDate(endDate.getDate() + 90);

      const doctorAppointments = await db
        .select()
        .from(appointments)
        .where(
          eq(appointments.doctorId, parsedDoctorId)
        );

      // Formatear citas para el formato esperado por el frontend
      const appointmentsData: Record<string, any[]> = {};
      doctorAppointments.forEach(apt => {
        const dateKey = apt.appointmentDate;
        if (!appointmentsData[dateKey]) {
          appointmentsData[dateKey] = [];
        }
        appointmentsData[dateKey].push({
          id: apt.id,
          time: apt.startTime,
          duration: apt.duration || 60,
          patient: apt.guestPatientName || 'Paciente',
          service: apt.service || 'Cita',
          status: apt.status || 'pending',
          title: `${apt.guestPatientName || 'Paciente'} - ${apt.service || 'Cita'}`,
          start: new Date(`${apt.appointmentDate}T${apt.startTime}`),
          end: new Date(`${apt.appointmentDate}T${apt.endTime || '20:00'}`),
          allDay: false
        });
      });

      // Obtener bloques de agenda del doctor
      const doctorScheduleBlocks = await db
        .select()
        .from(scheduleBlocks)
        .where(eq(scheduleBlocks.doctorId, parsedDoctorId));

      // Disponibilidades por defecto (se pueden configurar desde el frontend)
      const availableDurations = [30, 60];

      return {
        statusCode: 200,
        body: JSON.stringify({
          doctorName,
          availableDurations,
          appointments: appointmentsData,
          scheduleBlocks: doctorScheduleBlocks
        }),
        headers: HEADERS.json,
      };
    }

    return {
      statusCode: 405,
      body: JSON.stringify({ message: "Método no permitido" }),
      headers: HEADERS.json,
    };
  } catch (error: any) {
    console.error('Error en public-booking-info:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error al obtener información del doctor" }),
      headers: HEADERS.json,
    };
  }
};

export { handler };
