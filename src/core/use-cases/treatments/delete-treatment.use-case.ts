import { HttpAdapter } from "@/config/adapters/http/http.adapter";
import { DeleteTreatmentResponse } from "./types";

export const deleteTreatmentUseCase = async (
  fetcher: HttpAdapter,
  treatmentId: number
): Promise<DeleteTreatmentResponse> => {
  try {
    const response = await fetcher.delete<DeleteTreatmentResponse>(
      `/treatments/${treatmentId}`
    );
    return response;
  } catch (error) {
    throw new Error(`Error eliminando tratamiento: ${error}`);
  }
};