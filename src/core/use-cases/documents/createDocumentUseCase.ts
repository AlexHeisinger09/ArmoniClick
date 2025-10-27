import { HttpAdapter } from '@/config/adapters/http/http.adapter';
import { Document } from './types';

export interface CreateDocumentRequest {
  id_patient: number;
  document_type: string;
  title: string;
  content: string;
  patient_name: string;
  patient_rut: string;
}

export async function createDocumentUseCase(
  httpAdapter: HttpAdapter,
  data: CreateDocumentRequest
): Promise<Document> {
  try {
    const response = await httpAdapter.post<Document>('/documents', data);
    return response;
  } catch (error) {
    console.error('Error creating document:', error);
    throw error;
  }
}
