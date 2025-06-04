import {
  serial,
  varchar,
  boolean,
  pgTable,
  timestamp,
} from "drizzle-orm/pg-core";



export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
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
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt"),
  isActive: boolean("isActive").default(true),
});

export type InsertUser = typeof usersTable.$inferInsert;
export type SelectUser = typeof usersTable.$inferSelect;






