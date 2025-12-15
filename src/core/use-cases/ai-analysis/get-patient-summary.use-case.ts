import { HttpAdapter } from "@/config/adapters/http/http.adapter";

export interface PatientSummary {
  clinicalAlerts: string;
  currentTreatment: string;
  serviceHistory: string;
  fullSummary: string;
}

export interface GetPatientSummaryResponse {
  patientId: number;
  patientName: string;
  summary: PatientSummary;
  generatedAt: string;
}

export const getPatientSummaryUseCase = async (
  fetcher: HttpAdapter,
  patientId: number
): Promise<GetPatientSummaryResponse> => {
  const response = await fetcher.post<GetPatientSummaryResponse>(
    `/ai-analysis/${patientId}/summary`,
    {}
  );
  return response;
};
