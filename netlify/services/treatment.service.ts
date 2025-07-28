// netlify/services/treatment.service.ts
import { db } from '../data/db';
import { treatmentsTable } from '../data/schemas/treatment.schema';
import { eq, and, desc, asc } from "drizzle-orm";

type NewTreatment = typeof treatmentsTable.$inferInsert;

export class TreatmentService {
  // Obtener todos los tratamientos de un paciente
  async findByPatientId(patientId: number, doctorId: number) {
    const treatments = await db
      .select({
        id_tratamiento: treatmentsTable.id_tratamiento,
        id_paciente: treatmentsTable.id_paciente,
        id_doctor: treatmentsTable.id_doctor,
        fecha_control: treatmentsTable.fecha_control,
        hora_control: treatmentsTable.hora_control,
        fecha_proximo_control: treatmentsTable.fecha_proximo_control,
        hora_proximo_control: treatmentsTable.hora_proximo_control,
        nombre_servicio: treatmentsTable.nombre_servicio,
        producto: treatmentsTable.producto,
        lote_producto: treatmentsTable.lote_producto,
        fecha_venc_producto: treatmentsTable.fecha_venc_producto,
        dilucion: treatmentsTable.dilucion,
        foto1: treatmentsTable.foto1,
        foto2: treatmentsTable.foto2,
        descripcion: treatmentsTable.descripcion,
        created_at: treatmentsTable.created_at,
        updated_at: treatmentsTable.updated_at,
        is_active: treatmentsTable.is_active,
      })
      .from(treatmentsTable)
      .where(
        and(
          eq(treatmentsTable.id_paciente, patientId),
          eq(treatmentsTable.id_doctor, doctorId),
          eq(treatmentsTable.is_active, true)
        )
      )
      .orderBy(desc(treatmentsTable.fecha_control), desc(treatmentsTable.hora_control));

    return treatments;
  }

  // Obtener un tratamiento específico por ID
  async findById(treatmentId: number, doctorId: number) {
    const treatment = await db
      .select({
        id_tratamiento: treatmentsTable.id_tratamiento,
        id_paciente: treatmentsTable.id_paciente,
        id_doctor: treatmentsTable.id_doctor,
        fecha_control: treatmentsTable.fecha_control,
        hora_control: treatmentsTable.hora_control,
        fecha_proximo_control: treatmentsTable.fecha_proximo_control,
        hora_proximo_control: treatmentsTable.hora_proximo_control,
        nombre_servicio: treatmentsTable.nombre_servicio,
        producto: treatmentsTable.producto,
        lote_producto: treatmentsTable.lote_producto,
        fecha_venc_producto: treatmentsTable.fecha_venc_producto,
        dilucion: treatmentsTable.dilucion,
        foto1: treatmentsTable.foto1,
        foto2: treatmentsTable.foto2,
        descripcion: treatmentsTable.descripcion,
        created_at: treatmentsTable.created_at,
        updated_at: treatmentsTable.updated_at,
        is_active: treatmentsTable.is_active,
      })
      .from(treatmentsTable)
      .where(
        and(
          eq(treatmentsTable.id_tratamiento, treatmentId),
          eq(treatmentsTable.id_doctor, doctorId),
          eq(treatmentsTable.is_active, true)
        )
      );

    return treatment[0] || null;
  }

  // Obtener todos los tratamientos de un doctor (para dashboard)
  async findByDoctorId(doctorId: number, limit?: number) {
    let query = db
      .select({
        id_tratamiento: treatmentsTable.id_tratamiento,
        id_paciente: treatmentsTable.id_paciente,
        id_doctor: treatmentsTable.id_doctor,
        fecha_control: treatmentsTable.fecha_control,
        hora_control: treatmentsTable.hora_control,
        fecha_proximo_control: treatmentsTable.fecha_proximo_control,
        hora_proximo_control: treatmentsTable.hora_proximo_control,
        nombre_servicio: treatmentsTable.nombre_servicio,
        producto: treatmentsTable.producto,
        lote_producto: treatmentsTable.lote_producto,
        fecha_venc_producto: treatmentsTable.fecha_venc_producto,
        dilucion: treatmentsTable.dilucion,
        foto1: treatmentsTable.foto1,
        foto2: treatmentsTable.foto2,
        descripcion: treatmentsTable.descripcion,
        created_at: treatmentsTable.created_at,
        updated_at: treatmentsTable.updated_at,
        is_active: treatmentsTable.is_active,
      })
      .from(treatmentsTable)
      .where(
        and(
          eq(treatmentsTable.id_doctor, doctorId),
          eq(treatmentsTable.is_active, true)
        )
      )
      .orderBy(desc(treatmentsTable.fecha_control), desc(treatmentsTable.hora_control));

    if (limit) {
      query = query.limit(limit) as any;
    }

    const treatments = await query;
    return treatments;
  }

