// netlify/data/schemas/location.schema.ts
import { pgTable, serial, integer, varchar, timestamp, boolean, text } from "drizzle-orm/pg-core";

export const locationsTable = pgTable("locations", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull(), // ID del doctor/usuario
  name: varchar("name", { length: 255 }).notNull(), // Nombre de la ubicación/sucursal
  address: text("address").notNull(), // Dirección completa
  city: varchar("city", { length: 100 }).notNull(), // Ciudad
  google_calendar_id: varchar("google_calendar_id", { length: 255 }), // ID del calendario de Google (para futura integración)
  is_active: boolean("is_active").default(true).notNull(), // Si está activa o no
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at"),
});

export type Location = typeof locationsTable.$inferSelect;
export type NewLocation = typeof locationsTable.$inferInsert;
