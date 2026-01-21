import { HttpAdapter } from "@/config/adapters/http/http.adapter";
import { AestheticNote } from "./types";

export const getAestheticNotesByPatientUseCase = async (
  fetcher: HttpAdapter,
  patientId: string
): Promise<AestheticNote[]> => {
  try {
    const response = await fetcher.get<AestheticNote[]>(
      `/aesthetic/patient/${patientId}`
    );
    return response;
  } catch (error) {
    throw new Error(`Error obteniendo fichas estéticas: ${error}`);
  }
};
