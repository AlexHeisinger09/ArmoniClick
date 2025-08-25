import { deleteAppointmentUseCase } from '@/core/use-cases/appointments/delete-appointment.use-case';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetcher } from '@/config/adapters/api.adapter';
import { toast } from 'sonner';
export const useDeleteAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteAppointmentUseCase(apiFetcher, id),
    onSuccess: (data) => {
      // Invalidar las queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-appointments'] });
      
      toast.success(data.message || 'Cita eliminada exitosamente');
    },
    onError: (error: any) => {
      const message = error.message || 'Error al eliminar la cita';
      toast.error(message);
    },
  });
};