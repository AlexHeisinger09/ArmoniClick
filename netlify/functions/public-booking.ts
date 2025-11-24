// netlify/functions/public-booking.ts
import { Handler, HandlerEvent } from "@netlify/functions";
import { HEADERS, fromBodyToObject } from "../config/utils";
import { db } from "../data/db";
import { usersTable, appointmentsTable, scheduleBlocksTable } from "../data/schemas";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

const handler: Handler = async (event: HandlerEvent) => {
  const { httpMethod, path, body: rawBody } = event;

  // Manejar preflight OPTIONS
  if (httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: HEADERS.json,
    };
  }

  try {
    // Extraer ruta base y doctorId del path
    // Path puede ser: /public-booking-info/1 o /public-booking/create-appointment
    const pathSegments = path
      .split('/')
      .filter(segment => segment && segment !== '.netlify' && segment !== 'functions');

    const isInfoEndpoint = pathSegments.some(seg => seg === 'public-booking-info');
    const isCreateEndpoint = pathSegments.some(seg => seg === 'public-booking') &&
                             pathSegments.some(seg => seg === 'create-appointment');

    // GET /public-booking-info/:doctorId
    if (httpMethod === "GET" && isInfoEndpoint) {
      const doctorIdIndex = pathSegments.indexOf('public-booking-info') + 1;
      const doctorId = pathSegments[doctorIdIndex];

      console.log('DEBUG: Path segments:', pathSegments);
      console.log('DEBUG: Doctor ID Index:', doctorIdIndex);
      console.log('DEBUG: Doctor ID:', doctorId);

      if (!doctorId || isNaN(parseInt(doctorId))) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: "Doctor ID inválido", debug: { pathSegments, doctorIdIndex, doctorId } }),
          headers: HEADERS.json,
        };
      }

      const parsedDoctorId = parseInt(doctorId);

      // Verificar que el doctor existe
      const doctor = await db
        .select({ id: usersTable.id, nombres: usersTable.name, apellidos: usersTable.lastName })
        .from(usersTable)
        .where(eq(usersTable.id, parsedDoctorId))
        .limit(1);

      if (doctor.length === 0) {
        return {
          statusCode: 404,
          body: JSON.stringify({ message: "Doctor no encontrado" }),
          headers: HEADERS.json,
        };
      }

      const doctorName = `${doctor[0].nombres} ${doctor[0].apellidos}`;

      // Obtener citas del doctor
      const doctorAppointments = await db
        .select()
        .from(appointmentsTable)
        .where(eq(appointmentsTable.doctorId, parsedDoctorId));

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
        .from(scheduleBlocksTable)
        .where(eq(scheduleBlocksTable.doctorId, parsedDoctorId));

      // Disponibilidades por defecto
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

    // POST /public-booking/create-appointment
    if (httpMethod === "POST" && isCreateEndpoint) {
      const data = rawBody ? fromBodyToObject(rawBody) : {};

      const {
        doctorId,
        patientName,
        patientEmail,
        patientPhone,
        appointmentDate,
        startTime,
        duration
      } = data;

      // Validaciones
      if (!doctorId || !patientName || !patientEmail || !patientPhone || !appointmentDate || !startTime || !duration) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: "Faltan datos requeridos" }),
          headers: HEADERS.json,
        };
      }

      // Validar que la fecha sea válida
      const appointmentDateObj = new Date(appointmentDate);
      if (isNaN(appointmentDateObj.getTime())) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: "Fecha de cita inválida" }),
          headers: HEADERS.json,
        };
      }

      // Validar que no sea una fecha pasada
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      appointmentDateObj.setHours(0, 0, 0, 0);

      if (appointmentDateObj < now) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: "No se pueden agendar citas en fechas pasadas" }),
          headers: HEADERS.json,
        };
      }

      // Verificar disponibilidad: validar que no haya conflictos con citas existentes
      const existingAppointments = await db
        .select()
        .from(appointmentsTable)
        .where(eq(appointmentsTable.doctorId, doctorId));

      const [startHours, startMinutes] = startTime.split(':').map(Number);
      const startTotalMinutes = startHours * 60 + startMinutes;
      const endTotalMinutes = startTotalMinutes + duration;

      const dateStr = appointmentDate;
      for (const apt of existingAppointments) {
        if (apt.appointmentDate === dateStr) {
          const [aptHours, aptMinutes] = apt.startTime.split(':').map(Number);
          const [aptEndHours, aptEndMinutesVal] = apt.endTime?.split(':').map(Number) || [aptHours, aptMinutes + 30];

          const aptStartMinutes = aptHours * 60 + aptMinutes;
          const aptEndMinutes = aptEndHours * 60 + aptEndMinutesVal;

          // Revisar si hay solapamiento
          if (startTotalMinutes < aptEndMinutes && endTotalMinutes > aptStartMinutes) {
            return {
              statusCode: 409,
              body: JSON.stringify({ message: "Este horario ya está ocupado" }),
              headers: HEADERS.json,
            };
          }
        }
      }

      // Verificar disponibilidad: validar que no haya bloques de agenda
      const doctorBlocks = await db
        .select()
        .from(scheduleBlocksTable)
        .where(eq(scheduleBlocksTable.doctorId, doctorId));

      for (const block of doctorBlocks) {
        let blockApplies = false;

        if (block.blockType === 'single_date') {
          blockApplies = block.blockDate === dateStr;
        } else if (block.blockType === 'recurring') {
          const blockDate = new Date(block.blockDate);
          const appointmentDt = new Date(dateStr);

          if (appointmentDt < blockDate) {
            blockApplies = false;
          } else if (block.recurringEndDate && appointmentDt > new Date(block.recurringEndDate)) {
            blockApplies = false;
          } else {
            if (block.recurringPattern === 'daily') {
              blockApplies = true;
            } else if (block.recurringPattern === 'weekly') {
              const blockDayOfWeek = blockDate.getDay();
              const appointmentDayOfWeek = appointmentDt.getDay();
              blockApplies = blockDayOfWeek === appointmentDayOfWeek;
            } else {
              const dayOfWeekMap: Record<string, number> = {
                'sunday': 0,
                'monday': 1,
                'tuesday': 2,
                'wednesday': 3,
                'thursday': 4,
                'friday': 5,
                'saturday': 6
              };
              const targetDay = dayOfWeekMap[block.recurringPattern];
              blockApplies = appointmentDt.getDay() === targetDay;
            }
          }
        }

        if (blockApplies) {
          const [blockHours, blockMinutes] = block.startTime.split(':').map(Number);
          const [blockEndHours, blockEndMinutesVal] = block.endTime.split(':').map(Number);

          const blockStartMinutes = blockHours * 60 + blockMinutes;
          const blockEndMinutes = blockEndHours * 60 + blockEndMinutesVal;

          if (startTotalMinutes < blockEndMinutes && endTotalMinutes > blockStartMinutes) {
            return {
              statusCode: 409,
              body: JSON.stringify({ message: "Este horario está bloqueado" }),
              headers: HEADERS.json,
            };
          }
        }
      }

      // Calcular hora de fin
      const endHours = Math.floor(endTotalMinutes / 60);
      const endMinutes = endTotalMinutes % 60;
      const endTime = `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;

      // Generar token de confirmación
      const confirmationToken = uuidv4();

      // Crear la cita como invitado
      const newAppointment = await db.insert(appointmentsTable).values({
        doctorId,
        patientId: null,
        guestPatientName: patientName,
        guestEmail: patientEmail,
        guestPhone: patientPhone,
        guestRut: null,
        service: 'Cita Agendada',
        appointmentDate: dateStr,
        startTime,
        endTime,
        duration,
        status: 'pending',
        confirmationToken,
        notes: 'Cita agendada a través del link público'
      }).returning();

      return {
        statusCode: 201,
        body: JSON.stringify({
          message: "Cita agendada exitosamente",
          appointmentId: newAppointment[0]?.id,
          confirmationToken
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
    console.error('Error en public-booking:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error al procesar: " + error.message }),
      headers: HEADERS.json,
    };
  }
};

export { handler };
