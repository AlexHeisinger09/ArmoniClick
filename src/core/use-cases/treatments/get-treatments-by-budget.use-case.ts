import { HttpAdapter } from "@/config/adapters/http/http.adapter";
import { GetTreatmentsByBudgetResponse } from "./types";

export const getTreatmentsByBudgetUseCase = async (
  fetcher: HttpAdapter,
  budgetId: number
): Promise<GetTreatmentsByBudgetResponse> => {
  try {
    const treatments = await fetcher.get<GetTreatmentsByBudgetResponse>(
      `/treatments/budget/${budgetId}`
    );
    return treatments;
  } catch (error) {
    throw new Error(`Error obteniendo tratamientos del presupuesto: ${error}`);
  }
};