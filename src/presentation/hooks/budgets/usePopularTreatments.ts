import { useQuery } from '@tanstack/react-query';
import { apiFetcher } from '@/config/adapters/api.adapter';
import { getPopularTreatmentsUseCase, type PopularTreatment } from '@/core/use-cases/treatments/get-popular-treatments.use-case';

/**
 * Colores para el gráfico de pastel (tratamientos populares)
 */
const CHART_COLORS = [
  '#17c1e8', // clinic-500
  '#0891b2', // clinic-600
  '#0e7490', // clinic-700
  '#164e63', // clinic-900
];

export interface TreatmentChartData {
  name: string;
  value: number;
  color: string;
}

/**
 * Hook personalizado para obtener los 4 tratamientos más populares
 * Consulta la frecuencia de tratamientos por doctor
 * @returns Objeto con datos de tratamientos populares para gráfico
 */
export const usePopularTreatments = () => {
  const query = useQuery({
    queryKey: ['treatments', 'popular'],
    queryFn: async () => {
      try {
        console.log('🎯 usePopularTreatments: Llamando a getPopularTreatmentsUseCase');
        const treatments = await getPopularTreatmentsUseCase(apiFetcher);
        console.log('🎯 usePopularTreatments: Respuesta recibida:', treatments);
        return treatments;
      } catch (error) {
        console.error('❌ Error fetching popular treatments:', error);
        return [];
      }
    },
    staleTime: 15 * 60 * 1000, // 15 minutos
    retry: 1,
  });

  /**
   * Procesa los datos para el gráfico de pastel
   * Calcula porcentajes basados en la frecuencia total
   */
  const processChartData = (): TreatmentChartData[] => {
    const treatments = query.data || [];

    console.log('🎨 Datos recibidos en processChartData:', treatments);
    console.log('📊 IsLoading:', query.isLoading);
    console.log('⚠️ Error:', query.error);

    if (treatments.length === 0) {
      console.log('⚠️ No hay tratamientos, retornando array vacío');
      return [];
    }

    // Calcular total de tratamientos
    const totalTreatments = treatments.reduce(
      (sum, t) => sum + t.frecuencia,
      0
    );

    // Convertir a datos del gráfico con porcentajes
    return treatments.map((treatment, index) => ({
      name: treatment.nombre_servicio,
      value: Math.round((treatment.frecuencia / totalTreatments) * 100),
      color: CHART_COLORS[index % CHART_COLORS.length],
    }));
  };

  const treatmentsData = processChartData();
  const isEmpty = treatmentsData.length === 0;

  return {
    treatmentsData,
    isEmpty,
    rawData: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
  };
};
