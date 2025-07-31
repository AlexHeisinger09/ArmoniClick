import { HttpAdapter } from "@/config/adapters/http/http.adapter";
import { CreateBudgetData, SaveBudgetResponse } from "./types";

export const saveBudgetUseCase = async (
  fetcher: HttpAdapter,
  budgetData: CreateBudgetData
): Promise<SaveBudgetResponse> => {
  try {
    // ✅ SOLUCIÓN: Convertir items a JSON string para que el backend pueda procesarlo
    const dataToSend = {
      budgetType: budgetData.budgetType,
      items: JSON.stringify(budgetData.items) // ← Convertir array a JSON string
    };

    const response = await fetcher.post<SaveBudgetResponse>(
      `/budgets/patient/${budgetData.patientId}`,
      dataToSend
    );
    return response;
  } catch (error) {
    throw new Error(`Error guardando presupuesto: ${error}`);
  }
};