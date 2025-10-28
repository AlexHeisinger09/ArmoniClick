import { BudgetService } from "../../../services/budget.service";
import { HEADERS } from "../../../config/utils";
import { HandlerResponse } from "@netlify/functions";

interface GetAllCompletedBudgetsUseCase {
  execute: (userId: number) => Promise<HandlerResponse>;
}

export class GetAllCompletedBudgets implements GetAllCompletedBudgetsUseCase {
  constructor(private readonly budgetService: BudgetService = new BudgetService()) {}

  public async execute(userId: number): Promise<HandlerResponse> {
    try {
      const budgets = await this.budgetService.getAllCompletedBudgets(userId);

      return {
        statusCode: 200,
        body: JSON.stringify({
          budgets,
          count: budgets.length,
        }),
        headers: HEADERS.json,
      };
    } catch (error: any) {
      console.error('❌ Error en GetAllCompletedBudgets:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "Error al obtener presupuestos completados",
          error: error.message,
        }),
        headers: HEADERS.json,
      };
    }
  }
}
