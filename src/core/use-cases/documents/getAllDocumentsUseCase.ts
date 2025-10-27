import { HttpAdapter } from '@/config/adapters/http/http.adapter';
import { Document } from './types';

export async function getAllDocumentsUseCase(httpAdapter: HttpAdapter): Promise<Document[]> {
  try {
    const response = await httpAdapter.get<Document[]>(`/documents`);
    return response;
  } catch (error) {
    console.error('Error fetching all documents:', error);
    throw error;
  }
}