  // Crear un nuevo tratamiento
  async create(treatmentData: NewTreatment) {
    const newTreatment = await db
      .insert(treatmentsTable)
      .values({
        ...treatmentData,
        created_at: new Date(),
        is_active: true,
      })
      .returning({
        id_tratamiento: treatmentsTable.id_tratamiento,
        id_paciente: treatmentsTable.id_paciente,
        id_doctor: treatmentsTable.id_doctor,
        fecha_control: treatmentsTable.fecha_control,
        hora_control: treatmentsTable.hora_control,
        fecha_proximo_control: treatmentsTable.fecha_proximo_control,
        hora_proximo_control: treatmentsTable.hora_proximo_control,
        nombre_servicio: treatmentsTable.nombre_servicio,
        producto: treatmentsTable.producto,
        lote_producto: treatmentsTable.lote_producto,
        fecha_venc_producto: treatmentsTable.fecha_venc_producto,
        dilucion: treatmentsTable.dilucion,
        foto1: treatmentsTable.foto1,
        foto2: treatmentsTable.foto2,
        descripcion: treatmentsTable.descripcion,
        created_at: treatmentsTable.created_at,
        updated_at: treatmentsTable.updated_at,
        is_active: treatmentsTable.is_active,
      });

    return newTreatment[0];
  }

  // Actualizar un tratamiento
  async update(treatmentId: number, treatmentData: Partial<NewTreatment>, doctorId: number) {
    const updatedTreatment = await db
      .update(treatmentsTable)
      .set({
        ...treatmentData,
        updated_at: new Date(),
      })
      .where(
        and(
          eq(treatmentsTable.id_tratamiento, treatmentId),
          eq(treatmentsTable.id_doctor, doctorId)
        )
      )
      .returning({
        id_tratamiento: treatmentsTable.id_tratamiento,
        id_paciente: treatmentsTable.id_paciente,
        id_doctor: treatmentsTable.id_doctor,
        fecha_control: treatmentsTable.fecha_control,
        hora_control: treatmentsTable.hora_control,
        fecha_proximo_control: treatmentsTable.fecha_proximo_control,
        hora_proximo_control: treatmentsTable.hora_proximo_control,
        nombre_servicio: treatmentsTable.nombre_servicio,
        producto: treatmentsTable.producto,
        lote_producto: treatmentsTable.lote_producto,
        fecha_venc_producto: treatmentsTable.fecha_venc_producto,
        dilucion: treatmentsTable.dilucion,
        foto1: treatmentsTable.foto1,
        foto2: treatmentsTable.foto2,
        descripcion: treatmentsTable.descripcion,
        created_at: treatmentsTable.created_at,
        updated_at: treatmentsTable.updated_at,
        is_active: treatmentsTable.is_active,
      });

    return updatedTreatment[0];
  }

  // Eliminar un tratamiento (soft delete)
  async delete(treatmentId: number, doctorId: number) {
    const deletedTreatment = await db
      .update(treatmentsTable)
      .set({
        is_active: false,
        updated_at: new Date(),
      })
      .where(
        and(
          eq(treatmentsTable.id_tratamiento, treatmentId),
          eq(treatmentsTable.id_doctor, doctorId)
        )
      )
      .returning({ id_tratamiento: treatmentsTable.id_tratamiento });

    return deletedTreatment[0];
  }

  // Obtener próximos controles (para dashboard)
  async getUpcomingControls(doctorId: number, limit: number = 10) {
    const treatments = await db
      .select({
        id_tratamiento: treatmentsTable.id_tratamiento,
        id_paciente: treatmentsTable.id_paciente,
        fecha_proximo_control: treatmentsTable.fecha_proximo_control,
        hora_proximo_control: treatmentsTable.hora_proximo_control,
        nombre_servicio: treatmentsTable.nombre_servicio,
      })
      .from(treatmentsTable)
      .where(
        and(
          eq(treatmentsTable.id_doctor, doctorId),
          eq(treatmentsTable.is_active, true)
        )
      )
      .orderBy(asc(treatmentsTable.fecha_proximo_control), asc(treatmentsTable.hora_proximo_control))
      .limit(limit);

    return treatments;
  }
}