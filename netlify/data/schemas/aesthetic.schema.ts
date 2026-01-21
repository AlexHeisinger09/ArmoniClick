// netlify/data/schemas/aesthetic.schema.ts
import {
  serial,
  varchar,
  pgTable,
  timestamp,
  integer,
  text,
  index,
} from "drizzle-orm/pg-core";
import { usersTable } from "./user.schema";
import { patientsTable } from "./patient.schema";
import { budgetsTable } from "./budget.schema";

export const aestheticNotesTable = pgTable("aesthetic_notes", {
  id: serial("id").primaryKey(),
  patient_id: integer("patient_id").notNull().references(() => patientsTable.id, {
    onDelete: "cascade",
    onUpdate: "cascade"
  }),
  doctor_id: integer("doctor_id").notNull().references(() => usersTable.id, {
    onDelete: "restrict",
    onUpdate: "cascade"
  }),
  budget_id: integer("budget_id").references(() => budgetsTable.id, {
    onDelete: "cascade",
    onUpdate: "cascade"
  }),
  // JSON data for facial zones and their notes
  facial_data: text("facial_data").notNull(), // JSON.stringify(FacialAestheticState)
  // JSON data for drawings (lines, arrows, points)
  drawings_data: text("drawings_data").notNull(), // JSON.stringify(DrawingState)
  // Gender of the selected template
  gender: varchar("gender", { length: 10 }).default("female"), // 'female' or 'male'
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
}, (table) => ({
  // Composite index with doctor_id first for multi-tenant RLS optimization
  doctorPatientIdx: index('idx_aesthetic_notes_doctor_patient')
    .on(table.doctor_id, table.patient_id),

  // Index for budget queries
  budgetIdx: index('idx_aesthetic_notes_budget')
    .on(table.budget_id),

  // Index for created_at for sorting
  createdIdx: index('idx_aesthetic_notes_created')
    .on(table.created_at),
}));

// Tipos para TypeScript
export type InsertAestheticNote = typeof aestheticNotesTable.$inferInsert;
export type SelectAestheticNote = typeof aestheticNotesTable.$inferSelect;
