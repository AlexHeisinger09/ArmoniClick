import { BudgetService } from "../../../services/budget.service";
import { UpdateBudgetStatusDto } from "../dtos";
import { HEADERS } from "../../../config/utils";
import { HandlerResponse } from "@netlify/functions";

interface UpdateBudgetStatusUseCase {
  execute: (budgetId: number, dto: UpdateBudgetStatusDto, userId: number) => Promise<HandlerResponse>;
}

export class UpdateBudgetStatus implements UpdateBudgetStatusUseCase {
  constructor(private readonly budgetService: BudgetService = new BudgetService()) {}

  public async execute(budgetId: number, dto: UpdateBudgetStatusDto, userId: number): Promise<HandlerResponse> {
    try {
      await this.budgetService.updateStatus(budgetId, userId, dto.status);

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Estado del presupuesto actualizado exitosamente",
        }),
        headers: HEADERS.json,
      };
    } catch (error: any) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "Error al actualizar el estado del presupuesto",
          error: error.message,
        }),
        headers: HEADERS.json,
      };
    }
  }
}