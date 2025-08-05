import { HttpAdapter } from "@/config/adapters/http/http.adapter";
import { UpdateTreatmentResponse } from "./types";

export const completeTreatmentUseCase = async (
  fetcher: HttpAdapter,
  treatmentId: number
): Promise<UpdateTreatmentResponse> => {
  try {
    const response = await fetcher.put<UpdateTreatmentResponse>(
      `/treatments/${treatmentId}/complete`,
      {}
    );
    return response;
  } catch (error) {
    throw new Error(`Error completando tratamiento: ${error}`);
  }
};