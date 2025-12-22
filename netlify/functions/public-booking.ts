// netlify/functions/public-booking.ts
import { Handler, HandlerEvent } from "@netlify/functions";
import { HEADERS, fromBodyToObject } from "../config/utils";
import { JwtAdapter } from "../config/adapters/jwt.adapter";
import { db } from "../data/db";
import { usersTable, appointmentsTable, scheduleBlocksTable, locationsTable } from "../data/schemas";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { NotificationService } from "../services/notification.service";

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
    const isGenerateLinkEndpoint = pathSegments.some(seg => seg === 'public-booking') &&
                                   pathSegments.some(seg => seg === 'generate-link');

    // GET /public-booking-info/:token
    if (httpMethod === "GET" && isInfoEndpoint) {
      const tokenIndex = pathSegments.indexOf('public-booking-info') + 1;
      const token = pathSegments[tokenIndex];

      if (!token) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: "Token inválido" }),
          headers: HEADERS.json,
        };
      }

      // Validar y decodificar el token para obtener doctorId y durations
      interface BookingToken {
        doctorId: number;
        durations: number[];
        locationId?: number;
      }

      const decoded = await JwtAdapter.validateToken<BookingToken>(token);

      if (!decoded || !decoded.doctorId) {
        return {
          statusCode: 401,
          body: JSON.stringify({ message: "Token inválido o expirado" }),
          headers: HEADERS.json,
        };
      }

      const parsedDoctorId = decoded.doctorId;
      const availableDurations = decoded.durations || [30, 60];
      const tokenLocationId = decoded.locationId || null;

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
        // Convertir appointmentDate a formato YYYY-MM-DD y extraer hora
        const dateObj = new Date(apt.appointmentDate);
        const dateKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;

        // Extraer hora de appointmentDate en formato HH:mm
        const hours = String(dateObj.getHours()).padStart(2, '0');
        const minutes = String(dateObj.getMinutes()).padStart(2, '0');
        const startTime = `${hours}:${minutes}`;

        // Calcular hora de fin basada en duración
        const duration = apt.duration || 60;
        const endMinutes = dateObj.getMinutes() + duration;
        const endDateObj = new Date(dateObj);
        endDateObj.setMinutes(endMinutes);
        const endHours = String(endDateObj.getHours()).padStart(2, '0');
        const endMins = String(endDateObj.getMinutes()).padStart(2, '0');
        const endTime = `${endHours}:${endMins}`;

        if (!appointmentsData[dateKey]) {
          appointmentsData[dateKey] = [];
        }
        appointmentsData[dateKey].push({
          id: apt.id,
          time: startTime,
          duration,
          patient: apt.guestName || 'Paciente',
          service: apt.title || 'Cita',
          status: apt.status || 'pending',
          title: apt.title || `${apt.guestName || 'Paciente'} - Cita`,
          start: new Date(`${dateKey}T${startTime}`),
          end: new Date(`${dateKey}T${endTime}`),
          allDay: false
        });
      });

      // Obtener bloques de agenda del doctor
      const doctorScheduleBlocks = await db
        .select()
        .from(scheduleBlocksTable)
        .where(eq(scheduleBlocksTable.doctorId, parsedDoctorId));

      // Obtener información de la sucursal si está especificada en el token
      let locationInfo = null;
      if (tokenLocationId) {
        const locationData = await db
          .select({
            id: locationsTable.id,
            name: locationsTable.name,
            address: locationsTable.address,
            city: locationsTable.city
          })
          .from(locationsTable)
          .where(eq(locationsTable.id, tokenLocationId))
          .limit(1);

        if (locationData.length > 0) {
          locationInfo = locationData[0];
        }
      }

      return {
        statusCode: 200,
        body: JSON.stringify({
          doctorId: parsedDoctorId,
          doctorName,
          availableDurations,
          appointments: appointmentsData,
          scheduleBlocks: doctorScheduleBlocks,
          location: locationInfo,
          locationId: tokenLocationId
        }),
        headers: HEADERS.json,
      };
    }

    // POST /public-booking/create-appointment
    if (httpMethod === "POST" && isCreateEndpoint) {
      let data: any = {};

      if (rawBody) {
        try {
          // Try JSON first (application/json)
          data = JSON.parse(rawBody);
        } catch {
          // Fall back to URLSearchParams (application/x-www-form-urlencoded)
          data = fromBodyToObject(rawBody);
        }
      }

      const {
        doctorId,
        patientName,
        patientEmail,
        patientPhone,
        appointmentDate,
        startTime,
        duration,
        locationId
      } = data;

      // Validaciones
      if (!doctorId || !patientName || !patientEmail || !patientPhone || !appointmentDate || !startTime || !duration) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "Faltan datos requeridos",
            debug: {
              doctorId: !!doctorId,
              patientName: !!patientName,
              patientEmail: !!patientEmail,
              patientPhone: !!patientPhone,
              appointmentDate: !!appointmentDate,
              startTime: !!startTime,
              duration: !!duration,
              locationId: locationId ? 'provided' : 'not provided'
            }
          }),
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

      // Calcular el rango de tiempo de la nueva cita
      const newAppointmentStart = new Date(`${appointmentDate}T${startTime}:00`);
      const newAppointmentEnd = new Date(newAppointmentStart.getTime() + duration * 60000);

      // Verificar conflictos con citas existentes
      for (const apt of existingAppointments) {
        // Calcular el rango de la cita existente
        const existingStart = new Date(apt.appointmentDate);
        const existingEnd = new Date(existingStart.getTime() + (apt.duration || 60) * 60000);

        // Verificar si hay solapamiento (ambas citas están en el mismo día)
        const sameDay = newAppointmentStart.toDateString() === existingStart.toDateString();
        const overlaps = newAppointmentStart < existingEnd && newAppointmentEnd > existingStart;

        if (sameDay && overlaps) {
          return {
            statusCode: 409,
            body: JSON.stringify({ message: "Este horario ya está ocupado" }),
            headers: HEADERS.json,
          };
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
          blockApplies = block.blockDate === appointmentDate;
        } else if (block.blockType === 'recurring') {
          const blockDate = new Date(block.blockDate);
          const appointmentDt = new Date(appointmentDate);

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
            } else if (block.recurringPattern) {
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

        if (blockApplies && block.startTime && block.endTime) {
          // Crear fechas completas para los bloques usando el appointmentDate
          const [blockStartHours, blockStartMinutes] = block.startTime.split(':').map(Number);
          const [blockEndHours, blockEndMinutes] = block.endTime.split(':').map(Number);

          const blockStart = new Date(appointmentDate);
          blockStart.setHours(blockStartHours, blockStartMinutes, 0, 0);

          const blockEnd = new Date(appointmentDate);
          blockEnd.setHours(blockEndHours, blockEndMinutes, 0, 0);

          // Verificar si hay solapamiento con el bloque
          if (newAppointmentStart < blockEnd && newAppointmentEnd > blockStart) {
            return {
              statusCode: 409,
              body: JSON.stringify({ message: "Este horario está bloqueado" }),
              headers: HEADERS.json,
            };
          }
        }
      }

      // Calcular hora de fin para descripción
      const [startHours, startMinutes] = startTime.split(':').map(Number);
      const endTotalMinutes = startHours * 60 + startMinutes + duration;
      const endHours = Math.floor(endTotalMinutes / 60);
      const endMinutes = endTotalMinutes % 60;
      const endTime = `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;

      // Generar token de confirmación
      const confirmationToken = uuidv4();

      // Crear fecha con hora correcta: combinar appointmentDate (YYYY-MM-DD) con startTime (HH:mm)
      const appointmentDateTime = new Date(`${appointmentDate}T${startTime}:00`);

      // Crear la cita como invitado
      const newAppointment = await db.insert(appointmentsTable).values({
        doctorId,
        patientId: null,
        locationId: locationId ? parseInt(locationId) : null,
        guestName: patientName,
        guestEmail: patientEmail,
        guestPhone: patientPhone,
        guestRut: null,
        title: `${patientName} - Cita Agendada`,
        description: `Horario: ${startTime} - ${endTime}`,
        appointmentDate: appointmentDateTime,
        duration,
        status: 'pending',
        confirmationToken,
        notes: 'Cita agendada a través del link público'
      }).returning();

      // Obtener información del doctor y la ubicación para el email
      try {
        const doctorInfo = await db
          .select({
            name: usersTable.name,
            lastName: usersTable.lastName,
            email: usersTable.email
          })
          .from(usersTable)
          .where(eq(usersTable.id, doctorId))
          .limit(1);

        const doctor = doctorInfo[0];
        const doctorName = doctor ? `${doctor.name} ${doctor.lastName}`.trim() : 'Doctor';
        const doctorEmail = doctor?.email;

        // Obtener información de la ubicación si se proporcionó
        let locationInfo: string | undefined = undefined;
        if (locationId) {
          const locationData = await db
            .select({
              address: locationsTable.address,
              city: locationsTable.city
            })
            .from(locationsTable)
            .where(eq(locationsTable.id, parseInt(locationId)))
            .limit(1);

          if (locationData.length > 0) {
            locationInfo = `${locationData[0].address}, ${locationData[0].city}`;
          }
        }

        // Enviar email de confirmación con archivo ICS
        const notificationService = new NotificationService();
        await notificationService.sendAppointmentConfirmation({
          appointmentId: newAppointment[0].id,
          patientName: patientName,
          patientEmail: patientEmail,
          doctorName: doctorName,
          doctorEmail: doctorEmail,
          appointmentDate: appointmentDateTime,
          service: newAppointment[0].title,
          duration: duration,
          notes: newAppointment[0].notes || undefined,
          confirmationToken: confirmationToken,
          location: locationInfo
        });

        console.log('✅ Confirmation email sent successfully to:', patientEmail);
      } catch (emailError) {
        console.error('⚠️ Error sending confirmation email (appointment created successfully):', emailError);
        // No retornar error, la cita ya fue creada
      }

      return {
        statusCode: 201,
        body: JSON.stringify({
          message: "Cita agendada exitosamente. Recibirás un email de confirmación.",
          appointmentId: newAppointment[0]?.id,
          confirmationToken
        }),
        headers: HEADERS.json,
      };
    }

    // POST /public-booking/generate-link
    if (httpMethod === "POST" && isGenerateLinkEndpoint) {
      let data: any = {};

      if (rawBody) {
        try {
          data = JSON.parse(rawBody);
        } catch {
          return {
            statusCode: 400,
            body: JSON.stringify({ message: "JSON inválido" }),
            headers: HEADERS.json,
          };
        }
      }

      const { doctorId, durations, locationId } = data;

      if (!doctorId || !Array.isArray(durations) || durations.length === 0) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "doctorId y durations son requeridos",
          }),
          headers: HEADERS.json,
        };
      }

      // Validar que las duraciones sean válidas
      const validDurations = durations.filter(
        (d: number) => [30, 60, 90, 120].includes(d)
      );

      if (validDurations.length === 0) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "Duraciones inválidas",
          }),
          headers: HEADERS.json,
        };
      }

      // Construir payload del token
      const tokenPayload: any = {
        doctorId: parseInt(doctorId),
        durations: validDurations.sort((a: number, b: number) => a - b),
      };

      // Agregar locationId solo si está presente
      if (locationId) {
        tokenPayload.locationId = parseInt(locationId);
      }

      // Generar token firmado (válido por 1 año)
      const token = await JwtAdapter.generateToken(tokenPayload, "365d");

      if (!token) {
        return {
          statusCode: 500,
          body: JSON.stringify({ message: "Error al generar token" }),
          headers: HEADERS.json,
        };
      }

      return {
        statusCode: 200,
        body: JSON.stringify({
          token,
          link: `${process.env.FRONTEND_URL || "http://localhost:3000"}/book-appointment/${token}`,
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
