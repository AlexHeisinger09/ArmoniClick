import { BudgetService } from "../../../services/budget.service";
import { HEADERS } from "../../../config/utils";
import { HandlerResponse } from "@netlify/functions";

interface GetBudgetByPatientUseCase {
  execute: (patientId: number, userId: number) => Promise<HandlerResponse>;
}

export class GetBudgetByPatient implements GetBudgetByPatientUseCase {
  constructor(private readonly budgetService: BudgetService = new BudgetService()) {}

  public async execute(patientId: number, userId: number): Promise<HandlerResponse> {
    try {
      const budget = await this.budgetService.findByPatientId(patientId, userId);

      return {
        statusCode: 200,
        body: JSON.stringify({
          budget: budget || null,
          canModify: await this.budgetService.canModifyBudget(patientId, userId),
        }),
        headers: HEADERS.json,
      };
    } catch (error: any) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "Error al obtener el presupuesto",
          error: error.message,
        }),
        headers: HEADERS.json,
      };
    }
  }
}