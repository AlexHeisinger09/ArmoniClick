// netlify/data/schemas/prescription.schema.ts
import {
  serial,
  varchar,
  text,
  pgTable,
  timestamp,
  integer,
  index,
} from "drizzle-orm/pg-core";
import { usersTable } from "./user.schema";
import { patientsTable } from "./patient.schema";

export const prescriptionsTable = pgTable("prescriptions", {
  id: serial("id").primaryKey(),
  patient_id: integer("patient_id").notNull().references(() => patientsTable.id, {
    onDelete: "cascade",
    onUpdate: "cascade"
  }),
  user_id: integer("user_id").notNull().references(() => usersTable.id, {
    onDelete: "restrict",
    onUpdate: "cascade"
  }),
  medications: text("medications").notNull(), // Texto completo de las medicaciones
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
}, (table) => ({
  // Índices para búsquedas
  patientIdx: index('idx_prescriptions_patient')
    .on(table.patient_id),

  userIdx: index('idx_prescriptions_user')
    .on(table.user_id),

  createdIdx: index('idx_prescriptions_created')
    .on(table.created_at),
}));

// Tipos para TypeScript
export type InsertPrescription = typeof prescriptionsTable.$inferInsert;
export type SelectPrescription = typeof prescriptionsTable.$inferSelect;
