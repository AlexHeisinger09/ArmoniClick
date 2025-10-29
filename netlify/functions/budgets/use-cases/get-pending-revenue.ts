import { BudgetService } from "../../../services/budget.service";
import { HEADERS } from "../../../config/utils";
import { HandlerResponse } from "@netlify/functions";

interface GetPendingRevenueUseCase {
  execute: (userId: number) => Promise<HandlerResponse>;
}

/**
 * Use case para obtener el dinero pendiente (treatments no completados)
 * Retorna el total en pesos de todos los treatments que aún no han sido completados
 * Esto representa el dinero potencial que se podría ganar si se completan todos los tratamientos
 */
export class GetPendingRevenue implements GetPendingRevenueUseCase {
  constructor(private readonly budgetService: BudgetService = new BudgetService()) {}

  public async execute(userId: number): Promise<HandlerResponse> {
    try {
      const pendingTotal = await this.budgetService.getPendingRevenue(userId);

      return {
        statusCode: 200,
        body: JSON.stringify({
          pendingRevenue: pendingTotal,
          formatted: pendingTotal.toLocaleString('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }),
        }),
        headers: HEADERS.json,
      };
    } catch (error: any) {
      console.error('❌ Error en GetPendingRevenue:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "Error al obtener dinero pendiente",
          error: error.message,
        }),
        headers: HEADERS.json,
      };
    }
  }
}
