import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useDocuments = () => {
  const queryClient = useQueryClient();

  // Query para obtener todos los documentos
  const queryDocuments = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      // Implementar llamada a la API
      const response = await fetch('/api/documents');
      return response.json();
    }
  });

  // Mutation para crear documento
  const createDocumentMutation = useMutation({
    mutationFn: async (documentData: any) => {
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(documentData),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });

  // Mutation para firmar documento
  const signDocumentMutation = useMutation({
    mutationFn: async ({ documentId, signatureData }: { documentId: number; signatureData: string }) => {
      const response = await fetch(`/api/documents/${documentId}/sign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ signature_data: signatureData }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });

  return {
    queryDocuments,
    createDocumentMutation,
    signDocumentMutation,
    isLoadingCreate: createDocumentMutation.isPending,
    isLoadingSign: signDocumentMutation.isPending,
  };
};