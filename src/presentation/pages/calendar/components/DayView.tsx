// components/DayView.tsx
import React from 'react';
import { AppointmentsData, Appointment } from '../types/calendar';
import { timeSlots } from '../constants/calendar';
import { getAppointmentsForDate } from '../utils/calendar';
import { AppointmentBlock } from './AppointmentBlock';

interface DayViewProps {
  currentDate: Date;
  appointments: AppointmentsData;
  onTimeSlotClick: (time: string, date: Date) => void;
  onAppointmentEdit?: (appointment: Appointment) => void;
}

export const DayView: React.FC<DayViewProps> = ({
  currentDate,
  appointments,
  onTimeSlotClick,
  onAppointmentEdit
}) => {
  return (
    <div className="flex">
      {/* Columna de horarios */}
      <div className="w-24 border-r border-cyan-200">
        {timeSlots.map(time => (
          <div
            key={time}
            className="px-3 py-3 text-base text-slate-500 border-b border-cyan-200 flex items-center justify-center font-medium"
            style={{ height: '72px' }}
          >
            {time}
          </div>
        ))}
      </div>

      {/* Columna del día */}
      <div className="flex-1">
        <div className="relative">
          {timeSlots.map((time) => (
            <div
              key={time}
              className="border-b border-cyan-200 hover:bg-cyan-50 cursor-pointer px-6 flex items-center"
              style={{ height: '72px' }}
              onClick={() => onTimeSlotClick(time, currentDate)}
            >
              <div className="text-sm text-slate-500">Clic para agendar cita</div>
            </div>
          ))}

          {/* Citas del día */}
          {getAppointmentsForDate(appointments, currentDate).map(appointment => (
            <AppointmentBlock
              key={appointment.id}
              appointment={appointment}
              date={currentDate}
              appointments={appointments}
              viewType="day"
              onEdit={onAppointmentEdit}
            />
          ))}
        </div>
      </div>
    </div>
  );
};