import { HttpAdapter } from "@/config/adapters/http/http.adapter";
import { GetBudgetSummariesResponse } from "./types";

export const getBudgetsByPatientUseCase = async (
  fetcher: HttpAdapter,
  patientId: number
): Promise<GetBudgetSummariesResponse> => {
  try {
    const budgets = await fetcher.get<GetBudgetSummariesResponse>(
      `/treatments/patient/${patientId}/budgets`
    );
    return budgets;
  } catch (error) {
    throw new Error(`Error obteniendo presupuestos del paciente: ${error}`);
  }
};