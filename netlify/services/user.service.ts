// netlify/services/user.service.ts - VERIFICAR findOne
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
    // ✅ Si no se especifican campos, seleccionar TODOS los campos principales
    const selectFields = fieldsToShow || {
      id: usersTable.id,
      rut: usersTable.rut,                     // ✅ INCLUIR RUT POR DEFECTO
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

    console.log('🔍 UserService.findOne - Campos a seleccionar:', Object.keys(selectFields)); // ✅ DEBUG
    console.log('🔍 UserService.findOne - Buscando:', field, '=', value); // ✅ DEBUG

    const oneRecordByFilter = await db
      .select(selectFields)
      .from(usersTable)
      .where(eq(field, value));

    const result = oneRecordByFilter.at(0);
    console.log('🔍 UserService.findOne - Resultado:', result); // ✅ DEBUG

    return result;
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
    console.log('🔍 UserService.update - Actualizando:', values); // ✅ DEBUG
    
    const updatedUser = await db
      .update(usersTable)
      .set(values)
      .where(eq(field, value))
      .returning();

    console.log('🔍 UserService.update - Usuario actualizado:', updatedUser[0]); // ✅ DEBUG
    return updatedUser[0];
  }

  // Método específico para obtener usuario con contraseña
  async findOneWithPassword(
    field: Column<ColumnBaseConfig<ColumnDataType, string>>,
    value: unknown
  ) {
    const oneRecordByFilter = await db
      .select()  // ✅ Seleccionar TODOS los campos incluyendo password
      .from(usersTable)
      .where(eq(field, value));

    return oneRecordByFilter.at(0);
  }
}