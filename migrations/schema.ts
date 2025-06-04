import { pgTable, unique, serial, varchar, boolean, timestamp } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const users = pgTable("users", {
	id: serial().primaryKey().notNull(),
	name: varchar().notNull(),
	lastName: varchar().notNull(),
	username: varchar().notNull(),
	emailValidated: boolean().default(false),
	email: varchar().notNull(),
	password: varchar().notNull(),
	phone: varchar(),
	address: varchar(),
	zipCode: varchar(),
	city: varchar(),
	img: varchar(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }),
	isActive: boolean().default(true),
}, (table) => [
	unique("users_username_unique").on(table.username),
	unique("users_email_unique").on(table.email),
]);
