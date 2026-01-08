import { useQuery } from '@tanstack/react-query';
import { apiFetcher } from '@/config/adapters/api.adapter';
import { getAppointmentsUseCase } from '@/core/use-cases/appointments/get-appointments.use-case';
import { AppointmentResponse } from '@/infrastructure/interfaces/appointment.response';

/**
 * Hook personalizado para obtener las próximas 4 citas más cercanas
 * Si hay menos de 4 próximas citas, completa con las últimas 4 citas pasadas
 * @returns Objeto con las próximas citas (o últimas si no hay suficientes próximas) ordenadas por fecha
 */
export const useTodayAndUpcomingAppointments = () => {
  const queryUpcomingAppointments = useQuery({
    queryKey: ['appointments', 'upcoming'],
    queryFn: async () => {
      // Obtener citas con flag upcoming=true para filtrar desde hoy
      const upcomingAppointments = await getAppointmentsUseCase(apiFetcher, {
        upcoming: true
      });

      // Si tenemos 4 o más próximas citas, retornarlas
      if ((upcomingAppointments || []).length >= 4) {
        const sorted = (upcomingAppointments || []).sort((a, b) => {
          const dateA = new Date(a.appointmentDate).getTime();
          const dateB = new Date(b.appointmentDate).getTime();
          return dateA - dateB;
        });
        return sorted.slice(0, 4);
      }

      // Si hay menos de 4 próximas, obtener todas las citas (sin el filtro upcoming)
      // para poder traer las pasadas/completadas
      try {
        const allAppointments = await getAppointmentsUseCase(apiFetcher);

        // Separar citas próximas (sin parámetro) y ordenarlas
        const sorted = (allAppointments || []).sort((a, b) => {
          const dateA = new Date(a.appointmentDate).getTime();
          const dateB = new Date(b.appointmentDate).getTime();
          return dateB - dateA; // Descendente para obtener las más recientes primero
        });

        // Tomar las últimas 4 citas (más recientes)
        const lastFourAppointments = sorted.slice(0, 4);

        // Ordenarlas ascendente por fecha para mostrar
        return lastFourAppointments.sort((a, b) => {
          const dateA = new Date(a.appointmentDate).getTime();
          const dateB = new Date(b.appointmentDate).getTime();
          return dateA - dateB;
        });
      } catch (error) {
        // Si falla obtener todas las citas, retornar las próximas que tenemos
        console.error('Error fetching all appointments, using upcoming only:', error);
        const sorted = (upcomingAppointments || []).sort((a, b) => {
          const dateA = new Date(a.appointmentDate).getTime();
          const dateB = new Date(b.appointmentDate).getTime();
          return dateA - dateB;
        });
        return sorted.slice(0, 4);
      }
    },
    staleTime: 3 * 60 * 1000, // 3 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
  });

  // Formatear datos para mostrar en la UI
  const formatAppointmentForUI = (appointment: AppointmentResponse) => {
    const appointmentDate = new Date(appointment.appointmentDate);
    const hours = String(appointmentDate.getHours()).padStart(2, '0');
    const minutes = String(appointmentDate.getMinutes()).padStart(2, '0');

    // Formato de día: "Lun", "Mar", "Mié", etc.
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab'];
    const dayOfWeek = dayNames[appointmentDate.getDay()];

    // Formato de fecha: "15 Nov"
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const dayOfMonth = appointmentDate.getDate();
    const month = monthNames[appointmentDate.getMonth()];
    const dateDisplay = `${dayOfWeek} ${dayOfMonth} ${month}`;

    const patientName = appointment.patientName || appointment.guestName || 'Paciente';

    return {
      id: appointment.id,
      time: `${hours}:${minutes}`,
      date: dateDisplay,
      patient: patientName,
      treatment: appointment.title || 'Cita',
      status: appointment.status as 'confirmed' | 'pending' | 'completed' | 'cancelled' | 'no-show',
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
