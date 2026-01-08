import {
  pgTable,
  serial,
  varchar,
  timestamp,
  boolean,
  integer,
  text,
  pgEnum
} from "drizzle-orm/pg-core";
import { appointmentsTable } from "./appointment.schema";
import { usersTable } from "./user.schema";

// Enum para tipos de notificaciones
export const notificationTypeEnum = pgEnum('notification_type', [
  'appointment_confirmed',
  'appointment_cancelled'
]);

export const notificationsTable = pgTable("notifications", {
  id: serial("id").primaryKey(),

  // Tipo de notificación
  type: notificationTypeEnum("type").notNull(),

  // Doctor que recibe la notificación
  doctorId: integer("doctor_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),

  // Cita relacionada
  appointmentId: integer("appointment_id")
    .references(() => appointmentsTable.id, { onDelete: "cascade" }),

  // Contenido de la notificación
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),

  // Metadata adicional
  patientName: varchar("patient_name", { length: 255 }),
  appointmentDate: timestamp("appointment_date"),

  // Estado de lectura
  isRead: boolean("is_read").notNull().default(false),
  readAt: timestamp("read_at"),

  // Timestamps
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Notification = typeof notificationsTable.$inferSelect;
export type NewNotification = typeof notificationsTable.$inferInsert;
