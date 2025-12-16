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
      // ✅ NUEVO: Obtener budget_items con sus treatments agrupados
      const budgetItemsWithTreatments = await this.treatmentService.getBudgetItemsWithTreatments(budgetId, doctorId);
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
          budgetItems: budgetItemsWithTreatments, // ✅ Retorna budget_items con sus treatments
          budget: {
            id: budget.id,
            budget_type: budget.budget_type,
            status: budget.status,
            total_amount: budget.total_amount,
            created_at: budget.created_at,
          },
          total: budgetItemsWithTreatments.length,
        }),
        headers: HEADERS.json,
      };
    } catch (error: any) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "Error al obtener los items del presupuesto",
          error: error.message,
        }),
        headers: HEADERS.json,
      };
    }
  }
}