// netlify/functions/confirm.ts - EXTRAER TOKEN DEL PATH
import { Handler, HandlerEvent } from "@netlify/functions";
import { HEADERS } from "../config/utils";
import { db } from "../data/db";
import { appointmentsTable } from "../data/schemas/appointment.schema";
import { usersTable } from "../data/schemas/user.schema";
import { patientsTable } from "../data/schemas/patient.schema";
import { locationsTable } from "../data/schemas/location.schema";
import { eq } from "drizzle-orm";
import { NotificationService } from "../services/notification.service";

const handler: Handler = async (event: HandlerEvent) => {
  console.log('🔍 Confirm function called:', {
    httpMethod: event.httpMethod,
    path: event.path,
    queryStringParameters: event.queryStringParameters
  });

  const { httpMethod, path } = event;

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

  try {
    // ✅ CORREGIDO - Extraer token del path O del query parameter
    let token: string | null = null;
    
    // Método 1: Query parameter (si la redirección funciona)
    if (event.queryStringParameters?.token) {
      token = event.queryStringParameters.token;
      console.log('✅ Token found in query:', token);
    }
    // Método 2: Del path (si viene directo)
    else {
      const pathParts = path.split('/');
      console.log('🔍 Path parts:', pathParts);
      
      // Buscar después de 'confirm-appointment' o como último segmento
      const confirmIndex = pathParts.findIndex(part => part === 'confirm-appointment');
      if (confirmIndex !== -1 && pathParts[confirmIndex + 1]) {
        token = pathParts[confirmIndex + 1];
        console.log('✅ Token found in path after confirm-appointment:', token);
      } else {
        // Último segmento válido
        const lastSegment = pathParts[pathParts.length - 1];
        if (lastSegment && lastSegment.length > 10) {
          token = lastSegment;
          console.log('✅ Token found as last path segment:', token);
        }
      }
    }
    
    if (!token) {
      console.log('❌ No token found in path or query:', { path, queryStringParameters: event.queryStringParameters });
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Token de confirmación requerido"
        }),
        headers: HEADERS.json,
      };
    }

    console.log('🔍 Confirming appointment with token:', token);

    // Buscar la cita por token
    const appointments = await db
      .select()
      .from(appointmentsTable)
      .where(eq(appointmentsTable.confirmationToken, token))
      .limit(1);

    const appointment = appointments[0];
    console.log('🔍 Found appointment:', appointment ? { id: appointment.id, status: appointment.status } : null);
    
    if (!appointment) {
      console.log('❌ No appointment found for token:', token);
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: "Cita no encontrada o token inválido"
        }),
        headers: HEADERS.json,
      };
    }

    // Verificar si ya está confirmada
    if (appointment.status === 'confirmed') {
      console.log('⚠️ Appointment already confirmed:', appointment.id);
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "La cita ya estaba confirmada",
          appointment: {
            id: appointment.id,
            title: appointment.title,
            appointmentDate: appointment.appointmentDate,
            status: appointment.status
          }
        }),
        headers: HEADERS.json,
      };
    }

    // Verificar que no esté cancelada
    if (appointment.status === 'cancelled') {
      console.log('❌ Cannot confirm cancelled appointment:', appointment.id);
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "No se puede confirmar una cita cancelada"
        }),
        headers: HEADERS.json,
      };
    }

    // Verificar que no haya pasado
    const appointmentDate = new Date(appointment.appointmentDate);
    const now = new Date();
    
    if (appointmentDate < now) {
      console.log('❌ Cannot confirm past appointment:', {
        appointmentId: appointment.id,
        appointmentDate: appointmentDate.toISOString(),
        now: now.toISOString()
      });
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "No se puede confirmar una cita que ya pasó"
        }),
        headers: HEADERS.json,
      };
    }

    // Confirmar la cita
    const [updatedAppointment] = await db
      .update(appointmentsTable)
      .set({
        status: 'confirmed',
        confirmedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(appointmentsTable.id, appointment.id))
      .returning();

    console.log('✅ Appointment confirmed successfully:', updatedAppointment.id);

    // Obtener datos del doctor, paciente y ubicación para notificar
    try {
      const [doctor] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, appointment.user_id))
        .limit(1);

      if (doctor && doctor.email) {
        const notificationService = new NotificationService();

        // Obtener nombre del paciente (puede ser guest o paciente registrado)
        let patientName = appointment.guestName || 'Paciente';
        if (appointment.patient_id) {
          const [patient] = await db
            .select()
            .from(patientsTable)
            .where(eq(patientsTable.id, appointment.patient_id))
            .limit(1);

          if (patient) {
            patientName = `${patient.name} ${patient.lastName}`;
          }
        }

        // Obtener ubicación si existe
        let locationName: string | undefined;
        if (appointment.location_id) {
          const [location] = await db
            .select()
            .from(locationsTable)
            .where(eq(locationsTable.id, appointment.location_id))
            .limit(1);

          if (location) {
            locationName = `${location.name} - ${location.address}, ${location.city}`;
          }
        }

        // Enviar notificación al doctor
        await notificationService.notifyDoctorAboutConfirmation({
          appointmentId: updatedAppointment.id,
          patientName,
          doctorName: `${doctor.name} ${doctor.lastName}`,
          doctorEmail: doctor.email,
          appointmentDate: new Date(updatedAppointment.appointmentDate),
          service: updatedAppointment.title,
          location: locationName
        });

        console.log('✅ Doctor notification sent successfully');
      }
    } catch (notificationError) {
      console.error('⚠️ Error sending doctor notification (non-critical):', notificationError);
      // No fallar la confirmación si falla la notificación
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Cita confirmada exitosamente",
        appointment: {
          id: updatedAppointment.id,
          title: updatedAppointment.title,
          appointmentDate: updatedAppointment.appointmentDate,
          status: updatedAppointment.status,
          confirmedAt: updatedAppointment.confirmedAt
        }
      }),
      headers: HEADERS.json,
    };

  } catch (error: any) {
    console.error("❌ Error confirming appointment:", error);
    console.error("❌ Stack:", error.stack);
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