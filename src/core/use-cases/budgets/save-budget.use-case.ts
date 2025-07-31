import { HttpAdapter } from "@/config/adapters/http/http.adapter";
import { CreateBudgetData, SaveBudgetResponse } from "./types";

export const saveBudgetUseCase = async (
  fetcher: HttpAdapter,
  budgetData: CreateBudgetData
): Promise<SaveBudgetResponse> => {
  try {
    const response = await fetcher.post<SaveBudgetResponse>(
      `/budgets/patient/${budgetData.patientId}`,
      {
        budgetType: budgetData.budgetType,
        items: budgetData.items
      }
    );
    return response;
  } catch (error) {
    throw new Error(`Error guardando presupuesto: ${error}`);
  }
};