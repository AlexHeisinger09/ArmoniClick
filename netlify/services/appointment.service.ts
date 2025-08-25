// netlify/services/appointment.service.ts
import { eq, and, between, sql } from "drizzle-orm";
import { db } from "../data/db";
import { appointmentsTable } from "../data/schemas/appointment.schema";
import { usersTable } from "../data/schemas/user.schema";
import { patientsTable } from "../data/schemas/patient.schema";

// Tipos para las respuestas del servicio
export interface CreateAppointmentData {
  doctorId: number;
  patientId?: number | null;  // 🔥 Permitir null
  guestName?: string | null;  // 🔥 Permitir null
  guestEmail?: string | null; // 🔥 Permitir null
  guestPhone?: string | null; // 🔥 Permitir null
  guestRut?: string | null;   // 🔥 Permitir null
  title: string;
  description?: string | null; // 🔥 Permitir null
  appointmentDate: Date;
  duration?: number | null;    // 🔥 Permitir null
  type?: string | null;        // 🔥 Permitir null
  notes?: string | null;       // 🔥 Permitir null
}

export interface UpdateAppointmentData {
  title?: string;
  description?: string | null;        // 🔥 Permitir null
  appointmentDate?: Date;
  duration?: number | null;           // 🔥 Permitir null
  type?: string | null;               // 🔥 Permitir null
  notes?: string | null;              // 🔥 Permitir null
  status?: string | null;             // 🔥 Permitir null
  cancellationReason?: string | null; // 🔥 Permitir null
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
  patientName: string;
  patientEmail: string;
}

export class AppointmentService {
  // Crear nueva cita
  static async create(data: CreateAppointmentData) {
    try {
      const [appointment] = await db
        .insert(appointmentsTable)
        .values({
          doctorId: data.doctorId,
          patientId: data.patientId || null,
          guestName: data.guestName || null,
          guestEmail: data.guestEmail || null,
          guestPhone: data.guestPhone || null,
          guestRut: data.guestRut || null,
          title: data.title,
          description: data.description || null,
          appointmentDate: data.appointmentDate,
          duration: data.duration || 60,
          type: data.type || 'consultation',
          notes: data.notes || null,
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();

      return appointment;
    } catch (error) {
      console.error("Error creating appointment:", error);
      throw new Error("Error al crear la cita");
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

      return result[0] || null;
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
          patientName: sql<string>`
            COALESCE(
              CONCAT(${patientsTable.nombres}, ' ', ${patientsTable.apellidos}),
              ${appointmentsTable.guestName},
              'Sin nombre'
            )
          `,
          patientEmail: sql<string>`
            COALESCE(
              ${patientsTable.email},
              ${appointmentsTable.guestEmail},
              ''
            )
          `
        })
        .from(appointmentsTable)
        .leftJoin(patientsTable, eq(appointmentsTable.patientId, patientsTable.id))
        .where(and(...conditions))
        .orderBy(appointmentsTable.appointmentDate);

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
      const result = await db
        .select({
          id: appointmentsTable.id,
          title: appointmentsTable.title,
          appointmentDate: appointmentsTable.appointmentDate,
          duration: appointmentsTable.duration,
          status: appointmentsTable.status,
          type: appointmentsTable.type,
          patientName: sql<string>`
            COALESCE(
              CONCAT(${patientsTable.nombres}, ' ', ${patientsTable.apellidos}),
              ${appointmentsTable.guestName},
              'Sin nombre'
            )
          `,
          patientEmail: sql<string>`
            COALESCE(
              ${patientsTable.email},
              ${appointmentsTable.guestEmail},
              ''
            )
          `
        })
        .from(appointmentsTable)
        .leftJoin(patientsTable, eq(appointmentsTable.patientId, patientsTable.id))
        .where(and(
          eq(appointmentsTable.doctorId, doctorId),
          between(appointmentsTable.appointmentDate, startDate, endDate)
        ))
        .orderBy(appointmentsTable.appointmentDate);

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
      const startTime = appointmentDate;
      const endTime = new Date(appointmentDate.getTime() + duration * 60000);

      const conditions = [
        eq(appointmentsTable.doctorId, doctorId),
        sql`${appointmentsTable.status} != 'cancelled'`,
        sql`(
          ${appointmentsTable.appointmentDate} < ${endTime} AND 
          (${appointmentsTable.appointmentDate} + INTERVAL '1 minute' * COALESCE(${appointmentsTable.duration}, 60)) > ${startTime}
        )`
      ];

      if (excludeId) {
        conditions.push(sql`${appointmentsTable.id} != ${excludeId}`);
      }

      const conflicts = await db
        .select({ id: appointmentsTable.id })
        .from(appointmentsTable)
        .where(and(...conditions));

      return conflicts.length === 0;
    } catch (error) {
      console.error("Error checking availability:", error);
      throw new Error("Error al verificar disponibilidad");
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
          patientName: sql<string>`
            COALESCE(
              CONCAT(${patientsTable.nombres}, ' ', ${patientsTable.apellidos}),
              ${appointmentsTable.guestName},
              'Sin nombre'
            )
          `,
          patientEmail: sql<string>`
            COALESCE(
              ${patientsTable.email},
              ${appointmentsTable.guestEmail},
              ''
            )
          `
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
}