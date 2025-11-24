// netlify/functions/public-booking/public-booking-create.ts
import { Handler, HandlerEvent } from "@netlify/functions";
import { HEADERS, fromBodyToObject } from "../../config/utils";
import { db } from "../../data/db";
import { appointments, scheduleBlocks } from "../../data/schemas";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

const handler: Handler = async (event: HandlerEvent) => {
  const { httpMethod, body } = event;

  // Manejar preflight OPTIONS
  if (httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: HEADERS.json,
    };
  }

  try {
    // POST /public-booking/create-appointment - Crear cita pública
    if (httpMethod === "POST") {
      const data = body ? fromBodyToObject(body) : {};

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
        .from(appointments)
        .where(eq(appointments.doctorId, doctorId));

      const [startHours, startMinutes] = startTime.split(':').map(Number);
      const startTotalMinutes = startHours * 60 + startMinutes;
      const endTotalMinutes = startTotalMinutes + duration;

      const dateStr = appointmentDate;
      for (const apt of existingAppointments) {
        if (apt.appointmentDate === dateStr) {
          const [aptHours, aptMinutes] = apt.startTime.split(':').map(Number);
          const [aptEndHours, aptEndMinutes] = apt.endTime?.split(':').map(Number) || [aptHours, aptMinutes + 30];

          const aptStartMinutes = aptHours * 60 + aptMinutes;
          const aptEndMinutes = aptEndHours * 60 + aptEndMinutes;

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
        .from(scheduleBlocks)
        .where(eq(scheduleBlocks.doctorId, doctorId));

      for (const block of doctorBlocks) {
        let blockApplies = false;

        if (block.blockType === 'single_date') {
          blockApplies = block.blockDate === dateStr;
        } else if (block.blockType === 'recurring') {
          // Verificar si el bloque aplica a esta fecha
          const blockDate = new Date(block.blockDate);
          const appointmentDt = new Date(dateStr);

          // Validar rango de fechas
          if (appointmentDt < blockDate) {
            blockApplies = false;
          } else if (block.recurringEndDate && appointmentDt > new Date(block.recurringEndDate)) {
            blockApplies = false;
          } else {
            // Validar patrón de recurrencia
            if (block.recurringPattern === 'daily') {
              blockApplies = true;
            } else if (block.recurringPattern === 'weekly') {
              const blockDayOfWeek = blockDate.getDay();
              const appointmentDayOfWeek = appointmentDt.getDay();
              blockApplies = blockDayOfWeek === appointmentDayOfWeek;
            } else {
              // Patrón específico de día (lunes, martes, etc)
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

        // Si el bloque aplica, verificar horario
        if (blockApplies) {
          const [blockHours, blockMinutes] = block.startTime.split(':').map(Number);
          const [blockEndHours, blockEndMinutes] = block.endTime.split(':').map(Number);

          const blockStartMinutes = blockHours * 60 + blockMinutes;
          const blockEndMinutes = blockEndHours * 60 + blockEndMinutes;

          // Revisar si hay solapamiento
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
      const newAppointment = await db.insert(appointments).values({
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

      // TODO: Enviar email de confirmación al paciente con link para confirmar

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
    console.error('Error en public-booking-create:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error al crear la cita: " + error.message }),
      headers: HEADERS.json,
    };
  }
};

export { handler };
