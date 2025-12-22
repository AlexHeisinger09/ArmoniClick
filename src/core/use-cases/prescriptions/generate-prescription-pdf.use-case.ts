// src/core/use-cases/prescriptions/generate-prescription-pdf.use-case.ts
import { HttpAdapter } from "@/config/adapters/http/http.adapter";

export interface GeneratePrescriptionPDFResponse {
  message: string;
  pdfUrl: string;
}

export const generatePrescriptionPDFUseCase = async (
  fetcher: HttpAdapter,
  prescriptionId: number,
  pdfBase64: string
): Promise<GeneratePrescriptionPDFResponse> => {
  try {
    const url = `/prescriptions/generate-pdf/${prescriptionId}`;
    console.log('🔍 Frontend: Uploading PDF to Cloudinary via:', url);

    const response = await fetcher.post<GeneratePrescriptionPDFResponse>(
      url,
      { pdfBase64 }
    );

    console.log('✅ Frontend: PDF uploaded, URL:', response.pdfUrl);
    return response;
  } catch (error) {
    console.error('Error in generatePrescriptionPDFUseCase:', error);
    throw error;
  }
};
