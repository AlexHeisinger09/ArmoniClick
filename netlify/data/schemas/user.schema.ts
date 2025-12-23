// netlify/data/schemas/user.schema.ts
import {
  serial,
  varchar,
  boolean,
  pgTable,
  timestamp,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  rut: varchar("rut"),
  name: varchar("name").notNull(),
  lastName: varchar("lastName").notNull(),
  username: varchar("username").notNull().unique(),
  emailValidated: boolean("emailValidated").default(false),
  email: varchar("email").notNull().unique(),
  password: varchar("password").notNull(),
  phone: varchar("phone"),
  address: varchar("address"),
  zipCode: varchar("zipCode"),
  city: varchar("city"),
  img: varchar("img"),
  signature: varchar("signature"), // ✅ NUEVO CAMPO PARA LA FIRMA
  logo: varchar("logo"), // ✅ NUEVO CAMPO PARA EL LOGO DEL DOCTOR
  profession: varchar("profession"), // ✅ PROFESIÓN DEL DOCTOR
  specialty: varchar("specialty"), // ✅ ESPECIALIDAD DEL DOCTOR
  expirationDate: timestamp("expirationDate"), // ✅ Fecha de vigencia (para cuentas de prueba)
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt"),
  isActive: boolean("isActive").default(true),
});

export type InsertUser = typeof usersTable.$inferInsert;
export type SelectUser = typeof usersTable.$inferSelect;