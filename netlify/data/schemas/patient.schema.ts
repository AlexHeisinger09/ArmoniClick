// netlify/data/schemas/patient.schema.ts - CORREGIDO
import {
  serial,
  varchar,
  boolean,
  pgTable,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";
import { usersTable } from "./user.schema"; // ✅ Importar usersTable

export const patientsTable = pgTable("patients", {
  id: serial("id").primaryKey(),
  rut: varchar("rut").notNull().unique(),
  nombres: varchar("nombres").notNull(),
  apellidos: varchar("apellidos").notNull(),
  fecha_nacimiento: varchar("fecha_nacimiento").notNull(), // YYYY-MM-DD format
  telefono: varchar("telefono").notNull(),
  email: varchar("email").notNull(),
  direccion: varchar("direccion").notNull(),
  ciudad: varchar("ciudad").notNull(),
  codigo_postal: varchar("codigo_postal"),
  alergias: varchar("alergias"),
  medicamentos_actuales: varchar("medicamentos_actuales"),
  enfermedades_cronicas: varchar("enfermedades_cronicas"),
  cirugias_previas: varchar("cirugias_previas"),
  hospitalizaciones_previas: varchar("hospitalizaciones_previas"),
  notas_medicas: varchar("notas_medicas"),
  id_doctor: integer("id_doctor").notNull().references(() => usersTable.id),
  createdAt: timestamp("createdat").notNull().defaultNow(),
  updatedAt: timestamp("updatedat"),
  isActive: boolean("isactive").default(true),
});

export type InsertPatient = typeof patientsTable.$inferInsert;
export type SelectPatient = typeof patientsTable.$inferSelect;