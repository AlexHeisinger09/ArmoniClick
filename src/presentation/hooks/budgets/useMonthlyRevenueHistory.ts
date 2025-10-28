import { useQuery } from '@tanstack/react-query';
import { apiFetcher } from '@/config/adapters/api.adapter';
import { BUDGET_STATUS } from '@/core/use-cases/budgets/types';
import type { Budget } from '@/core/use-cases/budgets/types';

interface MonthlyRevenueData {
  name: string; // Mes (Ene, Feb, etc)
  monthNumber: number; // 0-11
  year: number;
  ingresos: number; // Monto en CLP
}

/**
 * Hook personalizado para obtener historial de ingresos mensuales
 * Retorna datos de los últimos 12 meses para mostrar en gráfico animado
 * Los datos se calculan basándose en TREATMENTS completados (no budgets)
 * Los tratamientos se completan uno a uno a medida que se realizan
 * La fecha de completion del treatment se usa para agrupar ingresos por mes
 * @returns Objeto con datos de 12 meses listos para gráfico
 */
export const useMonthlyRevenueHistory = () => {
  const queryAllBudgets = useQuery({
    queryKey: ['budgets', 'revenue', 'treatments-completed'],
    queryFn: async () => {
      try {
        // ✅ CAMBIO: Usar nuevo endpoint que obtiene ingresos basados en treatments completados
        console.log('📊 useMonthlyRevenueHistory: Llamando a /budgets/revenue-treatments');
        const response = await apiFetcher.get<{ budgets: Budget[] }>('/budgets/revenue-treatments');
        console.log('📊 useMonthlyRevenueHistory: Respuesta recibida:', response);
        return response;
      } catch (error) {
        console.warn('❌ No se puede obtener ingresos por treatments completados', error);
        return { budgets: [] };
      }
    },
    staleTime: 15 * 60 * 1000, // 15 minutos
  });

  // Procesar datos de ingresos por mes (últimos 12 meses)
  const processMonthlyRevenue = () => {
    const budgets = queryAllBudgets.data?.budgets || [];

    // DEBUG: Log de los datos recibidos
    console.log('📊 useMonthlyRevenueHistory - Presupuestos con treatments completados recibidos:', {
      total: budgets.length,
      datos: budgets.slice(0, 3) // Mostrar primeros 3
    });

    // El endpoint /budgets/revenue-treatments ya retorna solo presupuestos con items que tienen treatments completados
    // No necesitamos filtrar nuevamente
    const completedBudgets = budgets;

    // Obtener fecha actual
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // ✅ CAMBIO: Crear array de 12 meses en ORDEN CRONOLÓGICO (Ene-Dic)
    // Comenzando hace 11 meses atrás hasta el mes actual
    const monthlyData: MonthlyRevenueData[] = [];

    for (let i = 11; i >= 0; i--) {
      let targetMonth = currentMonth - i;
      let targetYear = currentYear;

      // Ajustar año si el mes es negativo
      if (targetMonth < 0) {
        targetYear -= 1;
        targetMonth += 12;
      }

      monthlyData.push({
        name: getMonthNameShort(targetMonth),
        monthNumber: targetMonth,
        year: targetYear,
        ingresos: 0, // Será calculado
      });
    }

    // ✅ CAMBIO: Ordenar por mes numérico dentro del mismo año
    // Esto asegura que Ene (0) < Feb (1) < ... < Dic (11)
    monthlyData.sort((a, b) => {
      if (a.year !== b.year) {
        return a.year - b.year; // Primero por año
      }
      return a.monthNumber - b.monthNumber; // Luego por mes
    });

    console.log('📅 Meses inicializados (ordenados):', monthlyData);

    // ✅ CAMBIO: Procesar cada budget que contiene items con treatments completados
    // Los items ya tienen la fecha del treatment completado en su campo created_at
    // (el backend reemplaza created_at con la fecha de treatment.updated_at)
    completedBudgets.forEach((budget) => {
      // Procesar cada item del budget que tiene un treatment completado
      budget.items?.forEach((item) => {
        // Validar que item.created_at exista (contiene fecha del treatment completado)
        const dateStr = item.created_at;

        if (!dateStr) {
          console.warn('⚠️ Item sin fecha de treatment:', item);
          return;
        }

        const itemDate = new Date(dateStr);

        // Validar que la fecha sea válida
        if (isNaN(itemDate.getTime())) {
          console.warn('⚠️ Fecha inválida:', dateStr);
          return;
        }

        const itemMonth = itemDate.getMonth();
        const itemYear = itemDate.getFullYear();

        // Parsear el monto (valor del item = valor del treatment)
        const amountStr = item.valor;
        const amount = typeof amountStr === 'string'
          ? parseFloat(amountStr)
          : amountStr;

        // Validar que el monto sea válido
        if (isNaN(amount)) {
          console.warn('⚠️ Monto inválido:', amountStr);
          return;
        }

        console.log(`💰 Procesando treatment completado: ${itemMonth}/${itemYear} = $ ${amount}`);

        // Encontrar el mes correspondiente en el array
        const monthEntry = monthlyData.find(
          m => m.monthNumber === itemMonth && m.year === itemYear
        );

        if (monthEntry) {
          monthEntry.ingresos += amount;
          console.log(`✅ Actualizado ${monthEntry.name} ${itemYear}: $ ${monthEntry.ingresos}`);
        } else {
          console.warn(`⚠️ No se encontró mes para ${itemMonth}/${itemYear}`);
        }
      });
    });

    console.log('📊 Datos finales de ingresos:', monthlyData);
    return monthlyData;
  };

  // Obtener próximos 6 meses para mostrar en carrusel (default)
  const getNextSixMonths = () => {
    const data = processMonthlyRevenue();
    // Retornar los últimos 6 meses del array (que serían los más recientes)
    return data.slice(-6);
  };

  // ✅ CAMBIO: Obtener rango de 6 meses basado en índice de semestre
  // semesterIndex: 0 = Ene-Jun, 1 = Jul-Dic
  // Filtrar por rango de meses específicos, no por índice de array
  const getSemesterData = (semesterIndex: number) => {
    const data = processMonthlyRevenue();

    let filtered;
    if (semesterIndex === 0) {
      // Enero (0) a Junio (5)
      filtered = data.filter(m => m.monthNumber >= 0 && m.monthNumber <= 5);
    } else {
      // Julio (6) a Diciembre (11)
      filtered = data.filter(m => m.monthNumber >= 6 && m.monthNumber <= 11);
    }

    // ✅ IMPORTANTE: Ordenar los resultados filtrados por mes
    return filtered.sort((a, b) => a.monthNumber - b.monthNumber);
  };

  const allMonthlyData = processMonthlyRevenue();
  const defaultSemesterData = getNextSixMonths();

  return {
    queryAllBudgets,
    // Datos completos de 12 meses
    allMonthlyData,
    // Datos por defecto (últimos 6 meses)
    currentSemesterData: defaultSemesterData,
    // Función para obtener datos de un semestre específico
    getSemesterData,
    // Total de ingresos en los últimos 12 meses
    totalAnnualRevenue: allMonthlyData.reduce((sum, m) => sum + m.ingresos, 0),
    // Total del semestre actual
    currentSemesterTotal: defaultSemesterData.reduce((sum, m) => sum + m.ingresos, 0),
    isLoading: queryAllBudgets.isLoading,
    error: queryAllBudgets.error,
  };
};

/**
 * Helper para obtener nombre corto del mes en español
 */
function getMonthNameShort(monthIndex: number): string {
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return months[monthIndex] || 'Mes';
}
