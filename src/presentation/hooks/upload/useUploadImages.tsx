// src/presentation/hooks/upload/useUploadImages.tsx
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiFetcher } from '@/config/adapters/api.adapter';

interface UploadImageResponse {
  imageUrl: string;
  imageInfo: {
    width: number;
    height: number;
    publicId: string;
  };
}

interface UploadImageData {
  image: string; // base64 string
  imageType?: string;
}

const uploadImageUseCase = async (
  fetcher: any,
  imageData: UploadImageData
): Promise<UploadImageResponse> => {
  const response = await fetcher.post('/upload', imageData);
  return response.data;
};

export const useUploadImages = () => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadImageMutation = useMutation({
    mutationFn: (imageData: UploadImageData) => {
      return uploadImageUseCase(apiFetcher, imageData);
    },
    onMutate: () => {
      setIsUploading(true);
    },
    onSuccess: () => {
      setIsUploading(false);
    },
    onError: () => {
      setIsUploading(false);
    },
  });

  const uploadImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (file.size > 5 * 1024 * 1024) {
        reject(new Error('La imagen es demasiado grande. Máximo 5MB.'));
        return;
      }

      if (!file.type.startsWith('image/')) {
        reject(new Error('Por favor, selecciona una imagen válida.'));
        return;
      }

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const result = event.target?.result as string;
          const response = await uploadImageMutation.mutateAsync({
            image: result,
            imageType: file.type
          });
          resolve(response.imageUrl);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Error al leer el archivo'));
      reader.readAsDataURL(file);
    });
  };

  return {
    uploadImage,
    isUploading,
    uploadImageMutation,
  };
};