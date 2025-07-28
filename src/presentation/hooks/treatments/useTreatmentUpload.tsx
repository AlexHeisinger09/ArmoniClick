// src/presentation/hooks/treatments/useTreatmentUpload.tsx
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiFetcher } from "@/config/adapters/api.adapter";

export interface TreatmentUploadResponse {
  message: string;
  imageUrl: string;
  imageInfo: {
    width: number;
    height: number;
    publicId: string;
  };
}

export interface TreatmentUploadData {
  image: string; // Base64 string
  treatmentId: number;
  imageType: 'before' | 'after';
}

export interface DeleteTreatmentImageData {
  imageUrl: string;
}

const uploadTreatmentImageUseCase = async (
  fetcher: typeof apiFetcher,
  uploadData: TreatmentUploadData
): Promise<TreatmentUploadResponse> => {
  const response = await fetcher.post<TreatmentUploadResponse>("/treatment-upload", {
    image: uploadData.image,
    treatmentId: uploadData.treatmentId.toString(),
    imageType: uploadData.imageType,
  });
  return response;
};

const deleteTreatmentImageUseCase = async (
  fetcher: typeof apiFetcher,
  deleteData: DeleteTreatmentImageData
): Promise<{ message: string }> => {
  const response = await fetcher.delete<{ message: string }>("/treatment-upload", {
    params: { imageUrl: deleteData.imageUrl },
  });
  return response;
};

export const useTreatmentUpload = () => {
  const [isLoadingUpload, setIsLoadingUpload] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadImageMutation = useMutation({
    mutationFn: (uploadData: TreatmentUploadData) => {
      return uploadTreatmentImageUseCase(apiFetcher, uploadData);
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
      
      // Resetear progreso después de un momento
      setTimeout(() => setUploadProgress(0), 1000);
    },
    onError: () => {
      setIsLoadingUpload(false);
      setUploadProgress(0);
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: (deleteData: DeleteTreatmentImageData) => {
      return deleteTreatmentImageUseCase(apiFetcher, deleteData);
    },
  });

  /**
   * Convierte un archivo a base64
   */
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = () => reject(new Error('Error al leer el archivo'));
      reader.readAsDataURL(file);
    });
  };

  /**
   * Valida un archivo de imagen
   */
  const validateImageFile = (file: File): string | null => {
    // Validar tipo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return 'Solo se permiten archivos JPG, PNG y WebP';
    }

    // Validar tamaño (10MB máximo)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return 'El archivo debe ser menor a 10MB';
    }

    return null;
  };

  /**
   * Sube una imagen desde un archivo
   */
  const uploadImageFromFile = async (
    file: File, 
    treatmentId: number, 
    imageType: 'before' | 'after'
  ): Promise<TreatmentUploadResponse> => {
    // Validar archivo
    const validationError = validateImageFile(file);
    if (validationError) {
      throw new Error(validationError);
    }

    // Convertir a base64
    const base64Image = await fileToBase64(file);

    // Subir imagen
    return uploadImageMutation.mutateAsync({
      image: base64Image,
      treatmentId,
      imageType,
    });
  };

  return {
    uploadImageMutation,
    deleteImageMutation,
    isLoadingUpload,
    uploadProgress,
    fileToBase64,
    validateImageFile,
    uploadImageFromFile,
  };
};