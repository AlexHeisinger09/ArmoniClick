import { BudgetService } from "../../../services/budget.service";
import { HEADERS } from "../../../config/utils";
import { HandlerResponse } from "@netlify/functions";

interface GetBudgetStatsUseCase {
  execute: (userId: number) => Promise<HandlerResponse>;
}

export class GetBudgetStats implements GetBudgetStatsUseCase {
  constructor(private readonly budgetService: BudgetService = new BudgetService()) {}

  public async execute(userId: number): Promise<HandlerResponse> {
    try {
      const stats = await this.budgetService.getBudgetStats(userId);

      return {
        statusCode: 200,
        body: JSON.stringify({
          stats,
        }),
        headers: HEADERS.json,
      };
    } catch (error: any) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "Error al obtener estadísticas de presupuestos",
          error: error.message,
        }),
        headers: HEADERS.json,
      };
    }
  }
}
