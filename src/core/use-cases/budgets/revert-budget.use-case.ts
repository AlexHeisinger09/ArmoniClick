import { HttpAdapter } from "@/config/adapters/http/http.adapter";
import { RevertBudgetResponse } from "./types";

export const revertBudgetUseCase = async (
  fetcher: HttpAdapter,
  budgetId: number
): Promise<RevertBudgetResponse> => {
  try {
    const response = await fetcher.put<RevertBudgetResponse>(
      `/budgets/${budgetId}/revert`,
      {}
    );
    return response;
  } catch (error) {
    throw new Error(`Error revirtiendo presupuesto: ${error}`);
  }
};