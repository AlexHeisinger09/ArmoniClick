import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetcher } from '@/config/adapters/api.adapter';
import { toast } from 'sonner';
import { updateAppointmentUseCase } from '@/core/use-cases/appointments/update-appointment.use-case';
import { UpdateAppointmentRequest } from '@/infrastructure/interfaces/appointment.response';

export const useUpdateAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateAppointmentRequest }) =>
      updateAppointmentUseCase(apiFetcher, id, data),
    onSuccess: (data, variables) => {
      // Actualizar las queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointment', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-appointments'] });
      
      toast.success(data.message || 'Cita actualizada exitosamente');
    },
    onError: (error: any) => {
      const message = error.message || 'Error al actualizar la cita';
      toast.error(message);
    },
  });
};
