import { useMemo } from 'react';
import { AppointmentMapper } from '@/infrastructure/mappers/appointment.mapper';
import { useAppointments } from './useAppointments';

export const useAppointmentsCalendar = (
  startDate?: string,
  endDate?: string,
  enabled: boolean = true
) => {
  const appointmentsQuery = useAppointments({
    startDate,
    endDate,
    enabled,
  });

  const calendarData = useMemo(() => {
    if (!appointmentsQuery.data) return {};
    
    return AppointmentMapper.fromResponseToCalendarData(appointmentsQuery.data);
  }, [appointmentsQuery.data]);

  return {
    ...appointmentsQuery,
    calendarData,
  };
};