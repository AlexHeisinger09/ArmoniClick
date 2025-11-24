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
} from "drizzle-orm/pg-core";
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
  pieza: varchar("pieza", { length: 100 }),
  accion: varchar("accion", { length: 255 }).notNull(),
  valor: decimal("valor", { precision: 10, scale: 2 }).notNull(),
  orden: integer("orden").default(0),
  created_at: timestamp("created_at").notNull().defaultNow(),
  
  // ✅ AGREGAR CAMPO PARA SOFT DELETE
  is_active: boolean("is_active").default(true),
  updated_at: timestamp("updated_at"),
}, (table) => ({
  budgetIdx: index('idx_budget_items_budget')
    .on(table.budget_id),
    
  ordenIdx: index('idx_budget_items_orden')
    .on(table.budget_id, table.orden),
    
  // ✅ NUEVO ÍNDICE PARA FILTRAR ITEMS ACTIVOS
  activeIdx: index('idx_budget_items_active')
    .on(table.is_active),
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