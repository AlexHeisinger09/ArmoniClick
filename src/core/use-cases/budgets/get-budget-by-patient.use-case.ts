import { HttpAdapter } from "@/config/adapters/http/http.adapter";
import { GetBudgetResponse } from "./types";

export const getBudgetByPatientUseCase = async (
  fetcher: HttpAdapter,
  patientId: number
): Promise<GetBudgetResponse> => {
  try {
    const response = await fetcher.get<GetBudgetResponse>(
      `/budgets/patient/${patientId}`
    );
    return response;
  } catch (error) {
    throw new Error(`Error obteniendo presupuesto: ${error}`);
  }
};