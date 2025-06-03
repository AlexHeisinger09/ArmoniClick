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
    const oneRecordByFilter = await db
      .select(fieldsToShow!)
      .from(usersTable)
      .where(eq(field, value));

    return oneRecordByFilter.at(0);
  }

  async insert(newUser: NewUser) {
    const addedUser = db.insert(usersTable).values(newUser);

    return addedUser;
  }

  async update(
    values: Partial<NewUser>,
    field: Column<ColumnBaseConfig<ColumnDataType, string>>,
    value: unknown
  ) {
    const updatedUser = db
      .update(usersTable)
      .set(values)
      .where(eq(field, value));
    
    return updatedUser;
  }
}