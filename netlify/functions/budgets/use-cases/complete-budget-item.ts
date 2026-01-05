// netlify/functions/budgets/use-cases/complete-budget-item.ts
import { HEADERS } from "../../../config/utils";
import { HandlerResponse } from "@netlify/functions";
import { db } from "../../../data/db";
import { budgetItemsTable, budgetsTable, BUDGET_ITEM_STATUS } from "../../../data/schemas/budget.schema";
import { treatmentsTable } from "../../../data/schemas/treatment.schema";
import { eq, and } from "drizzle-orm";
import { AuditService } from "../../../services/AuditService";
import { AUDIT_ENTITY_TYPES, AUDIT_ACTIONS } from "../../../data/schemas";

export class CompleteBudgetItem {
  constructor(
    private readonly auditService: AuditService = new AuditService(db)
  ) {}

  public async execute(budgetItemId: number, doctorId: number): Promise<HandlerResponse> {
    try {
      // 1. Verificar permisos
      const budgetItemResult = await db
        .select({
          id: budgetItemsTable.id,
          budget_id: budgetItemsTable.budget_id,
          status: budgetItemsTable.status,
          valor: budgetItemsTable.valor,
          budget_user_id: budgetsTable.user_id,
        })
        .from(budgetItemsTable)
        .innerJoin(budgetsTable, eq(budgetItemsTable.budget_id, budgetsTable.id))
        .where(and(eq(budgetItemsTable.id, budgetItemId), eq(budgetsTable.user_id, doctorId)))
        .limit(1);

      if (budgetItemResult.length === 0) {
        return {
          statusCode: 404,
          body: JSON.stringify({ message: "Item no encontrado" }),
          headers: HEADERS.json,
        };
      }

      const budgetItem = budgetItemResult[0];

      // 2. Marcar todos los tratamientos (sesiones) como completados
      await db
        .update(treatmentsTable)
        .set({ status: 'completed', updated_at: new Date() })
        .where(and(
          eq(treatmentsTable.budget_item_id, budgetItemId),
          eq(treatmentsTable.is_active, true)
        ));

      // 3. Marcar budget_item como completado
      await db
        .update(budgetItemsTable)
        .set({ status: BUDGET_ITEM_STATUS.COMPLETADO, updated_at: new Date() })
        .where(eq(budgetItemsTable.id, budgetItemId));

      // 4. Verificar si todos los items están completados para actualizar el presupuesto
      const allItems = await db
        .select({ status: budgetItemsTable.status })
        .from(budgetItemsTable)
        .where(eq(budgetItemsTable.budget_id, budgetItem.budget_id));

      const allCompleted = allItems.every(item => item.status === BUDGET_ITEM_STATUS.COMPLETADO);

      if (allCompleted) {
        await db
          .update(budgetsTable)
          .set({ status: 'completed', updated_at: new Date() })
          .where(eq(budgetsTable.id, budgetItem.budget_id));
      }

      // 5. Auditoría
      await this.auditService.logChange({
        patientId: 0,
        entityType: AUDIT_ENTITY_TYPES.PRESUPUESTO,
        entityId: budgetItem.budget_id,
        action: AUDIT_ACTIONS.UPDATED,
        oldValues: { status: budgetItem.status },
        newValues: { status: BUDGET_ITEM_STATUS.COMPLETADO },
        changedBy: doctorId,
        notes: `Item completado. Valor: $${budgetItem.valor}`,
      });

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Item completado exitosamente",
          valor: budgetItem.valor,
        }),
        headers: HEADERS.json,
      };
    } catch (error: any) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: "Error al completar item", error: error.message }),
        headers: HEADERS.json,
      };
    }
  }
}
