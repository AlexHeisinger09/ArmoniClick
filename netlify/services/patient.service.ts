// netlify/services/patient.service.ts - ACTUALIZADO
import { db } from '../data/db';
import { patientsTable } from '../data/schemas/patient.schema';
import { usersTable } from '../data/schemas/user.schema';
import { Column, ColumnBaseConfig, ColumnDataType, eq, and, ilike, or, ne } from "drizzle-orm";

type NewPatient = typeof patientsTable.$inferInsert;

export class PatientService {
  // Obtener todos los pacientes de un doctor
  async findByDoctorId(doctorId: number) {
    const patients = await db
      .select({
        id: patientsTable.id,
        rut: patientsTable.rut,
        nombres: patientsTable.nombres,
        apellidos: patientsTable.apellidos,
        fecha_nacimiento: patientsTable.fecha_nacimiento,
        telefono: patientsTable.telefono,
        email: patientsTable.email,
        direccion: patientsTable.direccion,
        ciudad: patientsTable.ciudad,
        codigo_postal: patientsTable.codigo_postal,
        alergias: patientsTable.alergias,
        medicamentos_actuales: patientsTable.medicamentos_actuales,
        enfermedades_cronicas: patientsTable.enfermedades_cronicas,
        cirugias_previas: patientsTable.cirugias_previas,
        hospitalizaciones_previas: patientsTable.hospitalizaciones_previas,
        notas_medicas: patientsTable.notas_medicas,
        id_doctor: patientsTable.id_doctor,
        createdat: patientsTable.createdAt,
        updatedat: patientsTable.updatedAt,
        isactive: patientsTable.isActive,
        // ✅ AGREGAR: Datos del doctor que registró al paciente
        doctor_name: usersTable.name,
        doctor_lastName: usersTable.lastName,
      })
      .from(patientsTable)
      .innerJoin(usersTable, eq(patientsTable.id_doctor, usersTable.id))
      .where(
        and(
          eq(patientsTable.id_doctor, doctorId),
          eq(patientsTable.isActive, true)
        )
      )
      .orderBy(patientsTable.nombres);

    return patients;
  }

  // Buscar pacientes por nombre
  async searchByName(doctorId: number, searchTerm: string) {
    const patients = await db
      .select({
        id: patientsTable.id,
        rut: patientsTable.rut,
        nombres: patientsTable.nombres,
        apellidos: patientsTable.apellidos,
        fecha_nacimiento: patientsTable.fecha_nacimiento,
        telefono: patientsTable.telefono,
        email: patientsTable.email,
        direccion: patientsTable.direccion,
        ciudad: patientsTable.ciudad,
        codigo_postal: patientsTable.codigo_postal,
        alergias: patientsTable.alergias,
        medicamentos_actuales: patientsTable.medicamentos_actuales,
        enfermedades_cronicas: patientsTable.enfermedades_cronicas,
        cirugias_previas: patientsTable.cirugias_previas,
        hospitalizaciones_previas: patientsTable.hospitalizaciones_previas,
        notas_medicas: patientsTable.notas_medicas,
        id_doctor: patientsTable.id_doctor,
        createdat: patientsTable.createdAt,
        updatedat: patientsTable.updatedAt,
        isactive: patientsTable.isActive,
        // ✅ AGREGAR: Datos del doctor que registró al paciente
        doctor_name: usersTable.name,
        doctor_lastName: usersTable.lastName,
      })
      .from(patientsTable)
      .innerJoin(usersTable, eq(patientsTable.id_doctor, usersTable.id))
      .where(
        and(
          eq(patientsTable.id_doctor, doctorId),
          eq(patientsTable.isActive, true),
          or(
            ilike(patientsTable.nombres, `%${searchTerm}%`),
            ilike(patientsTable.apellidos, `%${searchTerm}%`),
            ilike(patientsTable.rut, `%${searchTerm}%`)
          )
        )
      )
      .orderBy(patientsTable.nombres);

    return patients;
  }

