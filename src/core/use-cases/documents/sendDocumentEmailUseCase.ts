import { HttpAdapter } from '@/config/adapters/http/http.adapter';
import { Document } from './types';

export interface SendDocumentEmailRequest {
  documentId: number;
  patientEmail: string;
}

export async function sendDocumentEmailUseCase(
  httpAdapter: HttpAdapter,
  data: SendDocumentEmailRequest
): Promise<Document> {
  try {
    const response = await httpAdapter.put<Document>(
      `/documents/${data.documentId}/send-email`,
      {
        patient_email: data.patientEmail,
      }
    );
    return response;
  } catch (error) {
    console.error('Error sending document email:', error);
    throw error;
  }
}
