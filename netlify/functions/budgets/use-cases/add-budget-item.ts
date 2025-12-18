// netlify/functions/budgets/use-cases/add-budget-item.ts
import { BudgetService } from "../../../services/budget.service";
import { HEADERS } from "../../../config/utils";
import { HandlerResponse } from "@netlify/functions";

interface AddBudgetItemUseCase {
  execute: (
    budgetId: number,
    userId: number,
    treatmentData: {
      pieza?: string;
      accion: string;
      valor: number;
    }
  ) => Promise<HandlerResponse>;
}

export class AddBudgetItem implements AddBudgetItemUseCase {
  constructor(private readonly budgetService: BudgetService = new BudgetService()) {}

  public async execute(
    budgetId: number,
    userId: number,
    treatmentData: {
      pieza?: string;
      accion: string;
      valor: number;
    }
  ): Promise<HandlerResponse> {
    try {
      const budgetItemId = await this.budgetService.addTreatmentToBudget(
        budgetId,
        userId,
        treatmentData
      );

      return {
        statusCode: 201,
        body: JSON.stringify({
          message: "Budget item creado exitosamente",
          budgetItemId,
        }),
        headers: HEADERS.json,
      };
    } catch (error: any) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "Error al crear budget item",
          error: error.message,
        }),
        headers: HEADERS.json,
      };
    }
  }
}
