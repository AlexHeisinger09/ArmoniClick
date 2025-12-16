// netlify/functions/treatments/use-cases/add-session.ts
import { db } from "../../../data/db";
import { treatmentsTable } from "../../../data/schemas/treatment.schema";
import { budgetItemsTable, budgetsTable, BUDGET_ITEM_STATUS } from "../../../data/schemas/budget.schema";
import { HEADERS } from "../../../config/utils";
import { HandlerResponse } from "@netlify/functions";
import { AuditService } from "../../../services/AuditService";
import { AUDIT_ENTITY_TYPES, AUDIT_ACTIONS } from "../../../data/schemas";
import { eq, and } from "drizzle-orm";

interface AddSessionData {
  budget_item_id: number;
  fecha_control: string;
  hora_control: string;
  descripcion?: string;
  producto?: string;
  lote_producto?: string;
  fecha_venc_producto?: string;
  dilucion?: string;
  foto1?: string;
  foto2?: string;
  fecha_proximo_control?: string;
  hora_proximo_control?: string;
}

export class AddTreatmentSession {
  constructor(
    private readonly auditService: AuditService = new AuditService(db)
  ) {}

  public async execute(
    sessionData: AddSessionData,
    userId: number,
    patientId: number
  ): Promise<HandlerResponse> {
    try {
      console.log('🔍 AddTreatmentSession - Datos recibidos:', {
        sessionData,
        userId,
        patientId,
        budget_item_id: sessionData.budget_item_id
      });

      // 1. Obtener el budget_item con JOIN al presupuesto para verificar permisos
      const budgetItemResult = await db
        .select({
          id: budgetItemsTable.id,
          budget_id: budgetItemsTable.budget_id,
          pieza: budgetItemsTable.pieza,
          accion: budgetItemsTable.accion,
          valor: budgetItemsTable.valor,
          status: budgetItemsTable.status,
          budget_user_id: budgetsTable.user_id,
        })
        .from(budgetItemsTable)
        .innerJoin(budgetsTable, eq(budgetItemsTable.budget_id, budgetsTable.id))
        .where(
          and(
            eq(budgetItemsTable.id, sessionData.budget_item_id),
            eq(budgetsTable.user_id, userId) // ✅ Verificar que el presupuesto pertenece al doctor
          )
        )
        .limit(1);

      console.log('🔍 Budget item query result:', {
        found: budgetItemResult.length > 0,
        result: budgetItemResult[0] || null
      });

      if (budgetItemResult.length === 0) {
        // ✅ MEJORADO: Verificar si el budget_item existe pero pertenece a otro doctor
        const budgetItemExists = await db
          .select({ id: budgetItemsTable.id, budget_id: budgetItemsTable.budget_id })
          .from(budgetItemsTable)
          .where(eq(budgetItemsTable.id, sessionData.budget_item_id))
          .limit(1);

        console.error('❌ Budget item no encontrado o sin permisos:', {
          budget_item_id: sessionData.budget_item_id,
          userId,
          exists: budgetItemExists.length > 0,
          existsButWrongUser: budgetItemExists.length > 0
        });

        return {
          statusCode: 404,
          body: JSON.stringify({
            message: "Item del presupuesto no encontrado o no tienes permiso para acceder a él",
            debug: {
              budget_item_id: sessionData.budget_item_id,
              exists: budgetItemExists.length > 0
            }
          }),
          headers: HEADERS.json,
        };
      }

      const budgetItem = budgetItemResult[0];

      // 2. Verificar si ya existe un tratamiento para este budget_item (solo activos)
      const existingTreatments = await db
        .select()
        .from(treatmentsTable)
        .where(
          and(
            eq(treatmentsTable.budget_item_id, sessionData.budget_item_id),
            eq(treatmentsTable.is_active, true) // ✅ Solo contar treatments activos
          )
        );

      const isFirstTreatment = existingTreatments.length === 0;

      // 3. Crear el tratamiento/sesión
      const serviceName = isFirstTreatment
        ? `${budgetItem.accion}${budgetItem.pieza ? ` - Pieza ${budgetItem.pieza}` : ''}`
        : `${budgetItem.accion}${budgetItem.pieza ? ` - Pieza ${budgetItem.pieza}` : ''} - Sesión ${existingTreatments.length + 1}`; // ✅ CORREGIDO: +1 porque queremos el número de la NUEVA sesión

      const [newTreatment] = await db
        .insert(treatmentsTable)
        .values({
          id_paciente: patientId,
          id_doctor: userId,
          budget_item_id: sessionData.budget_item_id,
          nombre_servicio: serviceName,
          fecha_control: sessionData.fecha_control,
          hora_control: sessionData.hora_control,
          descripcion: sessionData.descripcion || '',
          producto: sessionData.producto || undefined,
          lote_producto: sessionData.lote_producto || undefined,
          fecha_venc_producto: sessionData.fecha_venc_producto || undefined, // ✅ Convertir "" a undefined
          dilucion: sessionData.dilucion || undefined,
          foto1: sessionData.foto1 || undefined,
          foto2: sessionData.foto2 || undefined,
          fecha_proximo_control: sessionData.fecha_proximo_control || undefined, // ✅ Convertir "" a undefined
          hora_proximo_control: sessionData.hora_proximo_control || undefined, // ✅ Convertir "" a undefined
          status: 'en_proceso', // Siempre en_proceso cuando se registra
          created_at: new Date(),
          is_active: true,
        })
        .returning();

      // 4. Actualizar estado del budget_item a 'en_proceso'
      if (budgetItem.status !== BUDGET_ITEM_STATUS.EN_PROCESO) {
        await db
          .update(budgetItemsTable)
          .set({
            status: BUDGET_ITEM_STATUS.EN_PROCESO,
            updated_at: new Date(),
          })
          .where(eq(budgetItemsTable.id, sessionData.budget_item_id));
      }

      // 5. Registrar en auditoría
      await this.auditService.logChange({
        patientId: patientId,
        entityType: AUDIT_ENTITY_TYPES.TRATAMIENTO,
        entityId: newTreatment.id_tratamiento,
        action: AUDIT_ACTIONS.CREATED,
        oldValues: {},
        newValues: {
          budget_item_id: sessionData.budget_item_id,
          fecha: sessionData.fecha_control,
          descripcion: sessionData.descripcion,
          is_first: isFirstTreatment,
        },
        changedBy: userId,
        notes: isFirstTreatment
          ? `Primer tratamiento registrado para item del presupuesto`
          : `Nueva sesión registrada (sesión ${existingTreatments.length})`,
      });

      return {
        statusCode: 201,
        body: JSON.stringify({
          message: isFirstTreatment
            ? "Primer tratamiento registrado exitosamente"
            : "Sesión registrada exitosamente",
          treatment: newTreatment,
          isFirstTreatment,
        }),
        headers: HEADERS.json,
      };
    } catch (error: any) {
      console.error("Error al agregar tratamiento/sesión:", error);
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "Error al agregar tratamiento/sesión",
          error: error.message,
        }),
        headers: HEADERS.json,
      };
    }
  }
}
