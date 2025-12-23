// src/core/use-cases/user/upload-logo.use-case.ts
import { HttpAdapter } from "@/config/adapters/http/http.adapter";
import { MsgResponse } from "@/infrastructure/interfaces/api.responses";

export interface UploadLogoResponse extends MsgResponse {
  logoUrl: string;
  logoInfo: {
    width: number;
    height: number;
    publicId: string;
  };
}

export const uploadLogoUseCase = async (
  fetcher: HttpAdapter,
  logoFile: File
): Promise<UploadLogoResponse> => {
  // Convertir archivo a base64
  const base64Logo = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo'));
    reader.readAsDataURL(logoFile);
  });

  // Extraer el tipo MIME
  const logoType = logoFile.type;

  const response = await fetcher.post<UploadLogoResponse>("/upload-logo", {
    logo: base64Logo,
    logoType: logoType,
  });

  return response;
};

export const deleteLogoUseCase = async (
  fetcher: HttpAdapter
): Promise<MsgResponse> => {
  const response = await fetcher.delete<MsgResponse>("/upload-logo");
  return response;
};
