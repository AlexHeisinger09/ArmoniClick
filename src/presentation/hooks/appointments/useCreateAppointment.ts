import { apiFetcher } from '@/config/adapters/api.adapter';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createAppointmentUseCase } from '@/core/use-cases/appointments/create-appointment.use-case';
import { CreateAppointmentRequest } from '@/infrastructure/interfaces/appointment.response';
import { toast } from 'sonner';

export const useCreateAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (appointmentData: CreateAppointmentRequest) =>
      createAppointmentUseCase(apiFetcher, appointmentData),
    onSuccess: (data) => {
      // Invalidar las queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-appointments'] });
      
      toast.success(data.message || 'Cita creada exitosamente');
    },
    onError: (error: any) => {
      const message = error.message || 'Error al crear la cita';
      toast.error(message);
    },
  });
};