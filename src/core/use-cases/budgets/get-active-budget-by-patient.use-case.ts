import { HttpAdapter } from "@/config/adapters/http/http.adapter";
import { GetActiveBudgetResponse } from "./types";

export const getActiveBudgetByPatientUseCase = async (
  fetcher: HttpAdapter,
  patientId: number
): Promise<GetActiveBudgetResponse> => {
  try {
    const response = await fetcher.get<GetActiveBudgetResponse>(
      `/budgets/patient/${patientId}/active`
    );
    return response;
  } catch (error) {
    throw new Error(`Error obteniendo presupuesto activo: ${error}`);
  }
};