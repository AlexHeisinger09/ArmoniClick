// netlify/data/schemas/treatment.schema.ts - ACTUALIZADO
import {
  serial,
  varchar,
  boolean,
  pgTable,
  timestamp,
  integer,
  date,
  time,
  text,
  index,
} from "drizzle-orm/pg-core";
import { usersTable } from "./user.schema";
import { patientsTable } from "./patient.schema";
import { budgetItemsTable } from "./budget.schema"; // ✅ NUEVA IMPORTACIÓN

export const treatmentsTable = pgTable("treatments", {
  id_tratamiento: serial("id_tratamiento").primaryKey(),
  id_paciente: integer("id_paciente").notNull().references(() => patientsTable.id, {
    onDelete: "restrict",
    onUpdate: "cascade"
  }),
  id_doctor: integer("id_doctor").notNull().references(() => usersTable.id, {
    onDelete: "restrict", 
    onUpdate: "cascade"
  }),
  fecha_control: date("fecha_control").notNull().default(sql`CURRENT_DATE`),
  hora_control: time("hora_control").notNull(),
  fecha_proximo_control: date("fecha_proximo_control"),
  hora_proximo_control: time("hora_proximo_control"),
  nombre_servicio: varchar("nombre_servicio").notNull(),
  producto: varchar("producto"),
  lote_producto: varchar("lote_producto"),
  fecha_venc_producto: date("fecha_venc_producto"),
  dilucion: varchar("dilucion"),
  foto1: varchar("foto1"),
  foto2: varchar("foto2"),
  descripcion: text("descripcion"),
  
  // ✅ NUEVAS COLUMNAS
  budget_item_id: integer("budget_item_id").references(() => budgetItemsTable.id, {
    onDelete: "set null",
    onUpdate: "cascade"
  }),
  status: varchar("status", { length: 50 }).default("pending"), // pending, completed
  
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at"),
  is_active: boolean("is_active").default(true),
}, (table) => ({
  // Índices para búsquedas
  pacienteIdx: index('idx_treatments_id_paciente')
    .on(table.id_paciente),
  
  doctorIdx: index('idx_treatments_id_doctor')
    .on(table.id_doctor),
  
  fechaControlIdx: index('idx_treatments_fecha_control')
    .on(table.fecha_control),
    
  fechaProximoControlIdx: index('idx_treatments_fecha_proximo_control')
    .on(table.fecha_proximo_control),
    
  activeIdx: index('idx_treatments_active')
    .on(table.is_active),
    
  // ✅ NUEVOS ÍNDICES
  budgetItemIdx: index('idx_treatments_budget_item')
    .on(table.budget_item_id),
    
  statusIdx: index('idx_treatments_status')
    .on(table.status),
}));

export type InsertTreatment = typeof treatmentsTable.$inferInsert;
export type SelectTreatment = typeof treatmentsTable.$inferSelect;

// Importar sql para la función default
import { sql } from "drizzle-orm";

// ✅ CONSTANTES PARA ESTADOS DE TRATAMIENTO
export const TREATMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed'
} as const;