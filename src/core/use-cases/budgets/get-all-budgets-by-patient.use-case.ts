import { HttpAdapter } from "@/config/adapters/http/http.adapter";
import { GetAllBudgetsResponse } from "./types";

export const getAllBudgetsByPatientUseCase = async (
  fetcher: HttpAdapter,
  patientId: number
): Promise<GetAllBudgetsResponse> => {
  try {
    const response = await fetcher.get<GetAllBudgetsResponse>(
      `/budgets/patient/${patientId}`
    );
    return response;
  } catch (error) {
    throw new Error(`Error obteniendo presupuestos: ${error}`);
  }
};
