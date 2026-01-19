import { HttpAdapter } from '@/config/adapters/http/http.adapter';
import { Document } from './types';

export interface UpdateDocumentRequest {
  documentId: number;
  content: string;
  title?: string;
}

export const updateDocumentUseCase = async (
  fetcher: HttpAdapter,
  data: UpdateDocumentRequest
): Promise<Document> => {
  try {
    const response = await fetcher.put<Document>(
      `/documents/${data.documentId}`,
      {
        content: data.content,
        title: data.title,
      }
    );

    return response;
  } catch (error) {
    console.error('Error updating document:', error);
    throw error;
  }
};
