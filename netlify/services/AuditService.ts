// netlify/services/AuditService.ts
import { Database } from '@/netlify/data/db';
import { auditLogsTable, AUDIT_ENTITY_TYPES, AUDIT_ACTIONS } from '@/netlify/data/schemas';
import { eq } from 'drizzle-orm';

export class AuditService {
  constructor(private db: Database) {}

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

      await this.db.insert(auditLogsTable).values({
        patient_id: options.patientId,
        entity_type: options.entityType,
        entity_id: options.entityId,
        action: options.action,
        old_values: options.oldValues ? JSON.stringify(options.oldValues) : null,
        new_values: options.newValues ? JSON.stringify(options.newValues) : null,
        changed_by: options.changedBy,
        notes: options.notes,
        created_at: new Date(),
      });

      console.log('✅ Cambio registrado en auditoría');
    } catch (error) {
      console.error('❌ Error al registrar cambio en auditoría:', error);
      // No lanzar error para que la acción principal continúe
      // El log es importante pero no debe bloquear la operación
    }
  }

  /**
   * Obtiene el historial de auditoría de un paciente
   */
  async getPatientHistory(patientId: number, limit: number = 100) {
    try {
      console.log('🔍 Obteniendo historial del paciente:', patientId);

      const logs = await this.db
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

      const logs = await this.db
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
