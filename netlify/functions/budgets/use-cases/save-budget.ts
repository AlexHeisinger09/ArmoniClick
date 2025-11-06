import { BudgetService } from "../../../services/budget.service";
import { AuditService } from "../../../services/AuditService";
import { db } from "../../../data/db";
import { SaveBudgetDto } from "../dtos";
import { HEADERS } from "../../../config/utils";
import { HandlerResponse } from "@netlify/functions";
import { AUDIT_ENTITY_TYPES, AUDIT_ACTIONS } from "../../../data/schemas";

interface SaveBudgetUseCase {
  execute: (dto: SaveBudgetDto, userId: number) => Promise<HandlerResponse>;
}

export class SaveBudget implements SaveBudgetUseCase {
  constructor(
    private readonly budgetService: BudgetService = new BudgetService(),
    private readonly auditService: AuditService = new AuditService(db)
  ) {}

  public async execute(dto: SaveBudgetDto, userId: number): Promise<HandlerResponse> {
    try {
      const budget = await this.budgetService.saveOrUpdateBudget(
        dto.patientId,
        userId,
        dto.budgetType,
        dto.items
      );

      // 📝 Registrar en auditoría
      await this.auditService.logChange({
        patientId: dto.patientId,
        entityType: AUDIT_ENTITY_TYPES.PRESUPUESTO,
        entityId: budget.id,
        action: AUDIT_ACTIONS.CREATED,
        newValues: {
          total_amount: budget.total_amount,
          status: budget.status,
          budget_type: budget.budget_type,
          items_count: dto.items?.length || 0,
        },
        changedBy: userId,
        notes: `Presupuesto ${budget.budget_type} creado/actualizado - Total: $${budget.total_amount}`,
      });

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Presupuesto guardado exitosamente",
          budget,
        }),
        headers: HEADERS.json,
      };
    } catch (error: any) {
      // Manejar errores específicos
      if (error.message.includes('Solo se pueden modificar presupuestos en estado borrador')) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "No se puede modificar un presupuesto activo o completado",
            error: error.message,
          }),
          headers: HEADERS.json,
        };
      }

      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "Error al guardar el presupuesto",
          error: error.message,
        }),
        headers: HEADERS.json,
      };
    }
  }
}