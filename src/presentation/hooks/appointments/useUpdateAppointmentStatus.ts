import { updateAppointmentStatusUseCase } from '@/core/use-cases/appointments/update-appointment-status.use-case';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetcher } from '@/config/adapters/api.adapter';
import { toast } from 'sonner';

interface UpdateStatusParams {
  id: number;
  status: string;
  reason?: string;
}

export const useUpdateAppointmentStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status, reason }: UpdateStatusParams) =>
      updateAppointmentStatusUseCase(apiFetcher, id, { status, reason }),
    onSuccess: (data, variables) => {
      // Actualizar las queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointment', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-appointments'] });
      
      toast.success(data.message);
    },
    onError: (error: any) => {
      const message = error.message || 'Error al actualizar el estado de la cita';
      toast.error(message);
    },
  });
};