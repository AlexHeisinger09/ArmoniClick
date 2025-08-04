import { HttpAdapter } from "@/config/adapters/http/http.adapter";
import { CompleteBudgetResponse } from "./types";

export const completeBudgetUseCase = async (
  fetcher: HttpAdapter,
  budgetId: number
): Promise<CompleteBudgetResponse> => {
  try {
    const response = await fetcher.put<CompleteBudgetResponse>(
      `/budgets/${budgetId}/complete`,
      {}
    );
    return response;
  } catch (error) {
    throw new Error(`Error completando presupuesto: ${error}`);
  }
};