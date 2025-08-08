// src/presentation/hooks/user/useUploadSignature.tsx
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetcher } from "@/config/adapters/api.adapter";
import { 
  uploadSignatureUseCase, 
  uploadSignatureFileUseCase,
  deleteSignatureUseCase 
} from "@/core/use-cases/user/upload-signature.use-case";

export const useUploadSignature = () => {
  const [isLoadingUpload, setIsLoadingUpload] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const queryClient = useQueryClient();

  // Subir firma desde canvas (base64)
  const uploadSignatureMutation = useMutation({
    mutationFn: (signatureDataUrl: string) => {
      return uploadSignatureUseCase(apiFetcher, signatureDataUrl);
    },
    onMutate: () => {
      setIsLoadingUpload(true);
      setUploadProgress(0);
      
      // Simular progreso de upload
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);
    },
    onSuccess: () => {
      setIsLoadingUpload(false);
      setUploadProgress(100);
      
      // Invalidar el cache del perfil para refrescar la firma
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      
      // Resetear progreso después de un momento
      setTimeout(() => setUploadProgress(0), 1000);
    },
    onError: () => {
      setIsLoadingUpload(false);
      setUploadProgress(0);
    },
  });

  // Subir firma desde archivo
  const uploadSignatureFileMutation = useMutation({
    mutationFn: (imageFile: File) => {
      return uploadSignatureFileUseCase(apiFetcher, imageFile);
    },
    onMutate: () => {
      setIsLoadingUpload(true);
      setUploadProgress(0);
      
      // Simular progreso de upload
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);
    },
    onSuccess: () => {
      setIsLoadingUpload(false);
      setUploadProgress(100);
      
      // Invalidar el cache del perfil para refrescar la firma
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      
      // Resetear progreso después de un momento
      setTimeout(() => setUploadProgress(0), 1000);
    },
    onError: () => {
      setIsLoadingUpload(false);
      setUploadProgress(0);
    },
  });

  // Eliminar firma
  const deleteSignatureMutation = useMutation({
    mutationFn: () => {
      return deleteSignatureUseCase(apiFetcher);
    },
    onSuccess: () => {
      // Invalidar el cache del perfil para refrescar
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  return {
    uploadSignatureMutation,
    uploadSignatureFileMutation,
    deleteSignatureMutation,
    isLoadingUpload,
    uploadProgress,
  };
};