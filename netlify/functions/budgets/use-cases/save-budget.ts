import { BudgetService } from "../../../services/budget.service";
import { SaveBudgetDto } from "../dtos";
import { HEADERS } from "../../../config/utils";
import { HandlerResponse } from "@netlify/functions";

interface SaveBudgetUseCase {
  execute: (dto: SaveBudgetDto, userId: number) => Promise<HandlerResponse>;
}

export class SaveBudget implements SaveBudgetUseCase {
  constructor(private readonly budgetService: BudgetService = new BudgetService()) {}

  public async execute(dto: SaveBudgetDto, userId: number): Promise<HandlerResponse> {
    try {
      const budget = await this.budgetService.saveOrUpdateBudget(
        dto.patientId,
        userId,
        dto.budgetType,
        dto.items
      );

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Presupuesto guardado exitosamente",
          budget,
        }),
        headers: HEADERS.json,
      };
    } catch (error: any) {
      // Manejar errores específicos
      if (error.message.includes('Solo se pueden modificar presupuestos en estado borrador')) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "No se puede modificar un presupuesto activo o completado",
            error: error.message,
          }),
          headers: HEADERS.json,
        };
      }

      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "Error al guardar el presupuesto",
          error: error.message,
        }),
        headers: HEADERS.json,
      };
    }
  }
}