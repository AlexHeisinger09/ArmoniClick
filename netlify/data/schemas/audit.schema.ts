// netlify/data/schemas/audit.schema.ts
import {
  serial,
  varchar,
  integer,
  pgTable,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { usersTable } from "./user.schema";
import { patientsTable } from "./patient.schema";

export const auditLogsTable = pgTable("audit_logs", {
  id: serial("id").primaryKey(),

  // Referencia al paciente (siempre hay un paciente relacionado)
  patient_id: integer("patient_id").notNull().references(() => patientsTable.id, {
    onDelete: "cascade",
    onUpdate: "cascade"
  }),

  // Tipo de entidad modificada
  entity_type: varchar("entity_type", {
    length: 50
  }).notNull(), // paciente, presupuesto, tratamiento, cita, documento

  // ID de la entidad modificada
  entity_id: integer("entity_id").notNull(),

  // Acción realizada
  action: varchar("action", {
    length: 50
  }).notNull(), // created, updated, deleted, status_changed

  // Valores anteriores (antes de la modificación)
  old_values: jsonb("old_values"),

  // Valores nuevos (después de la modificación)
  new_values: jsonb("new_values"),

  // Quién realizó la acción
  changed_by: integer("changed_by").notNull().references(() => usersTable.id, {
    onDelete: "restrict",
    onUpdate: "cascade"
  }),

  // Cuándo se realizó
  created_at: timestamp("created_at").notNull().defaultNow(),

  // Notas adicionales
  notes: varchar("notes"),
}, (table) => ({
  // Índices para búsquedas
  patientIdx: index('idx_audit_logs_patient_id')
    .on(table.patient_id),

  entityIdx: index('idx_audit_logs_entity')
    .on(table.entity_type, table.entity_id),

  actionIdx: index('idx_audit_logs_action')
    .on(table.action),

  createdIdx: index('idx_audit_logs_created')
    .on(table.created_at),

  changedByIdx: index('idx_audit_logs_changed_by')
    .on(table.changed_by),
}));

export type InsertAuditLog = typeof auditLogsTable.$inferInsert;
export type SelectAuditLog = typeof auditLogsTable.$inferSelect;

// Constantes para tipos de entidades
export const AUDIT_ENTITY_TYPES = {
  PACIENTE: 'paciente',
  PRESUPUESTO: 'presupuesto',
  TRATAMIENTO: 'tratamiento',
  CITA: 'cita',
  DOCUMENTO: 'documento'
} as const;

// Constantes para acciones
export const AUDIT_ACTIONS = {
  CREATED: 'created',
  UPDATED: 'updated',
  DELETED: 'deleted',
  STATUS_CHANGED: 'status_changed'
} as const;
