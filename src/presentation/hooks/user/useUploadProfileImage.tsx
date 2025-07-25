// src/presentation/hooks/user/useUploadProfileImage.tsx
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetcher } from "@/config/adapters/api.adapter";
import { 
  uploadProfileImageUseCase, 
  deleteProfileImageUseCase 
} from "@/core/use-cases/user/upload-profile-image.use-case";

export const useUploadProfileImage = () => {
  const [isLoadingUpload, setIsLoadingUpload] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const queryClient = useQueryClient();

  const uploadImageMutation = useMutation({
    mutationFn: (imageFile: File) => {
      return uploadProfileImageUseCase(apiFetcher, imageFile);
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
      
      // Invalidar el cache del perfil para refrescar la imagen
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      
      // Resetear progreso después de un momento
      setTimeout(() => setUploadProgress(0), 1000);
    },
    onError: () => {
      setIsLoadingUpload(false);
      setUploadProgress(0);
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: () => {
      return deleteProfileImageUseCase(apiFetcher);
    },
    onSuccess: () => {
      // Invalidar el cache del perfil para refrescar
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  return {
    uploadImageMutation,
    deleteImageMutation,
    isLoadingUpload,
    uploadProgress,
  };
};