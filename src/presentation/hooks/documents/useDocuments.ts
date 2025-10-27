import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetcher } from '@/config/adapters/api.adapter';
import { getDocumentsUseCase } from '@/core/use-cases/documents/getDocumentsUseCase';
import { getAllDocumentsUseCase } from '@/core/use-cases/documents/getAllDocumentsUseCase';
import { createDocumentUseCase, CreateDocumentRequest } from '@/core/use-cases/documents/createDocumentUseCase';
import { signDocumentUseCase, SignDocumentRequest } from '@/core/use-cases/documents/signDocumentUseCase';
import { sendDocumentEmailUseCase, SendDocumentEmailRequest } from '@/core/use-cases/documents/sendDocumentEmailUseCase';
import { deleteDocumentUseCase } from '@/core/use-cases/documents/deleteDocumentUseCase';
import { getPatientsUseCase } from '@/core/use-cases/documents/getPatientsUseCase';
import { Document } from '@/core/use-cases/documents/types';

export const useDocuments = (patientId?: number) => {
  const queryClient = useQueryClient();

  // Query para obtener documentos - filtra según si hay patientId o no
  const queryDocuments = useQuery({
    queryKey: patientId ? ['documents', patientId] : ['documents', 'all'],
    queryFn: async () => {
      if (patientId) {
        // Si hay un patientId, obtener solo documentos de ese paciente
        return getDocumentsUseCase(apiFetcher, patientId);
      } else {
        // Si no hay patientId, obtener todos los documentos del doctor
        return getAllDocumentsUseCase(apiFetcher);
      }
    },
    enabled: true, // Siempre habilitado para cargar todos los documentos por defecto
  });

  // Query para obtener lista de pacientes
  const queryPatients = useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      return getPatientsUseCase(apiFetcher);
    },
  });

  // Mutation para crear documento
  const createDocumentMutation = useMutation({
    mutationFn: async (data: CreateDocumentRequest) => {
      return createDocumentUseCase(apiFetcher, data);
    },
    onSuccess: () => {
      if (patientId) {
        queryClient.invalidateQueries({ queryKey: ['documents', patientId] });
      }
    },
  });

  // Mutation para firmar documento
  const signDocumentMutation = useMutation({
    mutationFn: async (data: SignDocumentRequest) => {
      return signDocumentUseCase(apiFetcher, data);
    },
    onSuccess: () => {
      if (patientId) {
        queryClient.invalidateQueries({ queryKey: ['documents', patientId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['documents', 'all'] });
      }
    },
  });

  // Mutation para enviar documento por email
  const sendDocumentEmailMutation = useMutation({
    mutationFn: async (data: SendDocumentEmailRequest) => {
      return sendDocumentEmailUseCase(apiFetcher, data);
    },
    onSuccess: () => {
      if (patientId) {
        queryClient.invalidateQueries({ queryKey: ['documents', patientId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['documents', 'all'] });
      }
    },
  });

  // Mutation para eliminar documento
  const deleteDocumentMutation = useMutation({
    mutationFn: async (documentId: number) => {
      return deleteDocumentUseCase(apiFetcher, documentId);
    },
    onSuccess: () => {
      if (patientId) {
        queryClient.invalidateQueries({ queryKey: ['documents', patientId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['documents', 'all'] });
      }
    },
  });

  return {
    // Queries
    queryDocuments,
    queryPatients,

    // Mutations
    createDocumentMutation,
    signDocumentMutation,
    sendDocumentEmailMutation,
    deleteDocumentMutation,

    // Loading states
    isLoadingCreate: createDocumentMutation.isPending,
    isLoadingSign: signDocumentMutation.isPending,
    isLoadingSendEmail: sendDocumentEmailMutation.isPending,
    isLoadingDelete: deleteDocumentMutation.isPending,
    isLoadingDocuments: queryDocuments.isLoading,
    isLoadingPatients: queryPatients.isLoading,

    // Error states
    errorCreate: createDocumentMutation.error,
    errorSign: signDocumentMutation.error,
    errorSendEmail: sendDocumentEmailMutation.error,
    errorDelete: deleteDocumentMutation.error,
    errorDocuments: queryDocuments.error,
    errorPatients: queryPatients.error,
  };
};