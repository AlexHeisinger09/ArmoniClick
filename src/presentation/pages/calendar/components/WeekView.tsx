// components/WeekView.tsx
import React from 'react';
import { AppointmentsData, Appointment } from '../types/calendar';
import { timeSlots, dayNames } from '../constants/calendar';
import { getWeekDays, isToday, getAppointmentsForDate } from '../utils/calendar';
import { AppointmentBlock } from './AppointmentBlock';

interface WeekViewProps {
  currentDate: Date;
  appointments: AppointmentsData;
  onDateSelect: (date: Date) => void;
  onTimeSlotClick: (time: string, date: Date) => void;
  onAppointmentEdit?: (appointment: Appointment) => void;
}

export const WeekView: React.FC<WeekViewProps> = ({
  currentDate,
  appointments,
  onDateSelect,
  onTimeSlotClick,
  onAppointmentEdit
}) => {
  return (
    <div className="flex">
      {/* Columna de horarios */}
      <div className="w-20 border-r border-cyan-200">
        <div className="h-16 border-b border-cyan-200"></div>
        {timeSlots.map(time => (
          <div
            key={time}
            className="px-2 py-4 text-sm text-slate-500 border-b border-cyan-100 flex items-center justify-center"
            style={{ height: '65px' }}
          >
            {time}
          </div>
        ))}
      </div>

      {/* Columnas de días */}
      {getWeekDays(currentDate).map((day, dayIndex) => {
        const dayAppointments = getAppointmentsForDate(appointments, day);

        return (
          <div key={dayIndex} className="flex-1 border-r border-cyan-200 last:border-r-0">
            {/* Header del día */}
            <div
              className={`
                h-16 p-3 text-center border-b border-cyan-200 font-medium transition-colors
                ${isToday(day) ? 'bg-cyan-100 text-slate-700' : 'text-slate-500 bg-white'}
              `}
            >
              <div className="text-xs">{dayNames[(day.getDay() + 6) % 7]}</div>
              <div className={`text-lg ${isToday(day) ? 'text-slate-700 font-bold' : ''}`}>
                {day.getDate()}
              </div>
            </div>

            {/* Timeline del día */}
            <div className="relative">
              {timeSlots.map((time) => (
                <div
                  key={time}
                  className="border-b border-cyan-100 hover:bg-cyan-50 cursor-pointer"
                  style={{ height: '65px' }}
                  onClick={() => onTimeSlotClick(time, day)}
                />
              ))}

              {/* Citas del día */}
              {dayAppointments.map(appointment => (
                <AppointmentBlock
                  key={appointment.id}
                  appointment={appointment}
                  date={day}
                  appointments={appointments}
                  viewType="week"
                  onEdit={onAppointmentEdit}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};