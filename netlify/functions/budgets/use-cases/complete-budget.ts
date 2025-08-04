import { BudgetService } from "../../../services/budget.service";
import { HEADERS } from "../../../config/utils";
import { HandlerResponse } from "@netlify/functions";

export class CompleteBudget {
  constructor(private readonly budgetService: BudgetService = new BudgetService()) {}

  public async execute(budgetId: number, userId: number): Promise<HandlerResponse> {
    try {
      await this.budgetService.completeBudget(budgetId, userId);

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Presupuesto completado exitosamente",
        }),
        headers: HEADERS.json,
      };
    } catch (error: any) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "Error al completar el presupuesto",
          error: error.message,
        }),
        headers: HEADERS.json,
      };
    }
  }
}
