import { db } from '../data/db';
import { patientsTable } from '../data/schemas/patient.schema';

import { Column, ColumnBaseConfig, ColumnDataType, eq, and } from "drizzle-orm";

type NewPatient = typeof patientsTable.$inferInsert;
type Patient = typeof patientsTable.$inferSelect;

export class PatientService {
  async findByDoctorId(doctorId: number): Promise<Patient[]> {
    const patients = await db
      .select()
      .from(patientsTable)
      .where(
        and(
          eq(patientsTable.idDoctor, doctorId),
          eq(patientsTable.isActive, true)
        )
      )
      .orderBy(patientsTable.nombres);

    return patients;
  }

  async findOne(
    field: Column<ColumnBaseConfig<ColumnDataType, string>>,
    value: unknown,
    fieldsToShow?: Record<string, any>
  ) {
    const oneRecordByFilter = await db
      .select(fieldsToShow!)
      .from(patientsTable)
      .where(eq(field, value));

    return oneRecordByFilter.at(0);
  }

  async insert(newPatient: NewPatient) {
    const addedPatient = await db.insert(patientsTable).values(newPatient).returning();
    return addedPatient[0];
  }

  async update(
    values: Partial<NewPatient>,
    field: Column<ColumnBaseConfig<ColumnDataType, string>>,
    value: unknown
  ) {
    const updatedPatient = await db
      .update(patientsTable)
      .set(values)
      .where(eq(field, value))
      .returning();
    
    return updatedPatient[0];
  }

  async delete(patientId: number) {
    // Soft delete - marcar como inactivo
    const deletedPatient = await db
      .update(patientsTable)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(patientsTable.id, patientId))
      .returning();
    
    return deletedPatient[0];
  }
}