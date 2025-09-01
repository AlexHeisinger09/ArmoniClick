// netlify/data/schemas/appointment.schema.ts - CON TOKEN DE CONFIRMACIÓN
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

export const appointmentsTable = pgTable("appointments", {
  id: serial("id").primaryKey(),
  doctorId: integer("doctor_id").references(() => usersTable.id).notNull(),
  patientId: integer("patient_id").references(() => patientsTable.id),
  
  // Campos para invitados (pacientes no registrados)
  guestName: varchar("guest_name", { length: 255 }),
  guestEmail: varchar("guest_email", { length: 255 }),
  guestPhone: varchar("guest_phone", { length: 50 }),
  guestRut: varchar("guest_rut", { length: 20 }),
  
  // Datos de la cita
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  appointmentDate: timestamp("appointment_date").notNull(),
  duration: integer("duration").default(60),
  status: varchar("status", { length: 20 }).default("pending"), // pending, confirmed, cancelled, no-show, completed
  type: varchar("type", { length: 20 }).default("consultation"), // consultation, treatment, follow-up, emergency
  notes: text("notes"),
  
  // Campos para cancelación
  cancellationReason: text("cancellation_reason"),
  
  // 🔑 CAMPOS PARA CONFIRMACIÓN Y NOTIFICACIONES
  confirmationToken: varchar("confirmation_token", { length: 255 }).unique(), // 🔥 NUEVO CAMPO
  confirmedAt: timestamp("confirmed_at"),
  
  // 🔔 CAMPOS PARA RECORDATORIOS
  reminderSent: boolean("reminder_sent").default(false),
  reminderSentAt: timestamp("reminder_sent_at"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => ({
  // Índices existentes
  doctorIdx: index('idx_appointments_doctor').on(table.doctorId),
  patientIdx: index('idx_appointments_patient').on(table.patientId),
  dateIdx: index('idx_appointments_date').on(table.appointmentDate),
  statusIdx: index('idx_appointments_status').on(table.status),
  
  // 🔑 NUEVOS ÍNDICES PARA NOTIFICACIONES
  confirmationTokenIdx: index('idx_appointments_confirmation_token').on(table.confirmationToken),
  reminderIdx: index('idx_appointments_reminder').on(table.reminderSent, table.appointmentDate),
  
  // Índice compuesto para encontrar citas que necesitan recordatorio
  reminderDueIdx: index('idx_appointments_reminder_due')
    .on(table.appointmentDate, table.reminderSent, table.status),
}));

export type Appointment = typeof appointmentsTable.$inferSelect;
export type NewAppointment = typeof appointmentsTable.$inferInsert;

// 🔥 CONSTANTES PARA ESTADOS DE NOTIFICACIONES
export const NOTIFICATION_STATUS = {
  PENDING: 'pending',
  SENT: 'sent',
  FAILED: 'failed',
  REMINDER_SENT: 'reminder_sent'
} as const;

// 🔥 CONSTANTES PARA TIPOS DE NOTIFICACIÓN
export const NOTIFICATION_TYPE = {
  CONFIRMATION: 'confirmation',
  REMINDER: 'reminder',
  CANCELLATION: 'cancellation',
  STATUS_CHANGE: 'status_change'
} as const;