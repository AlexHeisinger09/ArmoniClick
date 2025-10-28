import { useQuery } from '@tanstack/react-query';
import { apiFetcher } from '@/config/adapters/api.adapter';
import { getAppointmentsUseCase } from '@/core/use-cases/appointments/get-appointments.use-case';
import { AppointmentResponse } from '@/infrastructure/interfaces/appointment.response';

/**
 * Hook personalizado para obtener las citas de esta semana
 * Calcula automáticamente las fechas de inicio y fin de la semana actual
 * @returns Objeto con queryWeeklyAppointments y datos procesados
 */
export const useWeeklyAppointments = () => {
  // Calcular fechas de esta semana (lunes a domingo)
  const getWeekDates = () => {
    const today = new Date();
    // Obtener el lunes de esta semana
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Ajustar cuando es domingo

    const monday = new Date(today.setDate(diff));
    const sunday = new Date(monday);
    sunday.setDate(sunday.getDate() + 6);

    // Formatear a ISO (YYYY-MM-DD)
    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    return {
      startDate: formatDate(monday),
      endDate: formatDate(sunday)
    };
  };

  const { startDate, endDate } = getWeekDates();

  const queryWeeklyAppointments = useQuery({
    queryKey: ['appointments', 'weekly', startDate, endDate],
    queryFn: () => getAppointmentsUseCase(apiFetcher, { startDate, endDate }),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });

  // Contar citas por estado
  const appointmentsByStatus = {
    confirmed: (queryWeeklyAppointments.data || []).filter(
      (apt) => apt.status === 'confirmed'
    ).length,
    pending: (queryWeeklyAppointments.data || []).filter(
      (apt) => apt.status === 'pending'
    ).length,
    completed: (queryWeeklyAppointments.data || []).filter(
      (apt) => apt.status === 'completed'
    ).length,
    cancelled: (queryWeeklyAppointments.data || []).filter(
      (apt) => apt.status === 'cancelled'
    ).length,
  };

  return {
    queryWeeklyAppointments,
    weeklyAppointments: (queryWeeklyAppointments.data || []) as AppointmentResponse[],
    weeklyAppointmentsCount: queryWeeklyAppointments.data?.length || 0,
    appointmentsByStatus,
    isLoading: queryWeeklyAppointments.isLoading,
    error: queryWeeklyAppointments.error,
  };
};
