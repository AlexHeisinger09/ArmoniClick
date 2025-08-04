import { BudgetService } from "../../../services/budget.service";
import { HEADERS } from "../../../config/utils";
import { HandlerResponse } from "@netlify/functions";

export class ActivateBudget {
  constructor(private readonly budgetService: BudgetService = new BudgetService()) {}

  public async execute(budgetId: number, userId: number): Promise<HandlerResponse> {
    try {
      await this.budgetService.activateBudget(budgetId, userId);

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