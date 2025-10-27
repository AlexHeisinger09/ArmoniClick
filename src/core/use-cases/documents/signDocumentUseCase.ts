import { HttpAdapter } from '@/config/adapters/http/http.adapter';
import { Document } from './types';

export interface SignDocumentRequest {
  documentId: number;
  signatureData: string;
  sendEmail?: boolean;
  patientEmail?: string;
}

export async function signDocumentUseCase(
  httpAdapter: HttpAdapter,
  data: SignDocumentRequest
): Promise<Document> {
  try {
    const response = await httpAdapter.put<Document>(
      `/documents/${data.documentId}/sign`,
      {
        signature_data: data.signatureData,
        send_email: data.sendEmail,
        patient_email: data.patientEmail,
      }
    );
    return response;
  } catch (error) {
    console.error('Error signing document:', error);
    throw error;
  }
}