  // Obtener un paciente por ID
  async findById(patientId: number, doctorId: number) {
    const patient = await db
      .select({
        id: patientsTable.id,
        rut: patientsTable.rut,
        nombres: patientsTable.nombres,
        apellidos: patientsTable.apellidos,
        fecha_nacimiento: patientsTable.fecha_nacimiento,
        telefono: patientsTable.telefono,
        email: patientsTable.email,
        direccion: patientsTable.direccion,
        ciudad: patientsTable.ciudad,
        codigo_postal: patientsTable.codigo_postal,
        alergias: patientsTable.alergias,
        medicamentos_actuales: patientsTable.medicamentos_actuales,
        enfermedades_cronicas: patientsTable.enfermedades_cronicas,
        cirugias_previas: patientsTable.cirugias_previas,
        hospitalizaciones_previas: patientsTable.hospitalizaciones_previas,
        notas_medicas: patientsTable.notas_medicas,
        id_doctor: patientsTable.id_doctor,
        createdat: patientsTable.createdAt,
        updatedat: patientsTable.updatedAt,
        isactive: patientsTable.isActive,
        // ✅ AGREGAR: Datos del doctor que registró al paciente
        doctor_name: usersTable.name,
        doctor_lastName: usersTable.lastName,
      })
      .from(patientsTable)
      .innerJoin(usersTable, eq(patientsTable.id_doctor, usersTable.id))
      .where(
        and(
          eq(patientsTable.id, patientId),
          eq(patientsTable.id_doctor, doctorId),
          eq(patientsTable.isActive, true)
        )
      );

    return patient[0] || null;
  }

  // ✅ MÉTODO ACTUALIZADO: Verificar si existe un RUT para un doctor específico
  async findByRut(rut: string, doctorId: number, excludeId?: number) {
    let conditions = [
      eq(patientsTable.rut, rut),
      eq(patientsTable.id_doctor, doctorId), // ✅ Solo buscar en los pacientes del doctor
      eq(patientsTable.isActive, true)
    ];

    // Si estamos editando, excluir el paciente actual
    if (excludeId) {
      conditions.push(ne(patientsTable.id, excludeId));
    }

    const patient = await db
      .select({ id: patientsTable.id })
      .from(patientsTable)
      .where(and(...conditions));

    return patient[0] || null;
  }

  // Crear un nuevo paciente
  async create(patientData: NewPatient) {
    const newPatient = await db
      .insert(patientsTable)
      .values({
        ...patientData,
        createdAt: new Date(),
        isActive: true,
      })
      .returning({
        id: patientsTable.id,
        rut: patientsTable.rut,
        nombres: patientsTable.nombres,
        apellidos: patientsTable.apellidos,
        fecha_nacimiento: patientsTable.fecha_nacimiento,
        telefono: patientsTable.telefono,
        email: patientsTable.email,
        direccion: patientsTable.direccion,
        ciudad: patientsTable.ciudad,
        codigo_postal: patientsTable.codigo_postal,
        alergias: patientsTable.alergias,
        medicamentos_actuales: patientsTable.medicamentos_actuales,
        enfermedades_cronicas: patientsTable.enfermedades_cronicas,
        cirugias_previas: patientsTable.cirugias_previas,
        hospitalizaciones_previas: patientsTable.hospitalizaciones_previas,
        notas_medicas: patientsTable.notas_medicas,
        id_doctor: patientsTable.id_doctor,
        createdat: patientsTable.createdAt,
        updatedat: patientsTable.updatedAt,
        isactive: patientsTable.isActive,
      });

    return newPatient[0];
  }

  // Actualizar un paciente
  async update(patientId: number, patientData: Partial<NewPatient>, doctorId: number) {
    const updatedPatient = await db
      .update(patientsTable)
      .set({
        ...patientData,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(patientsTable.id, patientId),
          eq(patientsTable.id_doctor, doctorId)
        )
      )
      .returning({
        id: patientsTable.id,
        rut: patientsTable.rut,
        nombres: patientsTable.nombres,
        apellidos: patientsTable.apellidos,
        fecha_nacimiento: patientsTable.fecha_nacimiento,
        telefono: patientsTable.telefono,
        email: patientsTable.email,
        direccion: patientsTable.direccion,
        ciudad: patientsTable.ciudad,
        codigo_postal: patientsTable.codigo_postal,
        alergias: patientsTable.alergias,
        medicamentos_actuales: patientsTable.medicamentos_actuales,
        enfermedades_cronicas: patientsTable.enfermedades_cronicas,
        cirugias_previas: patientsTable.cirugias_previas,
        hospitalizaciones_previas: patientsTable.hospitalizaciones_previas,
        notas_medicas: patientsTable.notas_medicas,
        id_doctor: patientsTable.id_doctor,
        createdat: patientsTable.createdAt,
        updatedat: patientsTable.updatedAt,
        isactive: patientsTable.isActive,
      });

    return updatedPatient[0];
  }

  // Eliminar un paciente (soft delete)
  async delete(patientId: number, doctorId: number) {
    const deletedPatient = await db
      .update(patientsTable)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(patientsTable.id, patientId),
          eq(patientsTable.id_doctor, doctorId)
        )
      )
      .returning({ id: patientsTable.id });

    return deletedPatient[0];
  }
}