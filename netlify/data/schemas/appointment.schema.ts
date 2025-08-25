// netlify/data/schemas/appointment.schema.ts
import { 
  integer, 
  varchar, 
  text, 
  timestamp, 
  boolean, 
  serial, 
  pgTable 
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
  
  // Campos para confirmación
  confirmationToken: varchar("confirmation_token", { length: 255 }),
  confirmedAt: timestamp("confirmed_at"),
  
  // Campos para recordatorios
  reminderSent: boolean("reminder_sent").default(false),
  reminderSentAt: timestamp("reminder_sent_at"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export type Appointment = typeof appointmentsTable.$inferSelect;
export type NewAppointment = typeof appointmentsTable.$inferInsert;