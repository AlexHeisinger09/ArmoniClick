import { HttpAdapter } from "@/config/adapters/http/http.adapter";
import { SaveAestheticNoteData, SaveAestheticNoteResponse } from "./types";

export const saveAestheticNoteUseCase = async (
  fetcher: HttpAdapter,
  data: SaveAestheticNoteData
): Promise<SaveAestheticNoteResponse> => {
  try {
    const response = await fetcher.post<SaveAestheticNoteResponse>(
      `/aesthetic/patient/${data.patientId}`,
      {
        budgetId: data.budgetId,
        facialData: JSON.stringify(data.facialData),
        drawingsData: JSON.stringify(data.drawingsData),
        gender: data.gender
      }
    );
    return response;
  } catch (error) {
    throw new Error(`Error guardando ficha estética: ${error}`);
  }
};
