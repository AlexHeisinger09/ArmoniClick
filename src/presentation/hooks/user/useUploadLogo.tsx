// src/presentation/hooks/user/useUploadLogo.tsx
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetcher } from "@/config/adapters/api.adapter";
import {
  uploadLogoUseCase,
  deleteLogoUseCase
} from "@/core/use-cases/user/upload-logo.use-case";

export const useUploadLogo = () => {
  const [isLoadingUpload, setIsLoadingUpload] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const queryClient = useQueryClient();

  const uploadLogoMutation = useMutation({
    mutationFn: (logoFile: File) => {
      return uploadLogoUseCase(apiFetcher, logoFile);
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
    onSuccess: (data) => {
      setIsLoadingUpload(false);
      setUploadProgress(100);

      console.log('✅ Logo subido exitosamente:', data);

      // Invalidar el cache del perfil para refrescar el logo
      queryClient.invalidateQueries({ queryKey: ["profile"] });

      // También forzar un refetch inmediato
      queryClient.refetchQueries({ queryKey: ["profile"] });

      // Resetear progreso después de un momento
      setTimeout(() => setUploadProgress(0), 1000);
    },
    onError: () => {
      setIsLoadingUpload(false);
      setUploadProgress(0);
    },
  });

  const deleteLogoMutation = useMutation({
    mutationFn: () => {
      return deleteLogoUseCase(apiFetcher);
    },
    onSuccess: () => {
      // Invalidar el cache del perfil para refrescar
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  return {
    uploadLogoMutation,
    deleteLogoMutation,
    isLoadingUpload,
    uploadProgress,
  };
};
