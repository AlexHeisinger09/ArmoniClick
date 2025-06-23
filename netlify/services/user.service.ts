import { db } from '../data/db';
import { usersTable } from '../data/schemas/user.schema';

import { Column, ColumnBaseConfig, ColumnDataType, eq } from "drizzle-orm";

type NewUser = typeof usersTable.$inferInsert;

export class UserService {
  async findOne(
    field: Column<ColumnBaseConfig<ColumnDataType, string>>,
    value: unknown,
    fieldsToShow?: Record<string, any>
  ) {
    const selectFields = fieldsToShow || {
      id: usersTable.id,
      name: usersTable.name,
      lastName: usersTable.lastName,
      username: usersTable.username,
      email: usersTable.email,
      emailValidated: usersTable.emailValidated,
      phone: usersTable.phone,
      address: usersTable.address,
      zipCode: usersTable.zipCode,
      city: usersTable.city,
      img: usersTable.img,
      createdAt: usersTable.createdAt,
      updatedAt: usersTable.updatedAt,
      isActive: usersTable.isActive,
    };

    const oneRecordByFilter = await db
      .select(selectFields)
      .from(usersTable)
      .where(eq(field, value));

    return oneRecordByFilter.at(0);
  }

  async insert(newUser: NewUser) {
    const addedUser = await db.insert(usersTable).values(newUser).returning();
    return addedUser[0];
  }

  async update(
    values: Partial<NewUser>,
    field: Column<ColumnBaseConfig<ColumnDataType, string>>,
    value: unknown
  ) {
    const updatedUser = await db
      .update(usersTable)
      .set(values)
      .where(eq(field, value))
      .returning();

    return updatedUser[0];
  }

  // Método específico para obtener usuario con contraseña
  async findOneWithPassword(
    field: Column<ColumnBaseConfig<ColumnDataType, string>>,
    value: unknown
  ) {
    const oneRecordByFilter = await db
      .select()
      .from(usersTable)
      .where(eq(field, value));

    return oneRecordByFilter.at(0);
  }
}