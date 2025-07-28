import { HttpAdapter } from "@/config/adapters/http/http.adapter";
import { UpdateTreatmentData, UpdateTreatmentResponse } from "./types";

export const updateTreatmentUseCase = async (
  fetcher: HttpAdapter,
  treatmentId: number,
  treatmentData: UpdateTreatmentData
): Promise<UpdateTreatmentResponse> => {
  try {
    const treatment = await fetcher.put<UpdateTreatmentResponse>(
      `/treatments/${treatmentId}`,
      treatmentData
    );
    return treatment;
  } catch (error) {
    throw new Error(`Error actualizando tratamiento: ${error}`);
  }
};