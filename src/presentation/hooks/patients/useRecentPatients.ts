import { useQuery } from '@tanstack/react-query';
import { apiFetcher } from '@/config/adapters/api.adapter';
import { getPatientsUseCase } from '@/core/use-cases/patients';
import type { Patient } from '@/core/use-cases/patients/get-patients.use-case';

interface RecentPatientData {
  id: number;
  name: string;
  initials: string;
  registrationDate: Date;
  isRecent: boolean; // True si fue registrado en los últimos 30 días
}

/**
 * Hook personalizado para obtener los últimos 3 pacientes registrados
 * Retorna pacientes ordenados por fecha de registro más reciente
 * @returns Objeto con últimos 3 pacientes y datos formateados
 */
export const useRecentPatients = () => {
  const queryAllPatients = useQuery({
    queryKey: ['patients', 'recent'],
    queryFn: () => getPatientsUseCase(apiFetcher),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });

  // Procesar pacientes recientes
  const processRecentPatients = () => {
    const patients = queryAllPatients.data?.patients || [];

    // Ordenar por fecha de creación (más recientes primero)
    const sorted = [...patients].sort((a, b) => {
      const dateA = new Date(a.createdat).getTime();
      const dateB = new Date(b.createdat).getTime();
      return dateB - dateA; // Descendente (más recientes primero)
    });

    // Tomar solo los 3 primeros
    const recent = sorted.slice(0, 3);

    // Obtener fecha actual para cálculo de "reciente"
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Formatear datos
    const formatted: RecentPatientData[] = recent.map((patient) => ({
      id: patient.id,
      name: `${patient.nombres} ${patient.apellidos}`,
      initials: getInitials(patient.nombres, patient.apellidos),
      registrationDate: new Date(patient.createdat),
      isRecent: new Date(patient.createdat) > thirtyDaysAgo,
    }));

    return formatted;
  };

  const recentPatients = processRecentPatients();

  return {
    queryAllPatients,
    recentPatients,
    recentPatientsCount: recentPatients.length,
    isLoading: queryAllPatients.isLoading,
    error: queryAllPatients.error,
  };
};

/**
 * Helper para obtener iniciales del nombre
 */
function getInitials(nombres: string, apellidos: string): string {
  const nameInitial = nombres?.charAt(0)?.toUpperCase() || '';
  const lastNameInitial = apellidos?.charAt(0)?.toUpperCase() || '';
  return (nameInitial + lastNameInitial).slice(0, 2) || 'PA';
}
