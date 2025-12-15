// netlify/functions/appointments/appointments.ts - CORRECCIÓN TIMEZONE
import { Handler, HandlerEvent } from "@netlify/functions";
import { validateJWT, getAuthorizationHeader } from "../../middlewares";
import { HEADERS, fromBodyToObject } from "../../config/utils";
import { AppointmentService, CreateAppointmentData, UpdateAppointmentData } from "../../services/appointment.service";
import { AuditService } from "../../services/AuditService";
import { db } from "../../data/db";
import { AUDIT_ENTITY_TYPES, AUDIT_ACTIONS } from "../../data/schemas";
import { setTenantContext } from "../../config/tenant-context";

const handler: Handler = async (event: HandlerEvent) => {
  const { httpMethod, path, queryStringParameters } = event;
  const body = event.body ? fromBodyToObject(event.body) : {};

  // Manejar preflight OPTIONS
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: HEADERS.json,
    };
  }

  // Validar JWT
  const authHeader = getAuthorizationHeader(event.headers);
  const user = await validateJWT(authHeader || "");
  if (user.statusCode !== 200) return user;

  const userData = JSON.parse(user.body);

  // ✅ NUEVO: Setear contexto de tenant para Row-Level Security
  await setTenantContext(db, userData.id);

  try {
    // Función auxiliar para extraer ID de la URL
    const extractAppointmentId = (path: string): number | null => {
      const pathSegments = path.split('/').filter(segment => segment && segment !== '.netlify' && segment !== 'functions' && segment !== 'appointments');
      const lastSegment = pathSegments[pathSegments.length - 1];

      if (lastSegment && !isNaN(parseInt(lastSegment))) {
        return parseInt(lastSegment);
      }
      return null;
    };

    const appointmentId = extractAppointmentId(path);
    const hasAppointmentId = appointmentId !== null;

    console.log('🔍 Debug info:', {
      httpMethod,
      path,
      hasAppointmentId,
      appointmentId,
      queryStringParameters,
      body
    });

    // GET /appointments - Obtener todas las citas del doctor
    if (httpMethod === "GET" && !hasAppointmentId) {
      const { startDate, endDate, upcoming } = queryStringParameters || {};

      console.log('📅 Getting appointments with params:', { startDate, endDate, upcoming });

      if (upcoming === "true") {
        const appointments = await AppointmentService.getUpcomingAppointments(userData.id);
        return {
          statusCode: 200,
          body: JSON.stringify(appointments),
          headers: HEADERS.json,
        };
      }

      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          return {
            statusCode: 400,
            body: JSON.stringify({ message: "Fechas inválidas" }),
            headers: HEADERS.json,
          };
        }

        console.log('🔍 Searching appointments between:', start, 'and', end);
        const appointments = await AppointmentService.findByDateRange(userData.id, start, end);

        console.log('📦 Appointments found:', {
          count: appointments.length,
          appointments: appointments.map(apt => ({
            id: apt.id,
            title: apt.title,
            patientName: apt.patientName,
            appointmentDate: apt.appointmentDate
          }))
        });

        return {
          statusCode: 200,
          body: JSON.stringify(appointments),
          headers: HEADERS.json,
        };
      }

      const appointments = await AppointmentService.findByDoctor(userData.id);
      return {
        statusCode: 200,
        body: JSON.stringify(appointments),
        headers: HEADERS.json,
      };
    }

    // GET /appointments/:id - Obtener cita específica
    if (httpMethod === "GET" && hasAppointmentId) {
      if (!appointmentId || appointmentId <= 0) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: "ID de cita inválido" }),
          headers: HEADERS.json,
        };
      }

      const appointment = await AppointmentService.findById(appointmentId, userData.id);

      if (!appointment) {
        return {
          statusCode: 404,
          body: JSON.stringify({ message: "Cita no encontrada" }),
          headers: HEADERS.json,
        };
      }

      return {
        statusCode: 200,
        body: JSON.stringify(appointment),
        headers: HEADERS.json,
      };
    }

    // POST /appointments - Crear nueva cita
    if (httpMethod === "POST") {
      const {
        patientId,
        guestName,
        guestEmail,
        guestPhone,
        guestRut,
        title,
        description,
        appointmentDate,
        duration = 60,
        type = "consultation",
        notes
      } = body;

      console.log('📝 Creating appointment with data:', {
        patientId,
        guestName,
        guestEmail,
        guestPhone,
        guestRut,
        title,
        description,
        appointmentDate,
        duration,
        type,
        notes,
        doctorId: userData.id
      });

      // Validaciones básicas
      if (!title || !appointmentDate) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "El título y la fecha de la cita son obligatorios"
          }),
          headers: HEADERS.json,
        };
      }

      // Validar que se proporcione información del paciente
      if (!patientId && !guestName) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "Debe especificar un paciente registrado o proporcionar datos del invitado"
          }),
          headers: HEADERS.json,
        };
      }

      // ✅ CORRECCIÓN DE TIMEZONE - Parsear correctamente la fecha
      console.log('🔧 Parsing appointment date:', {
        receivedDate: appointmentDate,
        type: typeof appointmentDate
      });

      let appointmentDateTime: Date;

      try {
        // Si la fecha incluye timezone (+/-), la parseamos directamente
        if (appointmentDate.includes('+') || appointmentDate.includes('Z') || appointmentDate.match(/-\d{2}:\d{2}$/)) {
          appointmentDateTime = new Date(appointmentDate);
          console.log('✅ Parsed date with timezone:', {
            originalString: appointmentDate,
            parsedDate: appointmentDateTime.toISOString(),
            localTime: appointmentDateTime.toLocaleString('es-CL', { timeZone: 'America/Santiago' }),
            hours: appointmentDateTime.getHours(),
            minutes: appointmentDateTime.getMinutes()
          });
        } else {
          // Si no tiene timezone, asumir que es hora local de Chile y agregar timezone
          const dateWithChileTimezone = appointmentDate + '-04:00';
          appointmentDateTime = new Date(dateWithChileTimezone);
          console.log('✅ Added Chile timezone to date:', {
            originalString: appointmentDate,
            withTimezone: dateWithChileTimezone,
            parsedDate: appointmentDateTime.toISOString(),
            localTime: appointmentDateTime.toLocaleString('es-CL', { timeZone: 'America/Santiago' })
          });
        }
      } catch (error) {
        console.error('❌ Error parsing date:', error);
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "Formato de fecha inválido"
          }),
          headers: HEADERS.json,
        };
      }

      // Validar que la fecha no sea en el pasado
      const now = new Date();
      if (appointmentDateTime < now) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "No se puede agendar citas en el pasado"
          }),
          headers: HEADERS.json,
        };
      }

      const appointmentData: CreateAppointmentData = {
        doctorId: userData.id,
        patientId: patientId ? parseInt(patientId) : null,
        guestName: guestName || null,
        guestEmail: guestEmail || null,
        guestPhone: guestPhone || null,
        guestRut: guestRut || null,
        title,
        description: description || null,
        appointmentDate: appointmentDateTime, // ✅ Usar fecha parseada correctamente
        duration: parseInt(duration) || 60,
        type,
        notes: notes || null
      };

      console.log('🔍 Final appointment data to save:', {
        ...appointmentData,
        appointmentDate: appointmentData.appointmentDate.toISOString(),
        localTime: appointmentData.appointmentDate.toLocaleString('es-CL', { timeZone: 'America/Santiago' })
      });

      try {
        const newAppointment = await AppointmentService.create(appointmentData);

        console.log('✅ Appointment created successfully:', {
          id: newAppointment.id,
          savedDate: newAppointment.appointmentDate,
          savedDateISO: newAppointment.appointmentDate.toISOString(),
          savedLocalTime: newAppointment.appointmentDate.toLocaleString('es-CL', { timeZone: 'America/Santiago' })
        });

        // 📝 Registrar en auditoría (creación de cita)
        const auditService = new AuditService(db);
        if (newAppointment.patientId) {
          await auditService.logChange({
            patientId: newAppointment.patientId,
            entityType: AUDIT_ENTITY_TYPES.CITA,
            entityId: newAppointment.id,
            action: AUDIT_ACTIONS.CREATED,
            newValues: {
              title: newAppointment.title,
              appointmentDate: newAppointment.appointmentDate,
              status: newAppointment.status,
              type: newAppointment.type,
            },
            changedBy: userData.id,
            notes: `Cita creada: ${newAppointment.title}`,
          });
        }

        return {
          statusCode: 201,
          body: JSON.stringify({
            message: "Cita creada exitosamente",
            appointment: newAppointment
          }),
          headers: HEADERS.json,
        };
      } catch (createError: any) {
        console.error('❌ Error creating appointment:', createError);
        return {
          statusCode: 500,
          body: JSON.stringify({
            message: createError.message || "Error al crear la cita"
          }),
          headers: HEADERS.json,
        };
      }
    }

    // PUT /appointments/:id - Actualizar cita
    if (httpMethod === "PUT" && hasAppointmentId) {
      if (!appointmentId || appointmentId <= 0) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: "ID de cita inválido" }),
          headers: HEADERS.json,
        };
      }

      const {
        title,
        description,
        appointmentDate,
        duration,
        type,
        notes,
        status,
        cancellationReason
      } = body;

      const updateData: UpdateAppointmentData = {};

      if (title) updateData.title = title;
      if (description !== undefined) updateData.description = description || null;
      if (appointmentDate) {
        // ✅ MISMA CORRECCIÓN PARA UPDATE
        let newDateTime: Date;
        if (appointmentDate.includes('+') || appointmentDate.includes('Z') || appointmentDate.match(/-\d{2}:\d{2}$/)) {
          newDateTime = new Date(appointmentDate);
        } else {
          newDateTime = new Date(appointmentDate + '-04:00');
        }

        const isAvailable = await AppointmentService.checkAvailability(
          userData.id,
          newDateTime,
          duration ? parseInt(duration) : 60,
          appointmentId
        );

        if (!isAvailable) {
          return {
            statusCode: 409,
            body: JSON.stringify({
              message: "Ya existe una cita en ese horario"
            }),
            headers: HEADERS.json,
          };
        }

        updateData.appointmentDate = newDateTime;
      }
      if (duration) updateData.duration = parseInt(duration);
      if (type) updateData.type = type;
      if (notes !== undefined) updateData.notes = notes || null;
      if (status) {
        updateData.status = status;
        if (status === "cancelled" && cancellationReason) {
          updateData.cancellationReason = cancellationReason;
        }
      }

      // Obtener la cita actual para comparar cambios
      const existingAppointment = await AppointmentService.findById(appointmentId, userData.id);
      if (!existingAppointment) {
        return {
          statusCode: 404,
          body: JSON.stringify({ message: "Cita no encontrada" }),
          headers: HEADERS.json,
        };
      }

      const updatedAppointment = await AppointmentService.update(
        appointmentId,
        userData.id,
        updateData
      );

      if (!updatedAppointment) {
        return {
          statusCode: 404,
          body: JSON.stringify({ message: "Cita no encontrada" }),
          headers: HEADERS.json,
        };
      }

      // 📝 Registrar en auditoría (cambios en cita)
      const auditService = new AuditService(db);
      const changedFields: any = {};
      const oldValues: any = {};

      if (updateData.title && existingAppointment.title !== updateData.title) {
        changedFields.title = updateData.title;
        oldValues.title = existingAppointment.title;
      }
      if (updateData.description !== undefined && existingAppointment.description !== updateData.description) {
        changedFields.description = updateData.description;
        oldValues.description = existingAppointment.description;
      }
      if (updateData.appointmentDate && existingAppointment.appointmentDate.getTime() !== updateData.appointmentDate.getTime()) {
        changedFields.appointmentDate = updateData.appointmentDate;
        oldValues.appointmentDate = existingAppointment.appointmentDate;
      }
      if (updateData.duration && existingAppointment.duration !== updateData.duration) {
        changedFields.duration = updateData.duration;
        oldValues.duration = existingAppointment.duration;
      }
      if (updateData.type && existingAppointment.type !== updateData.type) {
        changedFields.type = updateData.type;
        oldValues.type = existingAppointment.type;
      }
      if (updateData.notes !== undefined && existingAppointment.notes !== updateData.notes) {
        changedFields.notes = updateData.notes;
        oldValues.notes = existingAppointment.notes;
      }
      if (updateData.status && existingAppointment.status !== updateData.status) {
        changedFields.status = updateData.status;
        oldValues.status = existingAppointment.status;
      }

      if (updatedAppointment.patientId && Object.keys(changedFields).length > 0) {
        await auditService.logChange({
          patientId: updatedAppointment.patientId,
          entityType: AUDIT_ENTITY_TYPES.CITA,
          entityId: appointmentId,
          action: updateData.status ? AUDIT_ACTIONS.STATUS_CHANGED : AUDIT_ACTIONS.UPDATED,
          oldValues,
          newValues: changedFields,
          changedBy: userData.id,
          notes: updateData.status ? `Cita ${updateData.status === 'cancelled' ? 'cancelada' : 'reprogramada'}` : `Cita actualizada: ${updatedAppointment.title}`,
        });
      }

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Cita actualizada exitosamente",
          appointment: updatedAppointment
        }),
        headers: HEADERS.json,
      };
    }

    // DELETE /appointments/:id - Eliminar cita
    if (httpMethod === "DELETE" && hasAppointmentId) {
      if (!appointmentId || appointmentId <= 0) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: "ID de cita inválido" }),
          headers: HEADERS.json,
        };
      }

      // Obtener la cita antes de eliminarla para registrar en auditoría
      const appointmentToDelete = await AppointmentService.findById(appointmentId, userData.id);

      const deletedAppointment = await AppointmentService.delete(appointmentId, userData.id);

      if (!deletedAppointment) {
        return {
          statusCode: 404,
          body: JSON.stringify({ message: "Cita no encontrada" }),
          headers: HEADERS.json,
        };
      }

      // 📝 Registrar en auditoría (eliminación de cita)
      const auditService = new AuditService(db);
      if (appointmentToDelete && appointmentToDelete.patientId) {
        await auditService.logChange({
          patientId: appointmentToDelete.patientId,
          entityType: AUDIT_ENTITY_TYPES.CITA,
          entityId: appointmentId,
          action: AUDIT_ACTIONS.DELETED,
          oldValues: {
            title: appointmentToDelete.title,
            appointmentDate: appointmentToDelete.appointmentDate,
            status: appointmentToDelete.status,
          },
          changedBy: userData.id,
          notes: `Cita eliminada: ${appointmentToDelete.title}`,
        });
      }

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Cita eliminada exitosamente"
        }),
        headers: HEADERS.json,
      };
    }

    return {
      statusCode: 405,
      body: JSON.stringify({
        message: "Method Not Allowed"
      }),
      headers: HEADERS.json,
    };

  } catch (error: any) {
    console.error("❌ Error in appointments handler:", error);
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