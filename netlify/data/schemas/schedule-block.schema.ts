// netlify/data/schemas/schedule-block.schema.ts
import {
  serial,
  integer,
  varchar,
  text,
  timestamp,
  time,
  pgTable,
  index,
  date
} from "drizzle-orm/pg-core";
import { usersTable } from "./user.schema";

export const scheduleBlocksTable = pgTable("schedule_blocks", {
  id: serial("id").primaryKey(),

  // Doctor que crea el bloqueo
  doctorId: integer("doctor_id").notNull().references(() => usersTable.id, {
    onDelete: "cascade",
    onUpdate: "cascade"
  }),

  // Tipo de bloqueo: single_date (un día específico) o recurring (recurrente)
  blockType: varchar("block_type", { length: 20 }).notNull().default("single_date"), // single_date, recurring

  // Fechas y horas
  blockDate: date("block_date").notNull(), // Fecha del bloqueo (para single_date o inicio de recurrencia)
  startTime: time("start_time").notNull(), // Hora de inicio (ej: 14:00)
  endTime: time("end_time").notNull(), // Hora de fin (ej: 17:00)

  // Para bloqueos recurrentes
  recurringPattern: varchar("recurring_pattern", { length: 50 }), // daily, weekly, monday, tuesday, etc
  recurringEndDate: date("recurring_end_date"), // Fecha final de recurrencia (opcional, si es indefinido)

  // Razón del bloqueo
  reason: text("reason"), // Ej: Capacitación, Almuerzo, Descanso, etc

  // Timestamps
  createdAt: timestamp("created_at", { withTimezone: false }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: false }).defaultNow()
}, (table) => ({
  // Índices para búsquedas eficientes
  doctorIdx: index('idx_schedule_blocks_doctor')
    .on(table.doctorId),

  dateIdx: index('idx_schedule_blocks_date')
    .on(table.blockDate),

  doctorDateIdx: index('idx_schedule_blocks_doctor_date')
    .on(table.doctorId, table.blockDate),

  blockTypeIdx: index('idx_schedule_blocks_type')
    .on(table.blockType)
}));

export type ScheduleBlock = typeof scheduleBlocksTable.$inferSelect;
export type NewScheduleBlock = typeof scheduleBlocksTable.$inferInsert;

// Constantes para tipos de bloqueo
export const BLOCK_TYPES = {
  SINGLE_DATE: 'single_date',
  RECURRING: 'recurring'
} as const;

// Constantes para patrones recurrentes
export const RECURRING_PATTERNS = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONDAY: 'monday',
  TUESDAY: 'tuesday',
  WEDNESDAY: 'wednesday',
  THURSDAY: 'thursday',
  FRIDAY: 'friday',
  SATURDAY: 'saturday',
  SUNDAY: 'sunday'
} as const;

// Constantes para razones de bloqueo (opcionales, para sugerencias)
export const BLOCK_REASONS = {
  LUNCH: 'Almuerzo',
  BREAK: 'Descanso',
  TRAINING: 'Capacitación',
  MEETING: 'Reunión',
  PERSONAL: 'Asunto personal',
  VACATION: 'Vacaciones',
  SICK_LEAVE: 'Licencia médica',
  OTHER: 'Otro'
} as const;
