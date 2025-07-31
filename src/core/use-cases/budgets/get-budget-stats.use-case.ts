import { HttpAdapter } from "@/config/adapters/http/http.adapter";
import { GetBudgetStatsResponse } from "./types";

export const getBudgetStatsUseCase = async (
  fetcher: HttpAdapter
): Promise<GetBudgetStatsResponse> => {
  try {
    const response = await fetcher.get<GetBudgetStatsResponse>("/budgets/stats");
    return response;
  } catch (error) {
    throw new Error(`Error obteniendo estadísticas de presupuestos: ${error}`);
  }
};
