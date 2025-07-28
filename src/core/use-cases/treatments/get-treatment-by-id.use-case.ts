import { HttpAdapter } from "@/config/adapters/http/http.adapter";
import { GetTreatmentByIdResponse } from "./types";

export const getTreatmentByIdUseCase = async (
  fetcher: HttpAdapter,
  treatmentId: number
): Promise<GetTreatmentByIdResponse> => {
  try {
    const treatment = await fetcher.get<GetTreatmentByIdResponse>(
      `/treatments/${treatmentId}`
    );
    return treatment;
  } catch (error) {
    throw new Error(`Error obteniendo tratamiento: ${error}`);
  }
};