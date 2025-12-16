// netlify/functions/budgets/use-cases/delete-budget-item.ts
import { BudgetService } from "../../../services/budget.service";
import { HEADERS } from "../../../config/utils";
import { HandlerResponse } from "@netlify/functions";
import { db } from "../../../data/db";
import { budgetItemsTable, budgetsTable } from "../../../data/schemas/budget.schema";
import { treatmentsTable } from "../../../data/schemas/treatment.schema";
import { eq, and, sql } from "drizzle-orm";
import { AuditService } from "../../../services/AuditService";
import { AUDIT_ENTITY_TYPES, AUDIT_ACTIONS } from "../../../data/schemas";

interface DeleteBudgetItemUseCase {
  execute: (budgetItemId: number, doctorId: number) => Promise<HandlerResponse>;
}

export class DeleteBudgetItem implements DeleteBudgetItemUseCase {
  constructor(
    private readonly budgetService: BudgetService = new BudgetService(),
    private readonly auditService: AuditService = new AuditService(db)
  ) {}

  public async execute(budgetItemId: number, doctorId: number): Promise<HandlerResponse> {
    try {
      console.log('🗑️ DeleteBudgetItem - Iniciando eliminación:', { budgetItemId, doctorId });

      // 1. Verificar que el budget_item existe y pertenece al doctor
      const budgetItemResult = await db
        .select({
          id: budgetItemsTable.id,
          budget_id: budgetItemsTable.budget_id,
          pieza: budgetItemsTable.pieza,
          accion: budgetItemsTable.accion,
          valor: budgetItemsTable.valor,
          budget_user_id: budgetsTable.user_id,
        })
        .from(budgetItemsTable)
        .innerJoin(budgetsTable, eq(budgetItemsTable.budget_id, budgetsTable.id))
        .where(
          and(
            eq(budgetItemsTable.id, budgetItemId),
            eq(budgetsTable.user_id, doctorId)
          )
        )
        .limit(1);

      if (budgetItemResult.length === 0) {
        console.error('❌ Budget item no encontrado:', { budgetItemId, doctorId });
        return {
          statusCode: 404,
          body: JSON.stringify({
            message: "Item del presupuesto no encontrado o no tienes permiso para eliminarlo",
          }),
          headers: HEADERS.json,
        };
      }

      const budgetItem = budgetItemResult[0];
      const budgetId = budgetItem.budget_id;

      console.log('✅ Budget item encontrado:', budgetItem);

      // 2. Eliminar todos los tratamientos asociados (CASCADE)
      const deletedTreatments = await db
        .delete(treatmentsTable)
        .where(eq(treatmentsTable.budget_item_id, budgetItemId))
        .returning();

      console.log(`🗑️ Tratamientos eliminados: ${deletedTreatments.length}`);

      // 3. Eliminar el budget_item
      await db
        .delete(budgetItemsTable)
        .where(eq(budgetItemsTable.id, budgetItemId));

      console.log('✅ Budget item eliminado');

      // 4. Recalcular el total del presupuesto
      const remainingItems = await db
        .select({ valor: budgetItemsTable.valor })
        .from(budgetItemsTable)
        .where(eq(budgetItemsTable.budget_id, budgetId));

      const newTotal = remainingItems.reduce((sum, item) => {
        return sum + parseFloat(item.valor || '0');
      }, 0);

      console.log('💰 Nuevo total calculado:', newTotal);

      // 5. Actualizar el total del presupuesto
      await db
        .update(budgetsTable)
        .set({
          total_amount: newTotal.toString(),
          updated_at: new Date(),
        })
        .where(eq(budgetsTable.id, budgetId));

      console.log('✅ Total del presupuesto actualizado');

      // 6. Registrar en auditoría
      await this.auditService.logChange({
        patientId: 0, // No tenemos patientId aquí, se puede obtener del budget si es necesario
        entityType: AUDIT_ENTITY_TYPES.PRESUPUESTO,
        entityId: budgetId,
        action: AUDIT_ACTIONS.DELETED,
        oldValues: {
          budget_item_id: budgetItemId,
          accion: budgetItem.accion,
          pieza: budgetItem.pieza,
          valor: budgetItem.valor,
        },
        newValues: {
          new_total: newTotal,
        },
        changedBy: doctorId,
        notes: `Item del presupuesto eliminado con ${deletedTreatments.length} tratamiento(s) asociado(s). Total recalculado.`,
      });

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Item del presupuesto eliminado exitosamente",
          deletedTreatments: deletedTreatments.length,
          newBudgetTotal: newTotal,
        }),
        headers: HEADERS.json,
      };
    } catch (error: any) {
      console.error("❌ Error al eliminar budget item:", error);
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "Error al eliminar el item del presupuesto",
          error: error.message,
        }),
        headers: HEADERS.json,
      };
    }
  }
}
