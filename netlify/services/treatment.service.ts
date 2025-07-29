// Solución: Actualizar TreatmentService para asegurar siempre formato HH:MM
// netlify/services/treatment.service.ts

import { db } from '../data/db';
import { treatmentsTable } from '../data/schemas/treatment.schema';
import { eq, and, desc, asc } from "drizzle-orm";

type NewTreatment = typeof treatmentsTable.$inferInsert;

export class TreatmentService {
  
  // Función auxiliar para asegurar formato HH:MM (sin segundos)
  private normalizeTimeFormat(timeString: string): string {
    if (!timeString) return timeString;
    
    // Si está en formato HH:MM:SS, convertir a HH:MM
    if (/^\d{2}:\d{2}:\d{2}$/.test(timeString)) {
      return timeString.slice(0, 5);
    }
    
    // Si ya está en formato HH:MM, retornarlo tal como está
    if (/^\d{2}:\d{2}$/.test(timeString)) {
      return timeString;
    }
    
    return timeString;
  }

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

    // Normalizar horas a formato HH:MM
    return treatments.map(treatment => ({
      ...treatment,
      hora_control: this.normalizeTimeFormat(treatment.hora_control || ''),
      hora_proximo_control: treatment.hora_proximo_control 
        ? this.normalizeTimeFormat(treatment.hora_proximo_control) 
        : treatment.hora_proximo_control,
    }));
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

    const result = treatment[0] || null;
    
    if (result) {
      // Normalizar horas a formato HH:MM
      return {
        ...result,
        hora_control: this.normalizeTimeFormat(result.hora_control || ''),
        hora_proximo_control: result.hora_proximo_control 
          ? this.normalizeTimeFormat(result.hora_proximo_control) 
          : result.hora_proximo_control,
      };
    }
    
    return null;
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
    
    // Normalizar horas a formato HH:MM
    return treatments.map(treatment => ({
      ...treatment,
      hora_control: this.normalizeTimeFormat(treatment.hora_control || ''),
      hora_proximo_control: treatment.hora_proximo_control 
        ? this.normalizeTimeFormat(treatment.hora_proximo_control) 
        : treatment.hora_proximo_control,
    }));
  }

  // Crear un nuevo tratamiento
  async create(treatmentData: NewTreatment) {
    // Normalizar las horas antes de insertar
    const normalizedData = {
      ...treatmentData,
      hora_control: this.normalizeTimeFormat(treatmentData.hora_control || ''),
      hora_proximo_control: treatmentData.hora_proximo_control 
        ? this.normalizeTimeFormat(treatmentData.hora_proximo_control) 
        : undefined,
      created_at: new Date(),
      is_active: true,
    };

    const newTreatment = await db
      .insert(treatmentsTable)
      .values(normalizedData)
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

    const result = newTreatment[0];
    
    // Normalizar horas en la respuesta
    return {
      ...result,
      hora_control: this.normalizeTimeFormat(result.hora_control || ''),
      hora_proximo_control: result.hora_proximo_control 
        ? this.normalizeTimeFormat(result.hora_proximo_control) 
        : result.hora_proximo_control,
    };
  }

  // Actualizar un tratamiento
  async update(treatmentId: number, treatmentData: Partial<NewTreatment>, doctorId: number) {
    // Normalizar las horas antes de actualizar
    const normalizedData = { ...treatmentData };
    
    if (normalizedData.hora_control) {
      normalizedData.hora_control = this.normalizeTimeFormat(normalizedData.hora_control);
    }
    
    if (normalizedData.hora_proximo_control) {
      normalizedData.hora_proximo_control = this.normalizeTimeFormat(normalizedData.hora_proximo_control);
    }

    const updatedTreatment = await db
      .update(treatmentsTable)
      .set({
        ...normalizedData,
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

    const result = updatedTreatment[0];
    
    // Normalizar horas en la respuesta
    return {
      ...result,
      hora_control: this.normalizeTimeFormat(result.hora_control || ''),
      hora_proximo_control: result.hora_proximo_control 
        ? this.normalizeTimeFormat(result.hora_proximo_control) 
        : result.hora_proximo_control,
    };
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

    // Normalizar horas en la respuesta
    return treatments.map(treatment => ({
      ...treatment,
      hora_proximo_control: treatment.hora_proximo_control 
        ? this.normalizeTimeFormat(treatment.hora_proximo_control) 
        : treatment.hora_proximo_control,
    }));
  }
}