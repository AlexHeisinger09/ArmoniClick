// netlify/data/schemas/appointment.schema.ts - CON TIMESTAMP SIMPLE
import { 
  integer, 
  varchar, 
  text, 
  timestamp, 
  boolean, 
  serial, 
  pgTable,
  index
} from "drizzle-orm/pg-core";
import { usersTable } from "./user.schema";
import { patientsTable } from "./patient.schema";
import { locationsTable } from "./location.schema";

export const appointmentsTable = pgTable("appointments", {
  id: serial("id").primaryKey(),
  doctorId: integer("doctor_id").references(() => usersTable.id).notNull(),
  patientId: integer("patient_id").references(() => patientsTable.id),
  locationId: integer("location_id").references(() => locationsTable.id),
  
  // Campos para invitados (pacientes no registrados)
  guestName: varchar("guest_name", { length: 255 }),
  guestEmail: varchar("guest_email", { length: 255 }),
  guestPhone: varchar("guest_phone", { length: 50 }),
  guestRut: varchar("guest_rut", { length: 20 }),
  
  // Datos de la cita
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  // ✅ CORRECCIÓN - Usar timestamp simple SIN timezone para evitar conversiones
  appointmentDate: timestamp("appointment_date", { withTimezone: false }).notNull(),
  duration: integer("duration").default(60),
  status: varchar("status", { length: 20 }).default("pending"),
  type: varchar("type", { length: 20 }).default("consultation"),
  notes: text("notes"),
  
  // Campos para cancelación
  cancellationReason: text("cancellation_reason"),
  
  // Campos para confirmación y notificaciones
  confirmationToken: varchar("confirmation_token", { length: 255 }).unique(),
  confirmedAt: timestamp("confirmed_at", { withTimezone: false }),
  
  // Campos para recordatorios
  reminderSent: boolean("reminder_sent").default(false),
  reminderSentAt: timestamp("reminder_sent_at", { withTimezone: false }),
  
  // Timestamps - también sin timezone
  createdAt: timestamp("created_at", { withTimezone: false }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: false }).defaultNow()
}, (table) => ({
  // Índices existentes
  doctorIdx: index('idx_appointments_doctor').on(table.doctorId),
  patientIdx: index('idx_appointments_patient').on(table.patientId),
  dateIdx: index('idx_appointments_date').on(table.appointmentDate),
  statusIdx: index('idx_appointments_status').on(table.status),
  
  // Índices para notificaciones
  confirmationTokenIdx: index('idx_appointments_confirmation_token').on(table.confirmationToken),
  reminderIdx: index('idx_appointments_reminder').on(table.reminderSent, table.appointmentDate),
  
  // Índice compuesto para encontrar citas que necesitan recordatorio
  reminderDueIdx: index('idx_appointments_reminder_due')
    .on(table.appointmentDate, table.reminderSent, table.status),
}));

export type Appointment = typeof appointmentsTable.$inferSelect;
export type NewAppointment = typeof appointmentsTable.$inferInsert;

// Constantes para estados de notificaciones
export const NOTIFICATION_STATUS = {
  PENDING: 'pending',
  SENT: 'sent',
  FAILED: 'failed',
  REMINDER_SENT: 'reminder_sent'
} as const;

// Constantes para tipos de notificación
export const NOTIFICATION_TYPE = {
  CONFIRMATION: 'confirmation',
  REMINDER: 'reminder',
  CANCELLATION: 'cancellation',
  STATUS_CHANGE: 'status_change'
} as const;