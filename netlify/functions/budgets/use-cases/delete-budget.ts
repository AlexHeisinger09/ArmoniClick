import { BudgetService } from "../../../services/budget.service";
import { HEADERS } from "../../../config/utils";
import { HandlerResponse } from "@netlify/functions";

interface DeleteBudgetUseCase {
  execute: (patientId: number, userId: number) => Promise<HandlerResponse>;
}

export class DeleteBudget implements DeleteBudgetUseCase {
  constructor(private readonly budgetService: BudgetService = new BudgetService()) {}

  public async execute(patientId: number, userId: number): Promise<HandlerResponse> {
    try {
      await this.budgetService.deleteBudget(patientId, userId);

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Presupuesto eliminado exitosamente",
        }),
        headers: HEADERS.json,
      };
    } catch (error: any) {
      if (error.message.includes('Solo se pueden eliminar presupuestos en estado borrador')) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "No se puede eliminar un presupuesto activo o completado",
            error: error.message,
          }),
          headers: HEADERS.json,
        };
      }

      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "Error al eliminar el presupuesto",
          error: error.message,
        }),
        headers: HEADERS.json,
      };
    }
  }
}