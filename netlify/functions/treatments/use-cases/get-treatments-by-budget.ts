import { TreatmentService } from "../../../services/treatment.service";
import { BudgetService } from "../../../services/budget.service";
import { HEADERS } from "../../../config/utils";
import { HandlerResponse } from "@netlify/functions";

interface GetTreatmentsByBudgetUseCase {
  execute: (budgetId: number, doctorId: number) => Promise<HandlerResponse>;
}

export class GetTreatmentsByBudget implements GetTreatmentsByBudgetUseCase {
  constructor(
    private readonly treatmentService: TreatmentService = new TreatmentService(),
    private readonly budgetService: BudgetService = new BudgetService()
  ) {}

  public async execute(budgetId: number, doctorId: number): Promise<HandlerResponse> {
    try {
      const treatments = await this.treatmentService.findByBudgetId(budgetId, doctorId);
      const budget = await this.budgetService.findByBudgetId(budgetId, doctorId);

      if (!budget) {
        return {
          statusCode: 404,
          body: JSON.stringify({
            message: "Presupuesto no encontrado",
          }),
          headers: HEADERS.json,
        };
      }

      return {
        statusCode: 200,
        body: JSON.stringify({
          treatments,
          budget: {
            id: budget.id,
            budget_type: budget.budget_type,
            status: budget.status,
            total_amount: budget.total_amount,
            created_at: budget.created_at,
          },
          total: treatments.length,
        }),
        headers: HEADERS.json,
      };
    } catch (error: any) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "Error al obtener los tratamientos del presupuesto",
          error: error.message,
        }),
        headers: HEADERS.json,
      };
    }
  }
}