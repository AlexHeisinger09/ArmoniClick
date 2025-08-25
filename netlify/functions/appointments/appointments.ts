// netlify/functions/appointments/appointments.ts
import { Handler, HandlerEvent } from "@netlify/functions";
import { validateJWT } from "../../middlewares";
import { HEADERS, fromBodyToObject } from "../../config/utils";
import { AppointmentService, CreateAppointmentData, UpdateAppointmentData } from "../../services/appointment.service";

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
  const user = await validateJWT(event.headers.authorization!);
  if (user.statusCode !== 200) return user;

  const userData = JSON.parse(user.body);

  try {
    // GET /appointments - Obtener todas las citas del doctor
    if (httpMethod === "GET" && !path.includes("/")) {
      const { startDate, endDate, upcoming } = queryStringParameters || {};

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
        const appointments = await AppointmentService.findByDateRange(userData.id, start, end);
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
    if (httpMethod === "GET" && path.includes("/")) {
      const appointmentId = parseInt(path.split("/").pop() || "0");
      
      if (!appointmentId) {
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

      const appointmentDateTime = new Date(appointmentDate);
      
      // Validar que la fecha no sea en el pasado
      if (appointmentDateTime < new Date()) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "No se puede agendar citas en el pasado"
          }),
          headers: HEADERS.json,
        };
      }

      // Verificar disponibilidad
      const isAvailable = await AppointmentService.checkAvailability(
        userData.id,
        appointmentDateTime,
        60
      );

      if (!isAvailable) {
        return {
          statusCode: 409,
          body: JSON.stringify({
            message: "Ya existe una cita en ese horario. Se puede agendar como sobrecupo."
          }),
          headers: HEADERS.json,
        };
      }

      // 🔥 CONVERTIR CORRECTAMENTE LOS DATOS
      const appointmentData: CreateAppointmentData = {
        doctorId: userData.id,
        patientId: patientId ? parseInt(patientId) : null,
        guestName: guestName || null,
        guestEmail: guestEmail || null,
        guestPhone: guestPhone || null,
        guestRut: guestRut || null,
        title,
        description: description || null,
        appointmentDate: appointmentDateTime,
        duration: 60,
        type,
        notes: notes || null
      };

      const newAppointment = await AppointmentService.create(appointmentData);

      return {
        statusCode: 201,
        body: JSON.stringify({
          message: "Cita creada exitosamente",
          appointment: newAppointment
        }),
        headers: HEADERS.json,
      };
    }

    // PUT /appointments/:id - Actualizar cita
    if (httpMethod === "PUT" && path.includes("/")) {
      const appointmentId = parseInt(path.split("/").pop() || "0");
      
      if (!appointmentId) {
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

      // 🔥 CREAR OBJETO CON TIPOS CORRECTOS
      const updateData: UpdateAppointmentData = {};
      
      if (title) updateData.title = title;
      if (description !== undefined) updateData.description = description || null;
      if (appointmentDate) {
        const newDateTime = new Date(appointmentDate);
        
        // Verificar disponibilidad si se cambia la fecha/hora
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
    if (httpMethod === "DELETE" && path.includes("/")) {
      const appointmentId = parseInt(path.split("/").pop() || "0");
      
      if (!appointmentId) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: "ID de cita inválido" }),
          headers: HEADERS.json,
        };
      }

      const deletedAppointment = await AppointmentService.delete(appointmentId, userData.id);
      
      if (!deletedAppointment) {
        return {
          statusCode: 404,
          body: JSON.stringify({ message: "Cita no encontrada" }),
          headers: HEADERS.json,
        };
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
    console.error("Error in appointments handler:", error);
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