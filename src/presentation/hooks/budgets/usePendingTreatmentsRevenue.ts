import { useQuery } from '@tanstack/react-query';
import { apiFetcher } from '@/config/adapters/api.adapter';

/**
 * Hook personalizado para obtener dinero pendiente (treatments no completados)
 * Suma TODOS los valores de tratamientos que NO están completados, sin filtrar por mes
 * Esto muestra cuánto dinero potencial se podría ganar en el futuro si se completan todos los tratamientos
 * Los montos están en pesos chilenos (CLP)
 * @returns Objeto con datos de dinero pendiente
 */
export const usePendingTreatmentsRevenue = () => {
  // Obtener dinero pendiente total
  const queryPendingRevenue = useQuery({
    queryKey: ['budgets', 'revenue', 'pending'],
    queryFn: async () => {
      try {
        console.log('💵 usePendingTreatmentsRevenue: Llamando a /budgets/pending-revenue');
        const response = await apiFetcher.get<{ pendingRevenue: number; formatted: string }>('/budgets/pending-revenue');
        console.log('💵 usePendingTreatmentsRevenue: Respuesta recibida:', response);
        return response;
      } catch (error) {
        console.warn('❌ No se puede obtener dinero pendiente', error);
        return { pendingRevenue: 0, formatted: '$0' };
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
  });

  // Formatea el monto a pesos chilenos
  const formatRevenue = (amount: number): string => {
    return amount.toLocaleString('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const pendingTotal = queryPendingRevenue.data?.pendingRevenue || 0;
  const formattedPending = queryPendingRevenue.data?.formatted || formatRevenue(0);

  return {
    queryPendingRevenue,
    pendingRevenue: pendingTotal,
    pendingRevenueFormatted: formattedPending,
    isLoading: queryPendingRevenue.isLoading,
    error: queryPendingRevenue.error,
  };
};
