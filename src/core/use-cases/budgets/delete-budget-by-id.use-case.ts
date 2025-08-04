import { HttpAdapter } from "@/config/adapters/http/http.adapter";
import { DeleteBudgetResponse } from "./types";

export const deleteBudgetByIdUseCase = async (
  fetcher: HttpAdapter,
  budgetId: number
): Promise<DeleteBudgetResponse> => {
  try {
    const response = await fetcher.delete<DeleteBudgetResponse>(
      `/budgets/${budgetId}`
    );
    return response;
  } catch (error) {
    throw new Error(`Error eliminando presupuesto: ${error}`);
  }
};