import { useQuery } from '@tanstack/react-query';
import { apiFetcher } from '@/config/adapters/api.adapter';
import { getBudgetStatsUseCase } from '@/core/use-cases/budgets';
import { BUDGET_STATUS } from '@/core/use-cases/budgets/types';
import type { Budget } from '@/core/use-cases/budgets/types';

/**
 * Hook personalizado para calcular ingresos del mes actual
 * ✅ CAMBIO: Ahora suma treatments completados (no presupuestos completados)
 * Los tratamientos se completan uno a uno a medida que se realizan
 * Compara con el mes anterior para calcular el porcentaje de cambio
 * Los montos están en pesos chilenos (CLP)
 * @returns Objeto con datos de ingresos del mes y comparativa
 */
export const useMonthlyRevenue = () => {
  // Obtener estadísticas generales de presupuestos
  const { queryStats } = useBudgetStats();

  // ✅ CAMBIO: Obtener presupuestos con items que tienen treatments completados
  const queryAllBudgets = useQuery({
    queryKey: ['budgets', 'revenue', 'treatments-current-month'],
    queryFn: async () => {
      try {
        // Usar el nuevo endpoint que obtiene ingresos basados en treatments completados
        console.log('💰 useMonthlyRevenue: Llamando a /budgets/revenue-treatments');
        const response = await apiFetcher.get<{ budgets: Budget[] }>('/budgets/revenue-treatments');
        console.log('💰 useMonthlyRevenue: Respuesta recibida:', response);
        return response;
      } catch (error) {
        console.warn('❌ No se puede obtener ingresos por treatments completados', error);
        return { budgets: [] };
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
  });

  // Procesar datos de ingresos por mes
  const processMonthlyRevenue = () => {
    const budgets = queryAllBudgets.data?.budgets || [];
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    // ✅ CAMBIO: Procesar items con treatments completados (no presupuestos completos)
    let currentMonthTotal = 0;
    let previousMonthTotal = 0;
    let completedBudgetsCurrentMonth = 0;
    let completedBudgetsPreviousMonth = 0;

    budgets.forEach((budget) => {
      // Iterar sobre cada item que tiene un treatment completado
      budget.items?.forEach((item) => {
        // Validar que created_at exista
        if (!item.created_at) return;

        const itemDate = new Date(item.created_at); // Fecha del treatment completado

        // Validar que la fecha sea válida
        if (isNaN(itemDate.getTime())) return;

        const itemMonth = itemDate.getMonth();
        const itemYear = itemDate.getFullYear();

        // Parsear el valor del item (valor del treatment)
        const amount = typeof item.valor === 'string'
          ? parseFloat(item.valor)
          : item.valor;

        if (isNaN(amount)) return;

        // Categorizar por mes actual o anterior
        if (itemMonth === currentMonth && itemYear === currentYear) {
          currentMonthTotal += amount;
          completedBudgetsCurrentMonth++;
        } else if (itemMonth === previousMonth && itemYear === previousYear) {
          previousMonthTotal += amount;
          completedBudgetsPreviousMonth++;
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
      // Si el mes anterior no tenía ingresos pero este sí
      percentageChange = 100;
    }

    return {
      currentMonthTotal,
      previousMonthTotal,
      percentageChange,
      completedBudgetsCurrentMonth,
      completedBudgetsPreviousMonth,
    };
  };

  const monthlyRevenue = processMonthlyRevenue();

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
    queryStats,
    queryAllBudgets,
    currentMonthRevenue: monthlyRevenue.currentMonthTotal,
    currentMonthRevenueFormatted: formatRevenue(monthlyRevenue.currentMonthTotal),
    previousMonthRevenue: monthlyRevenue.previousMonthTotal,
    percentageChange: monthlyRevenue.percentageChange,
    completedBudgetsCurrentMonth: monthlyRevenue.completedBudgetsCurrentMonth,
    completedBudgetsPreviousMonth: monthlyRevenue.completedBudgetsPreviousMonth,
    isLoading: queryAllBudgets.isLoading || queryStats.isLoading,
    error: queryAllBudgets.error || queryStats.error,
  };
};

/**
 * Hook auxiliar para obtener estadísticas de presupuestos
 * @returns Estadísticas de presupuestos
 */
export const useBudgetStats = () => {
  const queryStats = useQuery({
    queryKey: ['budget', 'stats', 'monthly'],
    queryFn: () => getBudgetStatsUseCase(apiFetcher),
    staleTime: 10 * 60 * 1000, // 10 minutos
  });

  return {
    queryStats,
    stats: queryStats.data?.stats,
    isLoading: queryStats.isLoading,
    error: queryStats.error,
  };
};
