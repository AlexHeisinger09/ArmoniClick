// netlify/functions/cancel-appointment.ts - TIPOS CORREGIDOS
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
  console.log('🔍 Cancel appointment function called:', {
    httpMethod: event.httpMethod,
    path: event.path,
    headers: event.headers,
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
    console.log('❌ Method not allowed:', httpMethod);
    return {
      statusCode: 405,
      body: JSON.stringify({
        message: "Method Not Allowed"
      }),
      headers: HEADERS.json,
    };
  }

  try {
    // Extraer token del query parameter
    const confirmationToken = event.queryStringParameters?.token;
    console.log('🔍 Extracting token from query:', confirmationToken);

    if (!confirmationToken) {
      console.log('❌ No token found in query parameters');
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Token de confirmación requerido"
        }),
        headers: HEADERS.json,
      };
    }

    console.log('🔍 Cancelling appointment with token:', confirmationToken);

    // Buscar la cita por token con JOIN para obtener datos del doctor, paciente y ubicación
    const appointmentsWithDetails = await db
      .select({
        appointment: appointmentsTable,
        doctor: usersTable,
        patient: patientsTable,
        location: locationsTable
      })
      .from(appointmentsTable)
      .leftJoin(usersTable, eq(appointmentsTable.doctorId, usersTable.id))
      .leftJoin(patientsTable, eq(appointmentsTable.patientId, patientsTable.id))
      .leftJoin(locationsTable, eq(appointmentsTable.locationId, locationsTable.id))
      .where(eq(appointmentsTable.confirmationToken, confirmationToken))
      .limit(1);

    const result = appointmentsWithDetails[0];
    console.log('🔍 Found appointment:', result?.appointment ? { id: result.appointment.id, status: result.appointment.status } : null);

    if (!result || !result.appointment) {
      console.log('❌ Appointment not found for token:', confirmationToken);
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: "Cita no encontrada o token inválido"
        }),
        headers: HEADERS.json,
      };
    }

    const appointment = result.appointment;
    const doctor = result.doctor;
    const patient = result.patient;
    const location = result.location;

    console.log('📋 Appointment details:', {
      appointmentId: appointment.id,
      guestName: appointment.guestName,
      patientId: appointment.patientId,
      hasPatient: !!patient,
      patient: patient ? {
        id: patient.id,
        nombres: patient.nombres,
        apellidos: patient.apellidos,
        fullName: `${patient.nombres} ${patient.apellidos}`
      } : null
    });

    // Verificar si la cita ya está cancelada
    if (appointment.status === 'cancelled') {
      console.log('⚠️ Appointment already cancelled:', appointment.id);
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "La cita ya estaba cancelada",
          appointment: {
            id: appointment.id,
            title: appointment.title,
            appointmentDate: appointment.appointmentDate,
            status: appointment.status,
            cancellationReason: appointment.cancellationReason
          }
        }),
        headers: HEADERS.json,
      };
    }

    // Verificar que la cita no haya pasado
    const appointmentDate = new Date(appointment.appointmentDate);
    const now = new Date();
    
    if (appointmentDate < now) {
      console.log('❌ Cannot cancel past appointment:', {
        appointmentId: appointment.id,
        appointmentDate: appointmentDate.toISOString(),
        now: now.toISOString()
      });
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "No se puede cancelar una cita que ya pasó"
        }),
        headers: HEADERS.json,
      };
    }

    // Verificar que no sea una cita completada
    if (appointment.status === 'completed') {
      console.log('❌ Cannot cancel completed appointment:', appointment.id);
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "No se puede cancelar una cita que ya fue completada"
        }),
        headers: HEADERS.json,
      };
    }

    // Cancelar la cita
    const [updatedAppointment] = await db
      .update(appointmentsTable)
      .set({
        status: 'cancelled',
        cancellationReason: 'Cancelado por el paciente desde email',
        updatedAt: new Date()
      })
      .where(eq(appointmentsTable.id, appointment.id))
      .returning();

    console.log('✅ Appointment cancelled successfully:', updatedAppointment.id);

    // Enviar notificación al doctor
    if (doctor && doctor.email) {
      try {
        const notificationService = new NotificationService();

        // Obtener nombre del paciente (puede ser invitado o registrado)
        let patientName = 'Paciente';

        if (appointment.guestName) {
          // Paciente invitado
          patientName = appointment.guestName;
        } else if (patient) {
          // Paciente registrado
          if (patient.nombres && patient.apellidos) {
            patientName = `${patient.nombres} ${patient.apellidos}`;
          } else if (patient.nombres) {
            patientName = patient.nombres;
          } else if (patient.apellidos) {
            patientName = patient.apellidos;
          }
        }

        const doctorName = `${doctor.name || ''} ${doctor.lastName || ''}`.trim() || 'Doctor';

        console.log('📧 Sending cancellation notification:', {
          patientName,
          doctorName,
          doctorEmail: doctor.email,
          appointmentGuestName: appointment.guestName,
          hasPatient: !!patient
        });

        await notificationService.notifyDoctorAboutCancellation({
          appointmentId: appointment.id,
          patientName: patientName,
          doctorName: doctorName,
          doctorEmail: doctor.email,
          appointmentDate: new Date(appointment.appointmentDate),
          service: appointment.title,
          location: location?.name,
          cancellationReason: 'Cancelado por el paciente desde email'
        });

        console.log('✅ Doctor cancellation notification sent successfully');
      } catch (notificationError) {
        console.error('⚠️ Failed to send doctor cancellation notification:', notificationError);
        // No fallar la cancelación si falla la notificación
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Cita cancelada exitosamente",
        appointment: {
          id: updatedAppointment.id,
          title: updatedAppointment.title,
          appointmentDate: updatedAppointment.appointmentDate,
          status: updatedAppointment.status,
          cancellationReason: updatedAppointment.cancellationReason
        }
      }),
      headers: HEADERS.json,
    };

  } catch (error: any) {
    console.error("❌ Error cancelling appointment:", error);
    console.error("❌ Error stack:", error.stack);
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