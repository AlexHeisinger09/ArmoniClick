import { useQuery } from '@tanstack/react-query';
import { apiFetcher } from '@/config/adapters/api.adapter';
import { getAppointmentsUseCase } from '@/core/use-cases/appointments/get-appointments.use-case';
import { AppointmentResponse } from '@/infrastructure/interfaces/appointment.response';

/**
 * Hook personalizado para obtener las próximas 4 citas más cercanas
 * Obtiene citas desde hoy en adelante y retorna las 4 más próximas
 * @returns Objeto con las próximas citas ordenadas por fecha
 */
export const useTodayAndUpcomingAppointments = () => {
  const queryUpcomingAppointments = useQuery({
    queryKey: ['appointments', 'upcoming'],
    queryFn: async () => {
      // Obtener citas con flag upcoming=true para filtrar desde hoy
      const allAppointments = await getAppointmentsUseCase(apiFetcher, {
        upcoming: true
      });

      // Ordenar por fecha más cercana
      const sorted = (allAppointments || []).sort((a, b) => {
        const dateA = new Date(a.appointmentDate).getTime();
        const dateB = new Date(b.appointmentDate).getTime();
        return dateA - dateB;
      });

      // Retornar solo las 4 primeras
      return sorted.slice(0, 4);
    },
    staleTime: 3 * 60 * 1000, // 3 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
  });

  // Formatear datos para mostrar en la UI
  const formatAppointmentForUI = (appointment: AppointmentResponse) => {
    const appointmentDate = new Date(appointment.appointmentDate);
    const hours = String(appointmentDate.getHours()).padStart(2, '0');
    const minutes = String(appointmentDate.getMinutes()).padStart(2, '0');

    const patientName = appointment.patientName || appointment.guestName || 'Paciente';

    return {
      id: appointment.id,
      time: `${hours}:${minutes}`,
      patient: patientName,
      treatment: appointment.title || 'Cita',
      status: appointment.status as 'confirmed' | 'pending' | 'completed' | 'cancelled',
      patientId: appointment.patientId,
      appointmentDate: appointmentDate,
      duration: appointment.duration,
    };
  };

  const upcomingAppointmentsFormatted = (queryUpcomingAppointments.data || []).map(
    formatAppointmentForUI
  );

  return {
    queryUpcomingAppointments,
    upcomingAppointments: upcomingAppointmentsFormatted,
    upcomingAppointmentsCount: upcomingAppointmentsFormatted.length,
    isLoading: queryUpcomingAppointments.isLoading,
    error: queryUpcomingAppointments.error,
  };
};
