import { BudgetService } from "../../../services/budget.service";
import { HEADERS } from "../../../config/utils";
import { HandlerResponse } from "@netlify/functions";

interface GetAllBudgetsByPatientUseCase {
  execute: (patientId: number, userId: number) => Promise<HandlerResponse>;
}

export class GetAllBudgetsByPatient implements GetAllBudgetsByPatientUseCase {
  constructor(private readonly budgetService: BudgetService = new BudgetService()) {}

  public async execute(patientId: number, userId: number): Promise<HandlerResponse> {
    try {
      const budgets = await this.budgetService.findAllByPatientId(patientId, userId);

      return {
        statusCode: 200,
        body: JSON.stringify({
          budgets,
          total: budgets.length,
        }),
        headers: HEADERS.json,
      };
    } catch (error: any) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "Error al obtener los presupuestos",
          error: error.message,
        }),
        headers: HEADERS.json,
      };
    }
  }
}