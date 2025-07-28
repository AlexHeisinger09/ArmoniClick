import { HttpAdapter } from "@/config/adapters/http/http.adapter";
import { CreateTreatmentData, CreateTreatmentResponse } from "./types";

export const createTreatmentUseCase = async (
  fetcher: HttpAdapter,
  patientId: number,
  treatmentData: CreateTreatmentData
): Promise<CreateTreatmentResponse> => {
  try {
    const treatment = await fetcher.post<CreateTreatmentResponse>(
      `/treatments/patient/${patientId}`,
      treatmentData
    );
    return treatment;
  } catch (error) {
    throw new Error(`Error creando tratamiento: ${error}`);
  }
};