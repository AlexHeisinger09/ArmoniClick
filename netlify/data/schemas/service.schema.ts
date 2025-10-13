// netlify/data/schemas/service.schema.ts
import { pgTable, serial, integer, varchar, timestamp, boolean } from "drizzle-orm/pg-core";

export const servicesTable = pgTable("services", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull(),
  nombre: varchar("nombre", { length: 255 }).notNull(),
  tipo: varchar("tipo", { length: 50 }).notNull(), // 'odontologico' o 'estetica'
  valor: varchar("valor", { length: 20 }).notNull(),
  is_active: boolean("is_active").default(true).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at"),
});

export type Service = typeof servicesTable.$inferSelect;
export type NewService = typeof servicesTable.$inferInsert;