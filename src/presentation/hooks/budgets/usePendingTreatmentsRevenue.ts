import { useQuery } from '@tanstack/react-query';
import { apiFetcher } from '@/config/adapters/api.adapter';
import type { Budget } from '@/core/use-cases/budgets/types';

/**
 * Hook personalizado para calcular ingresos potenciales de tratamientos pendientes
 * Suma los valores de tratamientos con status !== 'completed'
 * Esto muestra cuánto dinero se podría ganar si se completan todos los tratamientos pendientes
 * Los montos están en pesos chilenos (CLP)
 * @returns Objeto con datos de ingresos pendientes
 */
export const usePendingTreatmentsRevenue = () => {
  // Obtener presupuestos con items que tienen treatments pendientes
  const queryAllBudgets = useQuery({
    queryKey: ['budgets', 'revenue', 'treatments-pending'],
    queryFn: async () => {
      try {
        // Usar el mismo endpoint que retorna todos los budgets con items
        console.log('⏳ usePendingTreatmentsRevenue: Llamando a /budgets/revenue-treatments');
        const response = await apiFetcher.get<{ budgets: Budget[] }>('/budgets/revenue-treatments');
        console.log('⏳ usePendingTreatmentsRevenue: Respuesta recibida:', response);
        return response;
      } catch (error) {
        console.warn('❌ No se puede obtener ingresos pendientes por treatments', error);
        return { budgets: [] };
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
  });

  // Procesar datos de ingresos potenciales por mes
  const processPendingRevenue = () => {
    const budgets = queryAllBudgets.data?.budgets || [];
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    // Procesar items para calcular dinero potencial (todos los items de presupuestos activos)
    let currentMonthTotal = 0;
    let previousMonthTotal = 0;
    let pendingTreatmentsCurrentMonth = 0;
    let pendingTreatmentsPreviousMonth = 0;

    budgets.forEach((budget) => {
      // Solo contar items de presupuestos activos (que podrían ser completados)
      if (budget.status !== 'activo') return;

      // Iterar sobre cada item del presupuesto activo
      budget.items?.forEach((item) => {
        // Validar que created_at exista
        if (!item.created_at) return;

        const itemDate = new Date(item.created_at);

        // Validar que la fecha sea válida
        if (isNaN(itemDate.getTime())) return;

        const itemMonth = itemDate.getMonth();
        const itemYear = itemDate.getFullYear();

        // Parsear el valor del item (valor del treatment potencial)
        const amount = typeof item.valor === 'string'
          ? parseFloat(item.valor)
          : item.valor;

        if (isNaN(amount)) return;

        // Categorizar por mes actual o anterior
        if (itemMonth === currentMonth && itemYear === currentYear) {
          currentMonthTotal += amount;
          pendingTreatmentsCurrentMonth++;
        } else if (itemMonth === previousMonth && itemYear === previousYear) {
          previousMonthTotal += amount;
          pendingTreatmentsPreviousMonth++;
        }
      });
    });

    // Calcular porcentaje de cambio
    let percentageChange = 0;
    if (previousMonthTotal > 0) {
      percentageChange = Math.round(
        ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100
      );
    } else if (currentMonthTotal > 0) {
      // Si el mes anterior no tenía dinero potencial pero este sí
      percentageChange = 100;
    }

    return {
      currentMonthTotal,
      previousMonthTotal,
      percentageChange,
      pendingTreatmentsCurrentMonth,
      pendingTreatmentsPreviousMonth,
    };
  };

  const pendingRevenue = processPendingRevenue();

  // Formatea el monto a pesos chilenos
  const formatRevenue = (amount: number): string => {
    return amount.toLocaleString('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  return {
    queryAllBudgets,
    currentMonthPendingRevenue: pendingRevenue.currentMonthTotal,
    currentMonthPendingRevenueFormatted: formatRevenue(pendingRevenue.currentMonthTotal),
    previousMonthPendingRevenue: pendingRevenue.previousMonthTotal,
    percentageChange: pendingRevenue.percentageChange,
    pendingTreatmentsCurrentMonth: pendingRevenue.pendingTreatmentsCurrentMonth,
    pendingTreatmentsPreviousMonth: pendingRevenue.pendingTreatmentsPreviousMonth,
    isLoading: queryAllBudgets.isLoading,
    error: queryAllBudgets.error,
  };
};
