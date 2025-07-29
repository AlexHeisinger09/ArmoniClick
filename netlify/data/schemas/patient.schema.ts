// netlify/data/schemas/patient.schema.ts - ACTUALIZADO
import {
  serial,
  varchar,
  boolean,
  pgTable,
  timestamp,
  integer,
  uniqueIndex,
  index,
  ExtraConfigColumn,
} from "drizzle-orm/pg-core";
import { usersTable } from "./user.schema";
import { ColumnBaseConfig, ColumnDataType } from "drizzle-orm";

export const patientsTable = pgTable("patients", {
  id: serial("id").primaryKey(),
  rut: varchar("rut").notNull(), 
  nombres: varchar("nombres").notNull(),
  apellidos: varchar("apellidos").notNull(),
  fecha_nacimiento: varchar("fecha_nacimiento").notNull(),
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
}, (table) => ({
  // ✅ Índice único compuesto: RUT + DOCTOR (solo pacientes activos)
  rutDoctorUniqueIdx: uniqueIndex('patients_rut_doctor_unique')
    .on(table.rut, table.id_doctor)
    .where(eq(table.isActive, true)),
  
  // Índices para búsquedas
  rutSearchIdx: index('idx_patients_rut_search')
    .on(table.rut)
    .where(eq(table.isActive, true)),
  
  doctorIdx: index('idx_patients_doctor')
    .on(table.id_doctor),
    
  activeIdx: index('idx_patients_active')
    .on(table.isActive),
    
  createdIdx: index('idx_patients_created')
    .on(table.createdAt),
}));

export type InsertPatient = typeof patientsTable.$inferInsert;
export type SelectPatient = typeof patientsTable.$inferSelect;

function eq(isActive: ExtraConfigColumn<ColumnBaseConfig<ColumnDataType, string>>, arg1: boolean): import("drizzle-orm").SQL<unknown> {
  throw new Error("Function not implemented.");
}
