// netlify/data/schemas/document.schema.ts
import {
  serial,
  varchar,
  text,
  pgTable,
  timestamp,
  integer,
  index,
} from "drizzle-orm/pg-core";
import { eq } from "drizzle-orm";
import { usersTable } from "./user.schema";
import { patientsTable } from "./patient.schema";

export const documentsTable = pgTable("documents", {
  id: serial("id").primaryKey(),
  id_patient: integer("id_patient").notNull().references(() => patientsTable.id),
  id_doctor: integer("id_doctor").notNull().references(() => usersTable.id),
  document_type: varchar("document_type").notNull(), // 'consentimiento-estetica', 'consentimiento-odontologico', 'consentimiento-anestesia', 'permiso-padres-estetica'
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  signature_data: text("signature_data"), // Base64 encoded signature image
  signed_date: timestamp("signed_date"), // Fecha de firma
  patient_name: varchar("patient_name").notNull(), // Nombre del paciente para el documento
  patient_rut: varchar("patient_rut").notNull(), // RUT del paciente para el documento
  status: varchar("status").default("pendiente"), // 'pendiente' | 'firmado'
  createdAt: timestamp("createdat").notNull().defaultNow(),
  updatedAt: timestamp("updatedat"),
}, (table) => ({
  patientIdx: index('idx_documents_patient')
    .on(table.id_patient),

  doctorIdx: index('idx_documents_doctor')
    .on(table.id_doctor),

  docTypeIdx: index('idx_documents_type')
    .on(table.document_type),

  statusIdx: index('idx_documents_status')
    .on(table.status),

  createdIdx: index('idx_documents_created')
    .on(table.createdAt),
}));

export type InsertDocument = typeof documentsTable.$inferInsert;
export type SelectDocument = typeof documentsTable.$inferSelect;
