// src/core/use-cases/user/upload-profile-image.use-case.ts
import { HttpAdapter } from "@/config/adapters/http/http.adapter";
import { MsgResponse } from "@/infrastructure/interfaces/api.responses";

export interface UploadImageResponse extends MsgResponse {
  imageUrl: string;
  imageInfo: {
    width: number;
    height: number;
    publicId: string;
  };
}

export const uploadProfileImageUseCase = async (
  fetcher: HttpAdapter,
  imageFile: File
): Promise<UploadImageResponse> => {
  // Convertir archivo a base64
  const base64Image = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo'));
    reader.readAsDataURL(imageFile);
  });

  // Extraer el tipo MIME
  const imageType = imageFile.type;

  const response = await fetcher.post<UploadImageResponse>("/upload", {
    image: base64Image,
    imageType: imageType,
  });

  return response;
};

export const deleteProfileImageUseCase = async (
  fetcher: HttpAdapter
): Promise<MsgResponse> => {
  const response = await fetcher.delete<MsgResponse>("/upload");
  return response;
};