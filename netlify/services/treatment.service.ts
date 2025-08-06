// netlify/services/treatment.service.ts - CORREGIDO PARA SOLO CONSIDERAR TRATAMIENTOS ACTIVOS
import { db } from '../data/db';
import { treatmentsTable } from '../data/schemas/treatment.schema';
import { budgetItemsTable, budgetsTable } from '../data/schemas/budget.schema';
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

  // ✅ CORREGIDO: Obtener presupuestos de un paciente para selector
  async getBudgetsByPatient(patientId: number, doctorId: number) {
    const budgets = await db
      .select({
        id: budgetsTable.id,
        budget_type: budgetsTable.budget_type,
        status: budgetsTable.status,
        total_amount: budgetsTable.total_amount,
        created_at: budgetsTable.created_at,
      })
      .from(budgetsTable)
      .where(
        and(
          eq(budgetsTable.patient_id, patientId),
          eq(budgetsTable.user_id, doctorId)
        )
      )
      .orderBy(desc(budgetsTable.created_at));

    return budgets;
  }

  // ✅ CORREGIDO: Obtener tratamientos por presupuesto - SOLO ACTIVOS
  async findByBudgetId(budgetId: number, doctorId: number) {
    console.log(`🔍 Buscando tratamientos del presupuesto ${budgetId} para doctor ${doctorId}`);
    
    const treatments = await db
      .select({
        id_tratamiento: treatmentsTable.id_tratamiento,
        id_paciente: treatmentsTable.id_paciente,
        id_doctor: treatmentsTable.id_doctor,
        budget_item_id: treatmentsTable.budget_item_id,
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
        status: treatmentsTable.status,
        created_at: treatmentsTable.created_at,
        updated_at: treatmentsTable.updated_at,
        is_active: treatmentsTable.is_active,
        // ✅ DATOS DEL ITEM DEL PRESUPUESTO
        budget_item_pieza: budgetItemsTable.pieza,
        budget_item_valor: budgetItemsTable.valor,
      })
      .from(treatmentsTable)
      .innerJoin(budgetItemsTable, eq(treatmentsTable.budget_item_id, budgetItemsTable.id))
      .where(
        and(
          eq(budgetItemsTable.budget_id, budgetId),
          eq(treatmentsTable.id_doctor, doctorId),
          eq(treatmentsTable.is_active, true) // ✅ CRÍTICO: Solo tratamientos activos
        )
      )
      .orderBy(desc(treatmentsTable.fecha_control), desc(treatmentsTable.hora_control));

    console.log(`✅ Encontrados ${treatments.length} tratamientos activos para presupuesto ${budgetId}`);
    
    // Log de cada tratamiento para depuración
    treatments.forEach(t => {
      console.log(`📋 Tratamiento ${t.id_tratamiento}: status=${t.status}, valor=${t.budget_item_valor}, activo=${t.is_active}`);
    });

    // Normalizar horas a formato HH:MM
    return treatments.map(treatment => ({
      ...treatment,
      hora_control: this.normalizeTimeFormat(treatment.hora_control || ''),
      hora_proximo_control: treatment.hora_proximo_control 
        ? this.normalizeTimeFormat(treatment.hora_proximo_control) 
        : treatment.hora_proximo_control,
    }));
  }

  // ✅ CORREGIDO: Obtener todos los tratamientos de un paciente - SOLO ACTIVOS
  async findByPatientId(patientId: number, doctorId: number) {
    const treatments = await db
      .select({
        id_tratamiento: treatmentsTable.id_tratamiento,
        id_paciente: treatmentsTable.id_paciente,
        id_doctor: treatmentsTable.id_doctor,
        budget_item_id: treatmentsTable.budget_item_id,
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
        status: treatmentsTable.status,
        created_at: treatmentsTable.created_at,
        updated_at: treatmentsTable.updated_at,
        is_active: treatmentsTable.is_active,
      })
      .from(treatmentsTable)
      .where(
        and(
          eq(treatmentsTable.id_paciente, patientId),
          eq(treatmentsTable.id_doctor, doctorId),
          eq(treatmentsTable.is_active, true) // ✅ CRÍTICO: Solo tratamientos activos
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

  // ✅ CORREGIDO: Obtener un tratamiento específico por ID - SOLO ACTIVOS
  async findById(treatmentId: number, doctorId: number) {
    const treatment = await db
      .select({
        id_tratamiento: treatmentsTable.id_tratamiento,
        id_paciente: treatmentsTable.id_paciente,
        id_doctor: treatmentsTable.id_doctor,
        budget_item_id: treatmentsTable.budget_item_id,
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
        status: treatmentsTable.status,
        created_at: treatmentsTable.created_at,
        updated_at: treatmentsTable.updated_at,
        is_active: treatmentsTable.is_active,
      })
      .from(treatmentsTable)
      .where(
        and(
          eq(treatmentsTable.id_tratamiento, treatmentId),
          eq(treatmentsTable.id_doctor, doctorId),
          eq(treatmentsTable.is_active, true) // ✅ CRÍTICO: Solo tratamientos activos
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

  // ✅ CORREGIDO: Obtener todos los tratamientos de un doctor - SOLO ACTIVOS
  async findByDoctorId(doctorId: number, limit?: number) {
    let query = db
      .select({
        id_tratamiento: treatmentsTable.id_tratamiento,
        id_paciente: treatmentsTable.id_paciente,
        id_doctor: treatmentsTable.id_doctor,
        budget_item_id: treatmentsTable.budget_item_id,
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
        status: treatmentsTable.status,
        created_at: treatmentsTable.created_at,
        updated_at: treatmentsTable.updated_at,
        is_active: treatmentsTable.is_active,
      })
      .from(treatmentsTable)
      .where(
        and(
          eq(treatmentsTable.id_doctor, doctorId),
          eq(treatmentsTable.is_active, true) // ✅ CRÍTICO: Solo tratamientos activos
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
    console.log('🆕 Creando nuevo tratamiento:', treatmentData);
    
    // Normalizar las horas antes de insertar
    const normalizedData = {
      ...treatmentData,
      hora_control: this.normalizeTimeFormat(treatmentData.hora_control || ''),
      hora_proximo_control: treatmentData.hora_proximo_control 
        ? this.normalizeTimeFormat(treatmentData.hora_proximo_control) 
        : undefined,
      created_at: new Date(),
      is_active: true, // ✅ ASEGURAR que se crea como activo
      status: treatmentData.status || 'pending' // ✅ Estado por defecto
    };

    const newTreatment = await db
      .insert(treatmentsTable)
      .values(normalizedData)
      .returning({
        id_tratamiento: treatmentsTable.id_tratamiento,
        id_paciente: treatmentsTable.id_paciente,
        id_doctor: treatmentsTable.id_doctor,
        budget_item_id: treatmentsTable.budget_item_id,
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
        status: treatmentsTable.status,
        created_at: treatmentsTable.created_at,
        updated_at: treatmentsTable.updated_at,
        is_active: treatmentsTable.is_active,
      });

    const result = newTreatment[0];
    
    console.log('✅ Tratamiento creado exitosamente:', result);
    
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
    console.log(`🔄 Actualizando tratamiento ${treatmentId}:`, treatmentData);
    
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
          eq(treatmentsTable.id_doctor, doctorId),
          eq(treatmentsTable.is_active, true) // ✅ CRÍTICO: Solo actualizar si está activo
        )
      )
      .returning({
        id_tratamiento: treatmentsTable.id_tratamiento,
        id_paciente: treatmentsTable.id_paciente,
        id_doctor: treatmentsTable.id_doctor,
        budget_item_id: treatmentsTable.budget_item_id,
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
        status: treatmentsTable.status,
        created_at: treatmentsTable.created_at,
        updated_at: treatmentsTable.updated_at,
        is_active: treatmentsTable.is_active,
      });

    const result = updatedTreatment[0];
    
    console.log('✅ Tratamiento actualizado exitosamente:', result);
    
    // Normalizar horas en la respuesta
    return {
      ...result,
      hora_control: this.normalizeTimeFormat(result.hora_control || ''),
      hora_proximo_control: result.hora_proximo_control 
        ? this.normalizeTimeFormat(result.hora_proximo_control) 
        : result.hora_proximo_control,
    };
  }

  // ✅ CRÍTICO: Eliminar un tratamiento (soft delete)
  async delete(treatmentId: number, doctorId: number) {
    console.log(`🗑️ Eliminando tratamiento ${treatmentId} (soft delete)`);
    
    const deletedTreatment = await db
      .update(treatmentsTable)
      .set({
        is_active: false, // ✅ SOFT DELETE
        updated_at: new Date(),
      })
      .where(
        and(
          eq(treatmentsTable.id_tratamiento, treatmentId),
          eq(treatmentsTable.id_doctor, doctorId)
          // ✅ NO VERIFICAR is_active aquí porque queremos poder eliminar tratamientos activos
        )
      )
      .returning({ 
        id_tratamiento: treatmentsTable.id_tratamiento,
        is_active: treatmentsTable.is_active 
      });

    const result = deletedTreatment[0];
    console.log('✅ Tratamiento marcado como eliminado:', result);
    
    return result;
  }

  // ✅ CORREGIDO: Obtener próximos controles - SOLO ACTIVOS
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
          eq(treatmentsTable.is_active, true) // ✅ CRÍTICO: Solo tratamientos activos
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

  // ✅ MARCAR TRATAMIENTO COMO COMPLETADO
  async completeTreatment(treatmentId: number, doctorId: number) {
    console.log(`✅ Completando tratamiento ${treatmentId}`);
    
    const updatedTreatment = await db
      .update(treatmentsTable)
      .set({
        status: 'completed',
        updated_at: new Date(),
      })
      .where(
        and(
          eq(treatmentsTable.id_tratamiento, treatmentId),
          eq(treatmentsTable.id_doctor, doctorId),
          eq(treatmentsTable.is_active, true) // ✅ CRÍTICO: Solo completar si está activo
        )
      )
      .returning({ 
        id_tratamiento: treatmentsTable.id_tratamiento,
        status: treatmentsTable.status,
        is_active: treatmentsTable.is_active 
      });

    const result = updatedTreatment[0];
    console.log('✅ Tratamiento marcado como completado:', result);
    
    return result;
  }
}