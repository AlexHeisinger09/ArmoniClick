import { HttpAdapter } from "@/config/adapters/http/http.adapter";
import { UpdateBudgetStatusData, UpdateBudgetStatusResponse } from "./types";

export const updateBudgetStatusUseCase = async (
  fetcher: HttpAdapter,
  budgetId: number,
  statusData: UpdateBudgetStatusData
): Promise<UpdateBudgetStatusResponse> => {
  try {
    const response = await fetcher.put<UpdateBudgetStatusResponse>(
      `/budgets/${budgetId}/status`,
      statusData
    );
    return response;
  } catch (error) {
    throw new Error(`Error actualizando estado del presupuesto: ${error}`);
  }
};