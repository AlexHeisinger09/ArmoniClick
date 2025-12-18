// netlify/services/appointment.service.ts - COMPLETO DESDE CERO SIN CONVERSIONES TIMEZONE
import { eq, and, between, sql } from "drizzle-orm";
import { db } from "../data/db";
import { appointmentsTable } from "../data/schemas/appointment.schema";
import { usersTable } from "../data/schemas/user.schema";
import { patientsTable } from "../data/schemas/patient.schema";
import { locationsTable } from "../data/schemas/location.schema";
import { TokenService } from "./token.service";
import { NotificationService } from "./notification.service";

// Tipos para las respuestas del servicio
export interface CreateAppointmentData {
  doctorId: number;
  patientId?: number | null;
  locationId?: number | null;
  guestName?: string | null;
  guestEmail?: string | null;
  guestPhone?: string | null;
  guestRut?: string | null;
  title: string;
  description?: string | null;
  appointmentDate: Date;
  duration?: number | null;
  type?: string | null;
  notes?: string | null;
}

export interface UpdateAppointmentData {
  title?: string;
  description?: string | null;
  appointmentDate?: Date;
  duration?: number | null;
  type?: string | null;
  notes?: string | null;
  status?: string | null;
  cancellationReason?: string | null;
}

export interface AppointmentWithDetails {
  id: number;
  title: string;
  description: string | null;
  appointmentDate: Date;
  duration: number | null;
  status: string | null;
  type: string | null;
  notes: string | null;
  cancellationReason: string | null;
  confirmedAt: Date | null;
  reminderSent: boolean | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  confirmationToken: string | null;

  // Datos del paciente
  patientId: number | null;
  patientName: string | null;
  patientLastName: string | null;
  patientEmail: string | null;
  patientPhone: string | null;
  patientRut: string | null;

  // Datos del invitado
  guestName: string | null;
  guestEmail: string | null;
  guestPhone: string | null;
  guestRut: string | null;

  // Datos del doctor
  doctorName: string | null;
  doctorLastName: string | null;
}

export interface AppointmentSummary {
  id: number;
  title: string;
  appointmentDate: Date;
  duration: number | null;
  status: string | null;
  type: string | null;
  patientId: number | null;
  patientName: string;
  patientEmail: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  confirmedAt: Date | null;
  cancellationReason: string | null;
}

export class AppointmentService {
  private static notificationService = new NotificationService();

