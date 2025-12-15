import { HttpAdapter } from "@/config/adapters/http/http.adapter";

export interface AskPatientQuestionRequest {
  question: string;
}

export interface AskPatientQuestionResponse {
  question: string;
  answer: string;
  answeredAt: string;
}

export const askPatientQuestionUseCase = async (
  fetcher: HttpAdapter,
  patientId: number,
  question: string
): Promise<AskPatientQuestionResponse> => {
  const response = await fetcher.post<AskPatientQuestionResponse>(
    `/ai-analysis/${patientId}/question`,
    { question }
  );
  return response;
};
