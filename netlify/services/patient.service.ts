// netlify/services/patient.service.ts - ACTUALIZADO CON CITAS Y PRESUPUESTOS
import { db } from '../data/db';
import { patientsTable } from '../data/schemas/patient.schema';
import { usersTable } from '../data/schemas/user.schema';
import { appointmentsTable } from '../data/schemas/appointment.schema';
import { budgetsTable } from '../data/schemas/budget.schema';
import { budgetItemsTable } from '../data/schemas/budget.schema';
import { Column, ColumnBaseConfig, ColumnDataType, eq, and, ilike, or, ne, sql, desc, asc, gt, sum } from "drizzle-orm";

type NewPatient = typeof patientsTable.$inferInsert;

export class PatientService {
  // Obtener todos los pacientes de un doctor con información de citas y presupuestos
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

    // Enriquecer cada paciente con información de citas y presupuestos
    const enrichedPatients = await Promise.all(
      patients.map(async (patient) => {
        // Obtener última cita (solo del pasado, no canceladas)
        const now = new Date();
        const lastAppointment = await db
          .select({
            id: appointmentsTable.id,
            appointmentDate: appointmentsTable.appointmentDate,
            title: appointmentsTable.title,
            status: appointmentsTable.status,
          })
          .from(appointmentsTable)
          .where(
            and(
              eq(appointmentsTable.patientId, patient.id),
              eq(appointmentsTable.doctorId, doctorId),
              // Solo citas del pasado
              sql`${appointmentsTable.appointmentDate} < ${now}`,
              // Excluir citas canceladas
              ne(appointmentsTable.status, 'cancelled')
            )
          )
          .orderBy(desc(appointmentsTable.appointmentDate))
          .limit(1);

        // Obtener próxima cita (solo futuras, no canceladas)
        const nextAppointment = await db
          .select({
            id: appointmentsTable.id,
            appointmentDate: appointmentsTable.appointmentDate,
            title: appointmentsTable.title,
            status: appointmentsTable.status,
          })
          .from(appointmentsTable)
          .where(
            and(
              eq(appointmentsTable.patientId, patient.id),
              eq(appointmentsTable.doctorId, doctorId),
              // Solo citas futuras
              gt(appointmentsTable.appointmentDate, now),
              // Excluir citas canceladas
              ne(appointmentsTable.status, 'cancelled')
            )
          )
          .orderBy(asc(appointmentsTable.appointmentDate))
          .limit(1);

        // Obtener presupuesto activo más reciente
        const activeBudget = await db
          .select({
            id: budgetsTable.id,
            total_amount: budgetsTable.total_amount,
            status: budgetsTable.status,
          })
          .from(budgetsTable)
          .where(
            and(
              eq(budgetsTable.patient_id, patient.id),
              eq(budgetsTable.user_id, doctorId),
              eq(budgetsTable.status, 'activo')
            )
          )
          .orderBy(desc(budgetsTable.created_at))
          .limit(1);

        // Si hay presupuesto activo, calcular el monto pagado basado en tratamientos completados
        let paidAmount = 0;
        if (activeBudget[0]) {
          // Obtener items completados del presupuesto
          const completedItems = await db
            .select({
              valor: budgetItemsTable.valor,
            })
            .from(budgetItemsTable)
            .where(
              and(
                eq(budgetItemsTable.budget_id, activeBudget[0].id),
                eq(budgetItemsTable.status, 'completado'),
                eq(budgetItemsTable.is_active, true)
              )
            );

          paidAmount = completedItems.reduce((sum, item) => {
            return sum + parseFloat(item.valor.toString());
          }, 0);
        }

        return {
          ...patient,
          lastAppointment: lastAppointment[0] || null,
          nextAppointment: nextAppointment[0] || null,
          activeBudget: activeBudget[0] ? {
            ...activeBudget[0],
            paid_amount: paidAmount,
          } : null,
        };
      })
    );

    return enrichedPatients;
  }

  // Buscar pacientes por nombre con información de citas y presupuestos
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

    // Enriquecer cada paciente con información de citas y presupuestos (mismo código que findByDoctorId)
    const enrichedPatients = await Promise.all(
      patients.map(async (patient) => {
        // Obtener última cita (solo del pasado, no canceladas)
        const now = new Date();
        const lastAppointment = await db
          .select({
            id: appointmentsTable.id,
            appointmentDate: appointmentsTable.appointmentDate,
            title: appointmentsTable.title,
            status: appointmentsTable.status,
          })
          .from(appointmentsTable)
          .where(
            and(
              eq(appointmentsTable.patientId, patient.id),
              eq(appointmentsTable.doctorId, doctorId),
              // Solo citas del pasado
              sql`${appointmentsTable.appointmentDate} < ${now}`,
              // Excluir citas canceladas
              ne(appointmentsTable.status, 'cancelled')
            )
          )
          .orderBy(desc(appointmentsTable.appointmentDate))
          .limit(1);

        // Obtener próxima cita (solo futuras, no canceladas)
        const nextAppointment = await db
          .select({
            id: appointmentsTable.id,
            appointmentDate: appointmentsTable.appointmentDate,
            title: appointmentsTable.title,
            status: appointmentsTable.status,
          })
          .from(appointmentsTable)
          .where(
            and(
              eq(appointmentsTable.patientId, patient.id),
              eq(appointmentsTable.doctorId, doctorId),
              // Solo citas futuras
              gt(appointmentsTable.appointmentDate, now),
              // Excluir citas canceladas
              ne(appointmentsTable.status, 'cancelled')
            )
          )
          .orderBy(asc(appointmentsTable.appointmentDate))
          .limit(1);

        // Obtener presupuesto activo más reciente
        const activeBudget = await db
          .select({
            id: budgetsTable.id,
            total_amount: budgetsTable.total_amount,
            status: budgetsTable.status,
          })
          .from(budgetsTable)
          .where(
            and(
              eq(budgetsTable.patient_id, patient.id),
              eq(budgetsTable.user_id, doctorId),
              eq(budgetsTable.status, 'activo')
            )
          )
          .orderBy(desc(budgetsTable.created_at))
          .limit(1);

        // Si hay presupuesto activo, calcular el monto pagado basado en tratamientos completados
        let paidAmount = 0;
        if (activeBudget[0]) {
          const completedItems = await db
            .select({
              valor: budgetItemsTable.valor,
            })
            .from(budgetItemsTable)
            .where(
              and(
                eq(budgetItemsTable.budget_id, activeBudget[0].id),
                eq(budgetItemsTable.status, 'completado'),
                eq(budgetItemsTable.is_active, true)
              )
            );

          paidAmount = completedItems.reduce((sum, item) => {
            return sum + parseFloat(item.valor.toString());
          }, 0);
        }

        return {
          ...patient,
          lastAppointment: lastAppointment[0] || null,
          nextAppointment: nextAppointment[0] || null,
          activeBudget: activeBudget[0] ? {
            ...activeBudget[0],
            paid_amount: paidAmount,
          } : null,
        };
      })
    );

    return enrichedPatients;
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
      ilike(patientsTable.rut, rut), // Comparación case-insensitive
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