// netlify/data/schemas/patient.schema.ts
import {
  serial,
  varchar,
  date,
  integer,
  boolean,
  pgTable,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { usersTable } from "./user.schema";

export const patientsTable = pgTable("patients", {
  id: serial("id").primaryKey(),
  rut: varchar("rut").notNull().unique(),
  nombres: varchar("nombres").notNull(),
  apellidos: varchar("apellidos").notNull(),
  fechaNacimiento: date("fecha_nacimiento").notNull(),
  telefono: varchar("telefono"),
  email: varchar("email"),
  direccion: varchar("direccion"),
  ciudad: varchar("ciudad"),
  codigoPostal: varchar("codigo_postal"),
  idDoctor: integer("id_doctor").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt"),
  isActive: boolean("isActive").default(true),
}, (table) => {
  return {
    idDoctorIdx: index("patients_id_doctor_idx").on(table.idDoctor),
    rutIdx: index("patients_rut_idx").on(table.rut),
    activeIdx: index("patients_active_idx").on(table.isActive),
  };
});

export type InsertPatient = typeof patientsTable.$inferInsert;
export type SelectPatient = typeof patientsTable.$inferSelect;

