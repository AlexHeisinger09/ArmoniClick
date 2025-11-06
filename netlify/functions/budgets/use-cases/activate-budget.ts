import { BudgetService } from "../../../services/budget.service";
import { AuditService } from "../../../services/AuditService";
import { db } from "../../../data/db";
import { HEADERS } from "../../../config/utils";
import { HandlerResponse } from "@netlify/functions";
import { AUDIT_ENTITY_TYPES, AUDIT_ACTIONS } from "../../../data/schemas";

export class ActivateBudget {
  constructor(
    private readonly budgetService: BudgetService = new BudgetService(),
    private readonly auditService: AuditService = new AuditService(db)
  ) {}

  public async execute(budgetId: number, userId: number, patientId?: number): Promise<HandlerResponse> {
    try {
      await this.budgetService.activateBudget(budgetId, userId);

      // 📝 Registrar en auditoría (cambio de estado)
      if (patientId) {
        await this.auditService.logChange({
          patientId: patientId,
          entityType: AUDIT_ENTITY_TYPES.PRESUPUESTO,
          entityId: budgetId,
          action: AUDIT_ACTIONS.STATUS_CHANGED,
          oldValues: { status: "borrador" },
          newValues: { status: "activo" },
          changedBy: userId,
          notes: `Presupuesto activado - se generarán tratamientos`,
        });
      }

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Presupuesto activado exitosamente",
        }),
        headers: HEADERS.json,
      };
    } catch (error: any) {
      if (error.message.includes('Ya existe un presupuesto activo')) {
        return {
          statusCode: 409, // Conflict
          body: JSON.stringify({
            message: "Conflicto de activación",
            error: error.message,
          }),
          headers: HEADERS.json,
        };
      }

      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "Error al activar el presupuesto",
          error: error.message,
        }),
        headers: HEADERS.json,
      };
    }
  }
}