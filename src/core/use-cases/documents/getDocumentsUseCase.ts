import { HttpAdapter } from '@/config/adapters/http/http.adapter';
import { Document } from './types';

export async function getDocumentsUseCase(httpAdapter: HttpAdapter, patientId: number): Promise<Document[]> {
  try {
    const response = await httpAdapter.get<Document[]>(`/documents/patient/${patientId}`);
    return response;
  } catch (error) {
    console.error('Error fetching documents:', error);
    throw error;
  }
}
