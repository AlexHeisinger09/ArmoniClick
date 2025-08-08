// src/core/use-cases/user/upload-signature.use-case.ts
import { HttpAdapter } from "@/config/adapters/http/http.adapter";
import { MsgResponse } from "@/infrastructure/interfaces/api.responses";

export interface UploadSignatureResponse extends MsgResponse {
  signatureUrl: string;
  signatureInfo: {
    width: number;
    height: number;
    publicId: string;
  };
}

// Subir firma desde canvas (base64)
export const uploadSignatureUseCase = async (
  fetcher: HttpAdapter,
  signatureDataUrl: string
): Promise<UploadSignatureResponse> => {
  const response = await fetcher.post<UploadSignatureResponse>("/upload/signature", {
    signature: signatureDataUrl,
  });

  return response;
};

// Subir firma desde archivo
export const uploadSignatureFileUseCase = async (
  fetcher: HttpAdapter,
  imageFile: File
): Promise<UploadSignatureResponse> => {
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

  const response = await fetcher.post<UploadSignatureResponse>("/upload/signature", {
    signature: base64Image,
  });

  return response;
};

// Eliminar firma
export const deleteSignatureUseCase = async (
  fetcher: HttpAdapter
): Promise<MsgResponse> => {
  const response = await fetcher.delete<MsgResponse>("/upload/signature");
  return response;
};