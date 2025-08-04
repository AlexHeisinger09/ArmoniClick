import { BudgetService } from "../../../services/budget.service";
import { HEADERS } from "../../../config/utils";
import { HandlerResponse } from "@netlify/functions";

export class GetActiveBudgetByPatient {
  constructor(private readonly budgetService: BudgetService = new BudgetService()) {}

  public async execute(patientId: number, userId: number): Promise<HandlerResponse> {
    try {
      const activeBudget = await this.budgetService.findActiveByPatientId(patientId, userId);

      return {
        statusCode: 200,
        body: JSON.stringify({
          budget: activeBudget,
          canModify: activeBudget ? await this.budgetService.canModifyBudget(activeBudget.id, userId) : false,
        }),
        headers: HEADERS.json,
      };
    } catch (error: any) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "Error al obtener el presupuesto activo",
          error: error.message,
        }),
        headers: HEADERS.json,
      };
    }
  }
}
