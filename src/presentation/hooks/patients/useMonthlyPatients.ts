import { useQuery } from '@tanstack/react-query';
import { apiFetcher } from '@/config/adapters/api.adapter';
import { getPatientsUseCase } from '@/core/use-cases/patients';
import type { Patient } from '@/core/use-cases/patients/get-patients.use-case';

/**
 * Hook personalizado para obtener pacientes registrados en el mes actual
 * Filtra automáticamente los pacientes creados en el mes actual
 * También compara con el mes anterior para calcular el porcentaje de cambio
 * @returns Objeto con datos de pacientes del mes actual y comparativa
 */
export const useMonthlyPatients = () => {
  const queryAllPatients = useQuery({
    queryKey: ['patients', 'monthly'],
    queryFn: () => getPatientsUseCase(apiFetcher),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });

  // Procesar datos de pacientes por mes
  const processMonthlyData = () => {
    const patients = queryAllPatients.data?.patients || [];
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    // Filtrar pacientes del mes actual
    const currentMonthPatients = patients.filter((patient) => {
      const createdDate = new Date(patient.createdat);
      return (
        createdDate.getMonth() === currentMonth &&
        createdDate.getFullYear() === currentYear
      );
    });

    // Filtrar pacientes del mes anterior
    const previousMonthPatients = patients.filter((patient) => {
      const createdDate = new Date(patient.createdat);
      return (
        createdDate.getMonth() === previousMonth &&
        createdDate.getFullYear() === previousYear
      );
    });

    // Calcular porcentaje de cambio
    const currentCount = currentMonthPatients.length;
    const previousCount = previousMonthPatients.length;
    let percentageChange = 0;

    if (previousCount > 0) {
      percentageChange = Math.round(
        ((currentCount - previousCount) / previousCount) * 100
      );
    } else if (currentCount > 0) {
      // Si el mes anterior no tenía pacientes pero este sí, es un incremento del 100%
      percentageChange = 100;
    }

    return {
      currentMonthCount: currentCount,
      previousMonthCount: previousCount,
      percentageChange,
      currentMonthPatients: currentMonthPatients as Patient[],
      previousMonthPatients: previousMonthPatients as Patient[],
    };
  };

  const monthlyData = processMonthlyData();

  return {
    queryAllPatients,
    monthlyPatients: monthlyData.currentMonthPatients,
    monthlyPatientsCount: monthlyData.currentMonthCount,
    percentageChange: monthlyData.percentageChange,
    previousMonthCount: monthlyData.previousMonthCount,
    isLoading: queryAllPatients.isLoading,
    error: queryAllPatients.error,
  };
};