  // Crear nueva cita SIN configuraciones de timezone complejas
  static async create(data: CreateAppointmentData) {
    try {
      console.log('🔍 Creating appointment with data:', data);

      const appointmentDate = data.appointmentDate;

      console.log('📅 Raw appointment date:', {
        originalDate: appointmentDate.toISOString(),
        localString: appointmentDate.toString(),
        hours: appointmentDate.getHours(),
        minutes: appointmentDate.getMinutes(),
        year: appointmentDate.getFullYear(),
        month: appointmentDate.getMonth() + 1,
        day: appointmentDate.getDate()
      });

      // 1. Verificar disponibilidad
      console.log('📅 Checking availability before creating appointment...');
      const isAvailable = await this.checkAvailability(
        data.doctorId,
        appointmentDate,
        data.duration || 60
      );

      console.log('📊 Availability check result:', {
        isAvailable,
        doctorId: data.doctorId,
        appointmentDate: appointmentDate.toISOString(),
        duration: data.duration || 60
      });

      if (!isAvailable) {
        console.log('⚠️ Time slot not available, but allowing overbook');
      }

      // 2. Generar token de confirmación
      const confirmationToken = TokenService.generateConfirmationToken();

      console.log('💾 About to save appointment to database:', {
        appointmentDate: appointmentDate.toISOString(),
        expectedHour: appointmentDate.getHours(),
        expectedMinute: appointmentDate.getMinutes(),
        shouldSaveAs: `${appointmentDate.getHours()}:${appointmentDate.getMinutes().toString().padStart(2, '0')}`
      });

      // 3. Insertar en base de datos
      const [appointment] = await db
        .insert(appointmentsTable)
        .values({
          doctorId: data.doctorId,
          patientId: data.patientId || null,
          locationId: data.locationId || null,
          guestName: data.guestName || null,
          guestEmail: data.guestEmail || null,
          guestPhone: data.guestPhone || null,
          guestRut: data.guestRut || null,
          title: data.title,
          description: data.description || null,
          appointmentDate: appointmentDate,
          duration: data.duration || 60,
          type: data.type || 'consultation',
          notes: data.notes || null,
          status: 'pending',
          confirmationToken: confirmationToken,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();

      console.log('✅ Appointment saved to database:', {
        id: appointment.id,
        savedDate: appointment.appointmentDate,
        savedDateISO: appointment.appointmentDate.toISOString(),
        savedHours: appointment.appointmentDate.getHours(),
        savedMinutes: appointment.appointmentDate.getMinutes(),
        expectedVsActual: {
          expected: `${appointmentDate.getHours()}:${appointmentDate.getMinutes().toString().padStart(2, '0')}`,
          actual: `${appointment.appointmentDate.getHours()}:${appointment.appointmentDate.getMinutes().toString().padStart(2, '0')}`
        },
        title: appointment.title
      });

      // 4. Obtener datos completos para el email
      try {
        const appointmentDetails = await this.getAppointmentDetailsForEmail(appointment.id);

        if (appointmentDetails) {
          console.log('📧 Sending confirmation email with date:', {
            emailDate: appointment.appointmentDate.toISOString(),
            emailHours: appointment.appointmentDate.getHours(),
            emailMinutes: appointment.appointmentDate.getMinutes()
          });

          // 5. Enviar email de confirmación al paciente con archivo .ics
          await this.notificationService.sendAppointmentConfirmation({
            appointmentId: appointment.id,
            patientName: appointmentDetails.patientName,
            patientEmail: appointmentDetails.patientEmail,
            doctorName: appointmentDetails.doctorName,
            doctorEmail: appointmentDetails.doctorEmail,
            appointmentDate: appointment.appointmentDate,
            service: appointment.title,
            duration: appointment.duration || 60,
            notes: appointment.notes || undefined,
            confirmationToken: confirmationToken,
            location: appointmentDetails.location
          });

          // 6. Enviar email de confirmación al doctor
          await this.notificationService.sendAppointmentConfirmationToDoctor({
            appointmentId: appointment.id,
            patientName: appointmentDetails.patientName,
            patientEmail: appointmentDetails.patientEmail,
            doctorName: appointmentDetails.doctorName,
            doctorEmail: appointmentDetails.doctorEmail,
            appointmentDate: appointment.appointmentDate,
            service: appointment.title,
            duration: appointment.duration || 60,
            notes: appointment.notes || undefined,
            confirmationToken: confirmationToken,
            location: appointmentDetails.location
          });
        }
      } catch (emailError) {
        console.error('⚠️ Error sending confirmation emails (appointment created successfully):', emailError);
      }

      return appointment;
    } catch (error) {
      console.error("❌ Error creating appointment:", error);
      throw new Error("Error al crear la cita");
    }
  }

  // Método helper para obtener datos completos del appointment para email
  private static async getAppointmentDetailsForEmail(appointmentId: number) {
    try {
      const result = await db
        .select({
          id: appointmentsTable.id,
          title: appointmentsTable.title,
          appointmentDate: appointmentsTable.appointmentDate,
          duration: appointmentsTable.duration,
          notes: appointmentsTable.notes,
          confirmationToken: appointmentsTable.confirmationToken,

          // Datos del paciente registrado
          patientName: patientsTable.nombres,
          patientLastName: patientsTable.apellidos,
          patientEmail: patientsTable.email,

          // Datos del invitado
          guestName: appointmentsTable.guestName,
          guestEmail: appointmentsTable.guestEmail,

          // Datos del doctor
          doctorName: usersTable.name,
          doctorLastName: usersTable.lastName,
          doctorEmail: usersTable.email,

          // Datos de la sucursal/ubicación
          locationName: locationsTable.name,
          locationAddress: locationsTable.address,
          locationCity: locationsTable.city
        })
        .from(appointmentsTable)
        .leftJoin(patientsTable, eq(appointmentsTable.patientId, patientsTable.id))
        .innerJoin(usersTable, eq(appointmentsTable.doctorId, usersTable.id))
        .leftJoin(locationsTable, eq(appointmentsTable.locationId, locationsTable.id))
        .where(eq(appointmentsTable.id, appointmentId))
        .limit(1);

      const appointment = result[0];

      if (!appointment) {
        throw new Error(`Appointment ${appointmentId} not found`);
      }

      // Determinar nombre y email del paciente (registrado o invitado)
      const patientName = appointment.patientName
        ? `${appointment.patientName} ${appointment.patientLastName || ''}`.trim()
        : appointment.guestName || 'Paciente';

      const patientEmail = appointment.patientEmail || appointment.guestEmail;

      if (!patientEmail) {
        console.warn('⚠️ No email found for patient in appointment:', appointmentId);
        return null;
      }

      // Construir dirección completa de la ubicación
      const location = appointment.locationName
        ? `${appointment.locationName}, ${appointment.locationAddress}, ${appointment.locationCity}`
        : undefined;

      return {
        patientName,
        patientEmail,
        doctorName: `${appointment.doctorName} ${appointment.doctorLastName || ''}`.trim(),
        doctorEmail: appointment.doctorEmail,
        location
      };
    } catch (error) {
      console.error('❌ Error getting appointment details for email:', error);
      return null;
    }
  }

  // Buscar cita por ID con detalles completos
  static async findById(id: number, doctorId: number): Promise<AppointmentWithDetails | null> {
    try {
      const result = await db
        .select({
          // Datos de la cita
          id: appointmentsTable.id,
          title: appointmentsTable.title,
          description: appointmentsTable.description,
          appointmentDate: appointmentsTable.appointmentDate,
          duration: appointmentsTable.duration,
          status: appointmentsTable.status,
          type: appointmentsTable.type,
          notes: appointmentsTable.notes,
          cancellationReason: appointmentsTable.cancellationReason,
          confirmedAt: appointmentsTable.confirmedAt,
          reminderSent: appointmentsTable.reminderSent,
          createdAt: appointmentsTable.createdAt,
          updatedAt: appointmentsTable.updatedAt,
          confirmationToken: appointmentsTable.confirmationToken,

          // Datos del paciente registrado
          patientId: patientsTable.id,
          patientName: patientsTable.nombres,
          patientLastName: patientsTable.apellidos,
          patientEmail: patientsTable.email,
          patientPhone: patientsTable.telefono,
          patientRut: patientsTable.rut,

          // Datos del invitado
          guestName: appointmentsTable.guestName,
          guestEmail: appointmentsTable.guestEmail,
          guestPhone: appointmentsTable.guestPhone,
          guestRut: appointmentsTable.guestRut,

          // Datos del doctor
          doctorName: usersTable.name,
          doctorLastName: usersTable.lastName
        })
        .from(appointmentsTable)
        .leftJoin(patientsTable, eq(appointmentsTable.patientId, patientsTable.id))
        .innerJoin(usersTable, eq(appointmentsTable.doctorId, usersTable.id))
        .where(and(
          eq(appointmentsTable.id, id),
          eq(appointmentsTable.doctorId, doctorId)
        ))
        .limit(1);

      const appointment = result[0] || null;

      if (appointment) {
        console.log('🔍 Found appointment by ID:', {
          id: appointment.id,
          title: appointment.title,
          appointmentDate: appointment.appointmentDate,
          hours: appointment.appointmentDate?.getHours(),
          minutes: appointment.appointmentDate?.getMinutes(),
          patientName: appointment.patientName,
          guestName: appointment.guestName
        });
      }

      return appointment;
    } catch (error) {
      console.error("Error finding appointment by ID:", error);
      throw new Error("Error al buscar la cita");
    }
  }

  // Buscar citas por doctor con filtros opcionales
  static async findByDoctor(
    doctorId: number,
    startDate?: Date,
    endDate?: Date
  ): Promise<AppointmentSummary[]> {
    try {
      const conditions = [eq(appointmentsTable.doctorId, doctorId)];

      if (startDate && endDate) {
        conditions.push(between(appointmentsTable.appointmentDate, startDate, endDate));
      }

      const result = await db
        .select({
          id: appointmentsTable.id,
          title: appointmentsTable.title,
          appointmentDate: appointmentsTable.appointmentDate,
          duration: appointmentsTable.duration,
          status: appointmentsTable.status,
          type: appointmentsTable.type,

          // ✅ AGREGAR patientId
          patientId: appointmentsTable.patientId,

          patientName: sql<string>`
          CASE
            WHEN ${patientsTable.nombres} IS NOT NULL AND ${patientsTable.apellidos} IS NOT NULL
            THEN CONCAT(${patientsTable.nombres}, ' ', ${patientsTable.apellidos})
            WHEN ${patientsTable.nombres} IS NOT NULL
            THEN ${patientsTable.nombres}
            WHEN ${appointmentsTable.guestName} IS NOT NULL
            THEN ${appointmentsTable.guestName}
            ELSE 'Sin nombre'
          END
        `,
          patientEmail: sql<string>`
          COALESCE(
            ${patientsTable.email},
            ${appointmentsTable.guestEmail},
            ''
          )
        `,
          // ✅ AGREGAR campos de timestamps y estados
          createdAt: appointmentsTable.createdAt,
          updatedAt: appointmentsTable.updatedAt,
          confirmedAt: appointmentsTable.confirmedAt,
          cancellationReason: appointmentsTable.cancellationReason
        })
        .from(appointmentsTable)
        .leftJoin(patientsTable, eq(appointmentsTable.patientId, patientsTable.id))
        .where(and(...conditions))
        .orderBy(appointmentsTable.appointmentDate);

      console.log('🔍 Found appointments by doctor:', {
        doctorId,
        count: result.length,
        appointments: result.map(apt => ({
          id: apt.id,
          title: apt.title,
          patientId: apt.patientId, // ✅ Log para verificar
          patientName: apt.patientName,
          appointmentDate: apt.appointmentDate
        }))
      });

      return result;
    } catch (error) {
      console.error("Error finding appointments by doctor:", error);
      throw new Error("Error al buscar las citas del doctor");
    }
  }
  // Actualizar cita
  static async update(
    id: number,
    doctorId: number,
    data: UpdateAppointmentData
  ) {
    try {
      console.log('🔍 Updating appointment:', { id, doctorId, data });

      const [appointment] = await db
        .update(appointmentsTable)
        .set({
          ...data,
          updatedAt: new Date()
        })
        .where(and(
          eq(appointmentsTable.id, id),
          eq(appointmentsTable.doctorId, doctorId)
        ))
        .returning();

      console.log('✅ Appointment updated successfully:', {
        id: appointment.id,
        appointmentDate: appointment.appointmentDate,
        hours: appointment.appointmentDate?.getHours(),
        minutes: appointment.appointmentDate?.getMinutes()
      });
      return appointment;
    } catch (error) {
      console.error("Error updating appointment:", error);
      throw new Error("Error al actualizar la cita");
    }
  }

  // Eliminar cita
  static async delete(id: number, doctorId: number) {
    try {
      const [appointment] = await db
        .delete(appointmentsTable)
        .where(and(
          eq(appointmentsTable.id, id),
          eq(appointmentsTable.doctorId, doctorId)
        ))
        .returning();

      console.log('✅ Appointment deleted:', {
        id: appointment?.id,
        title: appointment?.title
      });

      return appointment;
    } catch (error) {
      console.error("Error deleting appointment:", error);
      throw new Error("Error al eliminar la cita");
    }
  }

  // Buscar citas por rango de fechas (para disponibilidad)
  static async findByDateRange(
    doctorId: number,
    startDate: Date,
    endDate: Date
  ): Promise<AppointmentSummary[]> {
    try {
      console.log('🔍 Finding appointments by date range:', {
        doctorId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        startHours: startDate.getHours(),
        endHours: endDate.getHours()
      });

      const result = await db
        .select({
          id: appointmentsTable.id,
          title: appointmentsTable.title,
          appointmentDate: appointmentsTable.appointmentDate,
          duration: appointmentsTable.duration,
          status: appointmentsTable.status,
          type: appointmentsTable.type,

          // ✅ AGREGAR patientId
          patientId: appointmentsTable.patientId,

          patientName: sql<string>`
          CASE
            WHEN ${patientsTable.nombres} IS NOT NULL AND ${patientsTable.apellidos} IS NOT NULL
            THEN CONCAT(${patientsTable.nombres}, ' ', ${patientsTable.apellidos})
            WHEN ${patientsTable.nombres} IS NOT NULL
            THEN ${patientsTable.nombres}
            WHEN ${appointmentsTable.guestName} IS NOT NULL
            THEN ${appointmentsTable.guestName}
            ELSE 'Sin nombre'
          END
        `,
          patientEmail: sql<string>`
          COALESCE(
            ${patientsTable.email},
            ${appointmentsTable.guestEmail},
            ''
          )
        `,
          // ✅ AGREGAR campos de timestamps y estados
          createdAt: appointmentsTable.createdAt,
          updatedAt: appointmentsTable.updatedAt,
          confirmedAt: appointmentsTable.confirmedAt,
          cancellationReason: appointmentsTable.cancellationReason
        })
        .from(appointmentsTable)
        .leftJoin(patientsTable, eq(appointmentsTable.patientId, patientsTable.id))
        .where(and(
          eq(appointmentsTable.doctorId, doctorId),
          between(appointmentsTable.appointmentDate, startDate, endDate)
        ))
        .orderBy(appointmentsTable.appointmentDate);

      console.log('📊 Found appointments by date range:', {
        doctorId,
        count: result.length,
        appointments: result.map(apt => ({
          id: apt.id,
          appointmentDate: apt.appointmentDate,
          patientId: apt.patientId, // ✅ Log para verificar
          patientName: apt.patientName
        }))
      });

      return result;
    } catch (error) {
      console.error("Error finding appointments by date range:", error);
      throw new Error("Error al buscar citas por rango de fechas");
    }
  }

  // Verificar disponibilidad de horario
  static async checkAvailability(
    doctorId: number,
    appointmentDate: Date,
    duration: number = 60,
    excludeId?: number
  ): Promise<boolean> {
    try {
      console.log('🔍 Checking availability for:', {
        doctorId,
        appointmentDate: appointmentDate.toISOString(),
        hours: appointmentDate.getHours(),
        minutes: appointmentDate.getMinutes(),
        duration,
        excludeId
      });

      const startTime = new Date(appointmentDate);
      const endTime = new Date(appointmentDate.getTime() + duration * 60000);

      console.log('🕐 Time range to check:', {
        startTime: startTime.toISOString(),
        startHours: startTime.getHours(),
        startMinutes: startTime.getMinutes(),
        endTime: endTime.toISOString(),
        endHours: endTime.getHours(),
        endMinutes: endTime.getMinutes()
      });

      // Query para detectar conflictos reales
      const conflictQuery = await db
        .select({
          id: appointmentsTable.id,
          appointmentDate: appointmentsTable.appointmentDate,
          duration: appointmentsTable.duration,
          status: appointmentsTable.status,
          title: appointmentsTable.title
        })
        .from(appointmentsTable)
        .where(and(
          eq(appointmentsTable.doctorId, doctorId),
          // Solo citas no canceladas
          sql`${appointmentsTable.status} != 'cancelled'`,
          // Lógica de solapamiento más precisa
          sql`${appointmentsTable.appointmentDate} < ${endTime}`,
          sql`(${appointmentsTable.appointmentDate} + INTERVAL '1 minute' * COALESCE(${appointmentsTable.duration}, 60)) > ${startTime}`,
          // Excluir cita específica si se proporciona
          ...(excludeId ? [sql`${appointmentsTable.id} != ${excludeId}`] : [])
        ));

      console.log('📋 Found potential conflicts:', {
        count: conflictQuery.length,
        conflicts: conflictQuery.map(apt => ({
          id: apt.id,
          appointmentDate: apt.appointmentDate.toISOString(),
          hours: apt.appointmentDate?.getHours(),
          minutes: apt.appointmentDate?.getMinutes(),
          duration: apt.duration,
          status: apt.status,
          title: apt.title
        }))
      });

      // Verificación adicional - Analizar cada conflicto potencial
      let realConflicts = 0;

      for (const conflict of conflictQuery) {
        const conflictStart = new Date(conflict.appointmentDate);
        const conflictEnd = new Date(conflictStart.getTime() + (conflict.duration || 60) * 60000);

        console.log('🔍 Analyzing conflict:', {
          conflictId: conflict.id,
          conflictStart: conflictStart.toISOString(),
          conflictEnd: conflictEnd.toISOString(),
          conflictStartHours: conflictStart.getHours(),
          conflictEndHours: conflictEnd.getHours(),
          newStart: startTime.toISOString(),
          newEnd: endTime.toISOString(),
          newStartHours: startTime.getHours(),
          newEndHours: endTime.getHours()
        });

        // Verificar solapamiento real
        const hasRealOverlap = (
          startTime < conflictEnd && endTime > conflictStart
        );

        if (hasRealOverlap) {
          console.log('❌ Real conflict found:', {
            conflictId: conflict.id,
            title: conflict.title,
            conflictStart: conflictStart.toISOString(),
            conflictEnd: conflictEnd.toISOString()
          });
          realConflicts++;
        } else {
          console.log('✅ No real overlap with conflict:', conflict.id);
        }
      }

      const isAvailable = realConflicts === 0;

      console.log('📊 Availability result:', {
        isAvailable,
        realConflicts,
        totalPotentialConflicts: conflictQuery.length
      });

      return isAvailable;

    } catch (error) {
      console.error("❌ Error checking availability:", error);
      console.log('⚠️ Allowing appointment due to error in availability check');
      return true;
    }
  }

  // Actualizar solo el estado de una cita
  static async updateStatus(
    id: number,
    doctorId: number,
    status: string,
    reason?: string
  ) {
    try {
      const updateData: any = {
        status,
        updatedAt: new Date()
      };

      if (status === 'confirmed') {
        updateData.confirmedAt = new Date();
      }

      if (status === 'cancelled' && reason) {
        updateData.cancellationReason = reason;
      }

      const [appointment] = await db
        .update(appointmentsTable)
        .set(updateData)
        .where(and(
          eq(appointmentsTable.id, id),
          eq(appointmentsTable.doctorId, doctorId)
        ))
        .returning();

      console.log('✅ Appointment status updated:', {
        id: appointment?.id,
        status: appointment?.status,
        appointmentDate: appointment?.appointmentDate,
        hours: appointment?.appointmentDate?.getHours()
      });

      return appointment;
    } catch (error) {
      console.error("Error updating appointment status:", error);
      throw new Error("Error al actualizar el estado de la cita");
    }
  }

  // Obtener próximas citas
  static async getUpcomingAppointments(
    doctorId: number,
    limit: number = 10
  ): Promise<AppointmentSummary[]> {
    try {
      const now = new Date();

      const result = await db
        .select({
          id: appointmentsTable.id,
          title: appointmentsTable.title,
          appointmentDate: appointmentsTable.appointmentDate,
          duration: appointmentsTable.duration,
          status: appointmentsTable.status,
          type: appointmentsTable.type,

          // ✅ AGREGAR patientId
          patientId: appointmentsTable.patientId,

          patientName: sql<string>`
          CASE
            WHEN ${patientsTable.nombres} IS NOT NULL AND ${patientsTable.apellidos} IS NOT NULL
            THEN CONCAT(${patientsTable.nombres}, ' ', ${patientsTable.apellidos})
            WHEN ${patientsTable.nombres} IS NOT NULL
            THEN ${patientsTable.nombres}
            WHEN ${appointmentsTable.guestName} IS NOT NULL
            THEN ${appointmentsTable.guestName}
            ELSE 'Sin nombre'
          END
        `,
          patientEmail: sql<string>`
          COALESCE(
            ${patientsTable.email},
            ${appointmentsTable.guestEmail},
            ''
          )
        `,
          // ✅ AGREGAR campos de timestamps y estados
          createdAt: appointmentsTable.createdAt,
          updatedAt: appointmentsTable.updatedAt,
          confirmedAt: appointmentsTable.confirmedAt,
          cancellationReason: appointmentsTable.cancellationReason
        })
        .from(appointmentsTable)
        .leftJoin(patientsTable, eq(appointmentsTable.patientId, patientsTable.id))
        .where(and(
          eq(appointmentsTable.doctorId, doctorId),
          sql`${appointmentsTable.appointmentDate} > ${now}`,
          sql`${appointmentsTable.status} IN ('pending', 'confirmed')`
        ))
        .orderBy(appointmentsTable.appointmentDate)
        .limit(limit);

      return result;
    } catch (error) {
      console.error("Error getting upcoming appointments:", error);
      throw new Error("Error al obtener próximas citas");
    }
  }

  // Obtener citas para recordatorios (día siguiente)
  static async getAppointmentsForReminders(): Promise<AppointmentWithDetails[]> {
    try {
      // Calcular el día siguiente
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const dayAfterTomorrow = new Date(tomorrow);
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
      dayAfterTomorrow.setHours(0, 0, 0, 0);

      console.log('📅 Looking for reminders between:', {
        tomorrow: tomorrow.toISOString(),
        dayAfterTomorrow: dayAfterTomorrow.toISOString()
      });

      const result = await db
        .select({
          id: appointmentsTable.id,
          title: appointmentsTable.title,
          description: appointmentsTable.description,
          appointmentDate: appointmentsTable.appointmentDate,
          duration: appointmentsTable.duration,
          status: appointmentsTable.status,
          type: appointmentsTable.type,
          notes: appointmentsTable.notes,
          cancellationReason: appointmentsTable.cancellationReason,
          confirmedAt: appointmentsTable.confirmedAt,
          reminderSent: appointmentsTable.reminderSent,
          createdAt: appointmentsTable.createdAt,
          updatedAt: appointmentsTable.updatedAt,
          confirmationToken: appointmentsTable.confirmationToken,

          // Datos del paciente registrado
          patientId: patientsTable.id,
          patientName: patientsTable.nombres,
          patientLastName: patientsTable.apellidos,
          patientEmail: patientsTable.email,
          patientPhone: patientsTable.telefono,
          patientRut: patientsTable.rut,

          // Datos del invitado
          guestName: appointmentsTable.guestName,
          guestEmail: appointmentsTable.guestEmail,
          guestPhone: appointmentsTable.guestPhone,
          guestRut: appointmentsTable.guestRut,

          // Datos del doctor
          doctorName: usersTable.name,
          doctorLastName: usersTable.lastName
        })
        .from(appointmentsTable)
        .leftJoin(patientsTable, eq(appointmentsTable.patientId, patientsTable.id))
        .innerJoin(usersTable, eq(appointmentsTable.doctorId, usersTable.id))
        .where(and(
          // Citas para mañana
          sql`${appointmentsTable.appointmentDate} >= ${tomorrow}`,
          sql`${appointmentsTable.appointmentDate} < ${dayAfterTomorrow}`,
          // Solo citas pendientes o confirmadas
          sql`${appointmentsTable.status} IN ('pending', 'confirmed')`,
          // Que no se haya enviado recordatorio
          eq(appointmentsTable.reminderSent, false)
        ))
        .orderBy(appointmentsTable.appointmentDate);

      console.log('📅 Found appointments for reminders:', {
        tomorrow: tomorrow.toISOString(),
        count: result.length,
        appointments: result.map(apt => ({
          id: apt.id,
          appointmentDate: apt.appointmentDate?.toISOString(),
          localTime: apt.appointmentDate?.toLocaleString('es-CL', { timeZone: 'America/Santiago' }),
          patientName: apt.patientName || apt.guestName,
          reminderSent: apt.reminderSent
        }))
      });

      return result;
    } catch (error) {
      console.error("Error getting appointments for reminders:", error);
      throw new Error("Error al obtener citas para recordatorios");
    }
  }

  // Marcar recordatorio como enviado
  static async markReminderSent(appointmentId: number): Promise<void> {
    try {
      await db
        .update(appointmentsTable)
        .set({
          reminderSent: true,
          reminderSentAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(appointmentsTable.id, appointmentId));

      console.log('✅ Marked reminder as sent for appointment:', appointmentId);
    } catch (error) {
      console.error('❌ Error marking reminder as sent:', error);
      throw new Error('Error al marcar recordatorio como enviado');
    }
  }

  // Enviar recordatorios masivos
  static async sendBatchReminders(): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    try {
      console.log('🔔 Starting batch reminders process...');

      const appointments = await this.getAppointmentsForReminders();

      console.log(`📧 Processing ${appointments.length} appointments for reminders...`);

      for (const appointment of appointments) {
        try {
          console.log(`🔍 Processing appointment ${appointment.id}:`, {
            id: appointment.id,
            title: appointment.title,
            appointmentDate: appointment.appointmentDate?.toISOString(),
            hours: appointment.appointmentDate?.getHours(),
            minutes: appointment.appointmentDate?.getMinutes(),
            patientName: appointment.patientName,
            guestName: appointment.guestName,
            patientEmail: appointment.patientEmail,
            guestEmail: appointment.guestEmail,
            reminderSent: appointment.reminderSent,
            confirmationToken: appointment.confirmationToken
          });

          // Determinar datos del paciente (registrado o invitado)
          const patientName = appointment.patientName
            ? `${appointment.patientName} ${appointment.patientLastName || ''}`.trim()
            : appointment.guestName || 'Paciente';

          const patientEmail = appointment.patientEmail || appointment.guestEmail;

          if (!patientEmail) {
            console.warn(`⚠️ No email for appointment ${appointment.id}, skipping...`);
            failed++;
            continue;
          }

          if (!appointment.confirmationToken) {
            console.warn(`⚠️ No confirmation token for appointment ${appointment.id}, skipping...`);
            failed++;
            continue;
          }

          if (!appointment.appointmentDate) {
            console.warn(`⚠️ No appointment date for appointment ${appointment.id}, skipping...`);
            failed++;
            continue;
          }

          const doctorName = `${appointment.doctorName || ''} ${appointment.doctorLastName || ''}`.trim();

          console.log(`📧 Sending reminder for appointment ${appointment.id}:`, {
            patientName,
            patientEmail,
            doctorName,
            appointmentDate: appointment.appointmentDate.toISOString(),
            appointmentHours: appointment.appointmentDate.getHours(),
            appointmentMinutes: appointment.appointmentDate.getMinutes(),
            service: appointment.title,
            duration: appointment.duration || 60,
            confirmationToken: appointment.confirmationToken
          });

          // Enviar recordatorio
          const reminderSent = await this.notificationService.sendAppointmentReminder({
            appointmentId: appointment.id,
            patientName,
            patientEmail,
            doctorName,
            appointmentDate: appointment.appointmentDate,
            service: appointment.title,
            duration: appointment.duration || 60,
            notes: appointment.notes || undefined,
            confirmationToken: appointment.confirmationToken
          });

          if (reminderSent) {
            // Marcar como enviado en la base de datos
            await this.markReminderSent(appointment.id);
            sent++;
            console.log(`✅ Reminder sent successfully for appointment ${appointment.id} to ${patientEmail}`);
          } else {
            failed++;
            console.error(`❌ Failed to send reminder for appointment ${appointment.id} to ${patientEmail}`);
          }

        } catch (appointmentError) {
          failed++;
          console.error(`❌ Error processing individual appointment ${appointment.id}:`, appointmentError);
        }
      }

      console.log(`📊 Batch reminders process completed:`, {
        totalProcessed: appointments.length,
        sent,
        failed,
        successRate: appointments.length > 0 ? `${Math.round((sent / appointments.length) * 100)}%` : '0%'
      });

      return { sent, failed };

    } catch (error) {
      console.error('❌ Error in batch reminder process:', error);
      console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack available');
      return { sent, failed };
    }
  }
}