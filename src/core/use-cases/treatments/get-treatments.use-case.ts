import { HttpAdapter } from "@/config/adapters/http/http.adapter";
import { GetTreatmentsResponse } from "./types";

export const getTreatmentsUseCase = async (
  fetcher: HttpAdapter,
  patientId: number
): Promise<GetTreatmentsResponse> => {
  try {
    const treatments = await fetcher.get<GetTreatmentsResponse>(
      `/treatments/patient/${patientId}`
    );
    return treatments;
  } catch (error) {
    throw new Error(`Error obteniendo tratamientos: ${error}`);
  }
};