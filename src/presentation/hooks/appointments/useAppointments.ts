import { useQuery } from '@tanstack/react-query';
import { apiFetcher } from '@/config/adapters/api.adapter';
import { getAppointmentsUseCase } from '@/core/use-cases/appointments/get-appointments.use-case';
import { getAppointmentsByPatientUseCase } from '@/core/use-cases/appointments/get-appointments-by-patient.use-case';

interface UseAppointmentsParams {
  startDate?: string;
  endDate?: string;
  upcoming?: boolean;
  enabled?: boolean;
}

export const useAppointments = (params?: UseAppointmentsParams) => {
  return useQuery({
    queryKey: ['appointments', params],
    queryFn: () => getAppointmentsUseCase(apiFetcher, params),
    enabled: params?.enabled !== false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook to fetch appointments for a specific patient
 * Filters appointments by patientId to get only appointments for this patient
 */
export const useAppointmentsByPatient = (patientId: number, enabled = true) => {
  return useQuery({
    queryKey: ['appointments', 'patient', patientId],
    queryFn: () => getAppointmentsByPatientUseCase(apiFetcher, patientId),
    enabled: enabled && !!patientId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};