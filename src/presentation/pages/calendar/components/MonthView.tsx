// components/MonthView.tsx
import React from 'react';
import { CalendarDay, AppointmentsData } from '../types/calendar';
import { dayNames } from '../constants/calendar';
import { getDaysInMonth, isToday, getAppointmentsForDate } from '../utils/calendar';

interface MonthViewProps {
  currentDate: Date;
  appointments: AppointmentsData;
  onDateClick: (day: CalendarDay) => void;
}

export const MonthView: React.FC<MonthViewProps> = ({
  currentDate,
  appointments,
  onDateClick
}) => {
  return (
    <>
      {/* Días de la semana */}
      <div className="grid grid-cols-7 border-b border-cyan-200">
        {dayNames.map(day => (
          <div key={day} className="p-4 text-center font-semibold text-slate-500 text-sm">
            {day}
          </div>
        ))}
      </div>

      {/* Días del mes */}
      <div className="grid grid-cols-7">
        {getDaysInMonth(currentDate).map((day, index) => {
          const dayAppointments = getAppointmentsForDate(appointments, day.date);
          const hasAppointments = dayAppointments.length > 0;

          return (
            <div
              key={index}
              onClick={() => onDateClick(day)}
              className={`
                min-h-28 p-3 border-b border-r border-cyan-100 cursor-pointer transition-colors
                ${day.isCurrentMonth ? 'hover:bg-cyan-50' : 'bg-slate-100 text-slate-400'}
                ${isToday(day.date) ? 'bg-cyan-100' : ''}
              `}
            >
              <div className={`
                text-sm font-medium mb-2
                ${isToday(day.date) ? 'text-slate-700 font-bold' : ''}
              `}>
                {day.date.getDate()}
              </div>
              {hasAppointments && (
                <div className="space-y-1">
                  {dayAppointments.slice(0, 3).map(appointment => (
                    <div
                      key={appointment.id}
                      className={`
                        text-xs px-2 py-1 rounded text-white truncate
                        ${appointment.status === 'confirmed' ? 'bg-cyan-600' : 'bg-cyan-400'}
                      `}
                    >
                      {appointment.time} - {appointment.patient}
                    </div>
                  ))}
                  {dayAppointments.length > 3 && (
                    <div className="text-xs text-slate-500 text-center">
                      +{dayAppointments.length - 3} más
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
};