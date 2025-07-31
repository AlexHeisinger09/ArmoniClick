import { HttpAdapter } from "@/config/adapters/http/http.adapter";
import { DeleteBudgetResponse } from "./types";

export const deleteBudgetUseCase = async (
  fetcher: HttpAdapter,
  patientId: number
): Promise<DeleteBudgetResponse> => {
  try {
    const response = await fetcher.delete<DeleteBudgetResponse>(
      `/budgets/patient/${patientId}`
    );
    return response;
  } catch (error) {
    throw new Error(`Error eliminando presupuesto: ${error}`);
  }
};