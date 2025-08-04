import { HttpAdapter } from "@/config/adapters/http/http.adapter";
import { ActivateBudgetResponse } from "./types";

export const activateBudgetUseCase = async (
  fetcher: HttpAdapter,
  budgetId: number
): Promise<ActivateBudgetResponse> => {
  try {
    const response = await fetcher.put<ActivateBudgetResponse>(
      `/budgets/${budgetId}/activate`,
      {}
    );
    return response;
  } catch (error) {
    throw new Error(`Error activando presupuesto: ${error}`);
  }
};