// netlify/data/schemas/budget.schema.ts - CORREGIR IMPORTS
import {
  serial,
  varchar,
  boolean,
  pgTable,
  timestamp,
  integer,
  decimal,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm"; // ✅ MOVER IMPORT AQUÍ
import { usersTable } from "./user.schema";
import { patientsTable } from "./patient.schema";

export const budgetsTable = pgTable("budgets", {
  id: serial("id").primaryKey(),
  patient_id: integer("patient_id").notNull().references(() => patientsTable.id, {
    onDelete: "cascade",
    onUpdate: "cascade"
  }),
  user_id: integer("user_id").notNull().references(() => usersTable.id, {
    onDelete: "restrict",
    onUpdate: "cascade"
  }),
  total_amount: decimal("total_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  status: varchar("status", { length: 50 }).default("pendiente"), // ✅ CAMBIO: pendiente por defecto
  budget_type: varchar("budget_type", { length: 50 }).notNull().default("odontologico"), // odontologico, estetica
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
}, (table) => ({
  // Un paciente solo puede tener un presupuesto activo
  patientActiveUniqueIdx: uniqueIndex('budgets_patient_active_unique')
    .on(table.patient_id, table.status)
    .where(sql`status = 'activo'`), // ✅ CAMBIO: Solo para presupuestos activos
  
  // Índices para búsquedas
  userIdx: index('idx_budgets_user')
    .on(table.user_id),
    
  statusIdx: index('idx_budgets_status')
    .on(table.status),
    
  createdIdx: index('idx_budgets_created')
    .on(table.created_at),
}));

export const budgetItemsTable = pgTable("budget_items", {
  id: serial("id").primaryKey(),
  budget_id: integer("budget_id").notNull().references(() => budgetsTable.id, {
    onDelete: "cascade",
    onUpdate: "cascade"
  }),
  pieza: varchar("pieza", { length: 100 }), // Pieza dental o zona estética
  accion: varchar("accion", { length: 255 }).notNull(), // Tratamiento
  valor: decimal("valor", { precision: 10, scale: 2 }).notNull(), // Precio
  orden: integer("orden").default(0), // Para ordenar items
  created_at: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  // Índices para búsquedas
  budgetIdx: index('idx_budget_items_budget')
    .on(table.budget_id),
    
  ordenIdx: index('idx_budget_items_orden')
    .on(table.budget_id, table.orden),
}));

// Tipos para TypeScript
export type InsertBudget = typeof budgetsTable.$inferInsert;
export type SelectBudget = typeof budgetsTable.$inferSelect;
export type InsertBudgetItem = typeof budgetItemsTable.$inferInsert;
export type SelectBudgetItem = typeof budgetItemsTable.$inferSelect;

// Enums para estados
export const BUDGET_STATUS = {
  PENDIENTE: 'pendiente', // ✅ NUEVO ESTADO INICIAL
  BORRADOR: 'borrador',
  ACTIVO: 'activo', 
  COMPLETED: 'completed'
} as const;

export const BUDGET_TYPE = {
  ODONTOLOGICO: 'odontologico',
  ESTETICA: 'estetica'
} as const;

export const TREATMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed'
} as const;