import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiFetcher } from '@/config/adapters/api.adapter';
import {
  getPatientSummaryUseCase,
  askPatientQuestionUseCase,
  type GetPatientSummaryResponse,
  type AskPatientQuestionResponse,
} from '@/core/use-cases/ai-analysis';

// Hook para generar resumen clínico del paciente
export const usePatientSummary = () => {
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  const generateSummaryMutation = useMutation({
    mutationFn: (patientId: number) => {
      return getPatientSummaryUseCase(apiFetcher, patientId);
    },
    onMutate: () => {
      setIsLoadingSummary(true);
    },
    onSuccess: () => {
      setIsLoadingSummary(false);
    },
    onError: () => {
      setIsLoadingSummary(false);
    },
  });

  return {
    generateSummaryMutation,
    isLoadingSummary,
  };
};

// Hook para hacer preguntas sobre el paciente
export const useAskPatientQuestion = () => {
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);

  const askQuestionMutation = useMutation({
    mutationFn: ({ patientId, question }: { patientId: number; question: string }) => {
      return askPatientQuestionUseCase(apiFetcher, patientId, question);
    },
    onMutate: () => {
      setIsLoadingQuestion(true);
    },
    onSuccess: () => {
      setIsLoadingQuestion(false);
    },
    onError: () => {
      setIsLoadingQuestion(false);
    },
  });

  return {
    askQuestionMutation,
    isLoadingQuestion,
  };
};
