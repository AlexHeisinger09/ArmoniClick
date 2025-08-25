// src/presentation/hooks/appointments/useCalendarAppointments.ts - CON DEBUG MEJORADO
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetcher } from '@/config/adapters/api.adapter';
import { 
  getAppointmentsUseCase,
  createAppointmentUseCase,
  updateAppointmentStatusUseCase 
} from '@/core/use-cases';
import { AppointmentMapper } from '@/infrastructure/mappers/appointment.mapper';
import { 
  AppointmentsCalendarData,
  NewAppointmentForm,
  ViewMode 
} from '@/presentation/pages/calendar/types/calendar';
import { useMemo } from 'react';
import { toast } from 'sonner';

// Hook principal que reemplaza el estado estático del calendario
export const useCalendarAppointments = (currentDate: Date, viewMode: ViewMode) => {
  const queryClient = useQueryClient();

  // Calcular el rango de fechas basado en la vista actual
  const dateRange = useMemo(() => {
    const range = AppointmentMapper.getDateRangeForCalendarView(currentDate, viewMode);
    console.log('🔍 useCalendarAppointments - dateRange calculated:', range);
    return range;
  }, [currentDate, viewMode]);

  // Query para obtener las citas
  const appointmentsQuery = useQuery({
    queryKey: ['calendar-appointments', dateRange.startDate, dateRange.endDate],
    queryFn: async () => {
      console.log('🌐 Fetching appointments with params:', {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });
      
      try {
        const result = await getAppointmentsUseCase(apiFetcher, {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        });
        
        console.log('📦 Raw appointments from backend:', {
          count: result?.length || 0,
          result
        });
        
        return result;
      } catch (error) {
        console.error('❌ Error fetching appointments:', error);
        throw error;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // Log de estados de la query
  console.log('🔍 Query states:', {
    isLoading: appointmentsQuery.isLoading,
    isError: appointmentsQuery.isError,
    error: appointmentsQuery.error,
    data: appointmentsQuery.data,
    dataLength: appointmentsQuery.data?.length
  });

  // Convertir datos del backend al formato que usa tu Calendar
  const appointments: AppointmentsCalendarData = useMemo(() => {
    if (!appointmentsQuery.data) {
      console.log('⚠️ No data from appointments query');
      return {};
    }
    
    console.log('🔄 Starting mapping process with data:', appointmentsQuery.data);
    const mapped = AppointmentMapper.fromBackendToCalendarData(appointmentsQuery.data);
    console.log('✅ Mapping completed:', mapped);
    return mapped;
  }, [appointmentsQuery.data]);

  // Mutación para crear citas
  const createAppointmentMutation = useMutation({
    mutationFn: async (appointmentData: NewAppointmentForm) => {
      console.log('📝 Creating appointment:', appointmentData);
      const backendData = AppointmentMapper.fromCalendarFormToBackendRequest(appointmentData);
      console.log('🔄 Mapped to backend format:', backendData);
      
      const result = await createAppointmentUseCase(apiFetcher, backendData);
      console.log('✅ Appointment created:', result);
      return result;
    },
    onSuccess: (data) => {
      console.log('🎉 Create success, invalidating queries...');
      // Invalidar y refetch las queries del calendario
      queryClient.invalidateQueries({ queryKey: ['calendar-appointments'] });
      toast.success('Cita creada exitosamente');
    },
    onError: (error: any) => {
      console.error('❌ Create error:', error);
      const message = error.message || 'Error al crear la cita';
      toast.error(message);
      throw error; // Re-throw para que el componente pueda manejarlo
    },
  });

  // Mutación para actualizar el estado de las citas
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, reason }: { id: number; status: string; reason?: string }) =>
      updateAppointmentStatusUseCase(apiFetcher, id, { status, reason }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['calendar-appointments'] });
      toast.success(data.message || 'Estado actualizado exitosamente');
    },
    onError: (error: any) => {
      const message = error.message || 'Error al actualizar el estado';
      toast.error(message);
    },
  });

  return {
    // Datos para el calendario (en el formato exacto que espera tu Calendar.tsx)
    appointments,
    
    // Estados de carga
    isLoading: appointmentsQuery.isLoading,
    error: appointmentsQuery.error,
    isCreating: createAppointmentMutation.isPending,
    isUpdatingStatus: updateStatusMutation.isPending,

    // Funciones para usar en tu Calendar.tsx
    createAppointment: createAppointmentMutation.mutateAsync,
    updateAppointmentStatus: updateStatusMutation.mutateAsync,
    refetch: appointmentsQuery.refetch,
  };
};

// Hook simplificado para casos específicos
export const useAppointments = (params?: {
  startDate?: string;
  endDate?: string;
  upcoming?: boolean;
  enabled?: boolean;
}) => {
  return useQuery({
    queryKey: ['appointments', params],
    queryFn: () => getAppointmentsUseCase(apiFetcher, params),
    enabled: params?.enabled !== false,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};