import { HttpAdapter } from '@/config/adapters/http/http.adapter';

export async function deleteDocumentUseCase(httpAdapter: HttpAdapter, documentId: number): Promise<void> {
  try {
    await httpAdapter.delete(`/documents/${documentId}`);
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
}
