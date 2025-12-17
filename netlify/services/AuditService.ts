// netlify/services/AuditService.ts
import { db } from '../data/db';
import { auditLogsTable } from '../data/schemas';
import { eq, and } from 'drizzle-orm';

export class AuditService {
  constructor(private database: typeof db = db) {}

  /**
   * Registra un cambio de datos en el historial de auditoría
   */
  async logChange(options: {
    patientId: number;
    entityType: string;
    entityId: number;
    action: string;
    oldValues?: Record<string, any>;
    newValues?: Record<string, any>;
    changedBy: number;
    notes?: string;
  }) {
    try {
      console.log('📝 Registrando cambio en auditoría:', {
        entityType: options.entityType,
        entityId: options.entityId,
        action: options.action,
      });

      const result = await this.database.insert(auditLogsTable).values({
        patient_id: options.patientId,
        entity_type: options.entityType,
        entity_id: options.entityId,
        action: options.action,
        old_values: options.oldValues ? JSON.stringify(options.oldValues) : null,
        new_values: options.newValues ? JSON.stringify(options.newValues) : null,
        changed_by: options.changedBy,
        notes: options.notes,
        created_at: new Date(),
      }).returning();

      console.log('✅ Cambio registrado en auditoría');
      return result[0];
    } catch (error) {
      console.error('❌ Error al registrar cambio en auditoría:', error);
      // No lanzar error para que la acción principal continúe
      // El log es importante pero no debe bloquear la operación
    }
  }

  /**
   * Actualiza un registro de auditoría existente (para mantener historial limpio)
   */
  async updateAuditLog(options: {
    entityType: string;
    entityId: number;
    action: string;
    newValues: Record<string, any>;
    notes?: string;
  }) {
    try {
      console.log('🔄 Actualizando audit log existente:', {
        entityType: options.entityType,
        entityId: options.entityId,
        action: options.action,
      });

      // Buscar el audit log original (con action 'created')
      const existingLog = await this.database
        .select()
        .from(auditLogsTable)
        .where(
          and(
            eq(auditLogsTable.entity_type, options.entityType),
            eq(auditLogsTable.entity_id, options.entityId),
            eq(auditLogsTable.action, options.action)
          )
        )
        .limit(1);

      if (existingLog.length > 0) {
        // Actualizar el audit log existente con los nuevos valores
        await this.database
          .update(auditLogsTable)
          .set({
            new_values: JSON.stringify(options.newValues),
            notes: options.notes,
            created_at: new Date(), // Actualizar fecha para que aparezca al principio
          })
          .where(eq(auditLogsTable.id, existingLog[0].id));

        console.log('✅ Audit log actualizado:', existingLog[0].id);
        return true;
      } else {
        console.log('⚠️ No se encontró audit log para actualizar');
        return false;
      }
    } catch (error) {
      console.error('❌ Error al actualizar audit log:', error);
      return false;
    }
  }

  /**
   * Obtiene el historial de auditoría de un paciente
   */
  async getPatientHistory(patientId: number, limit: number = 100) {
    try {
      console.log('🔍 Obteniendo historial del paciente:', patientId);

      const logs = await this.database
        .select()
        .from(auditLogsTable)
        .where(eq(auditLogsTable.patient_id, patientId))
        .orderBy((t) => t.created_at)
        .limit(limit);

      return logs;
    } catch (error) {
      console.error('❌ Error al obtener historial:', error);
      return [];
    }
  }

  /**
   * Obtiene el historial de una entidad específica
   */
  async getEntityHistory(
    patientId: number,
    entityType: string,
    entityId: number
  ) {
    try {
      console.log('🔍 Obteniendo historial de entidad:', {
        entityType,
        entityId,
      });

      const logs = await this.database
        .select()
        .from(auditLogsTable)
        .where(
          (t) =>
            eq(t.patient_id, patientId) &&
            eq(t.entity_type, entityType) &&
            eq(t.entity_id, entityId)
        )
        .orderBy((t) => t.created_at);

      return logs;
    } catch (error) {
      console.error('❌ Error al obtener historial de entidad:', error);
      return [];
    }
  }
}

export default AuditService;
