import { HttpAdapter } from '@/config/adapters/http/http.adapter';

export interface PopularTreatment {
  nombre_servicio: string;
  frecuencia: number;
}

export interface PopularTreatmentsResponse {
  success: boolean;
  data: PopularTreatment[];
}

export const getPopularTreatmentsUseCase = async (
  httpAdapter: HttpAdapter
): Promise<PopularTreatment[]> => {
  try {
    const response = await httpAdapter.get<PopularTreatmentsResponse>(
      '/treatments/popular'
    );

    if (!response.success || !response.data) {
      return [];
    }

    return response.data;
  } catch (error) {
    console.error('Error fetching popular treatments:', error);
    return [];
  }
};
