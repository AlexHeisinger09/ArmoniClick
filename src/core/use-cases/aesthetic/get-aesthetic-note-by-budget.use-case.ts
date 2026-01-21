import { HttpAdapter } from "@/config/adapters/http/http.adapter";
import { AestheticNote } from "./types";

export const getAestheticNoteByBudgetUseCase = async (
  fetcher: HttpAdapter,
  budgetId: string
): Promise<AestheticNote | null> => {
  try {
    const response = await fetcher.get<AestheticNote | null>(
      `/aesthetic/budget/${budgetId}`
    );
    return response;
  } catch (error) {
    throw new Error(`Error obteniendo ficha estética por presupuesto: ${error}`);
  }
};
