// components/WeekView.tsx - Diseño moderno con colores cyan
import React from 'react';
import { AppointmentsData, Appointment } from '../types/calendar';
import { timeSlots, dayNames } from '../constants/calendar';
import { getWeekDays, isToday, getAppointmentsForDate } from '../utils/calendar';
import { AppointmentBlock } from './AppointmentBlock';
import { Plus } from 'lucide-react';

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
  const weekDays = getWeekDays(currentDate);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Header con días de la semana - Diseño limpio */}
      <div className="border-b border-slate-100">
        <div className="flex">
          {/* Espacio para columna de horas */}
          <div className="w-16 sm:w-20 bg-slate-50 border-r border-slate-100 flex items-center justify-center">
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider transform -rotate-90">
              MGS
            </div>
          </div>
          
          {/* Días de la semana */}
          {weekDays.map((day, index) => {
            const dayAppointments = getAppointmentsForDate(appointments, day);
            const hasAppointments = dayAppointments.length > 0;
            const isCurrentDay = isToday(day);
            
            return (
              <div key={index} className="flex-1 p-3 sm:p-4 text-center border-r border-slate-100 last:border-r-0">
                <div className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wider">
                  {dayNames[(day.getDay() + 6) % 7]}
                </div>
                <div 
                  className={`w-8 h-8 sm:w-10 sm:h-10 mx-auto rounded-full flex items-center justify-center text-base sm:text-lg font-bold cursor-pointer transition-all duration-200 ${
                    isCurrentDay 
                      ? 'bg-cyan-500 text-white shadow-md' 
                      : hasAppointments
                        ? 'bg-cyan-50 text-cyan-600 hover:bg-cyan-100 hover:shadow-sm'
                        : 'text-slate-700 hover:bg-slate-100'
                  }`}
                  onClick={() => onDateSelect(day)}
                >
                  {day.getDate()}
                </div>
                {hasAppointments && (
                  <div className="mt-1">
                    <div className="w-1 h-1 bg-cyan-400 rounded-full mx-auto"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Cuerpo del calendario */}
      <div className="flex relative overflow-x-auto">
        {/* Columna de horas - Diseño minimalista */}
        <div className="w-16 sm:w-20 bg-slate-50 border-r border-slate-100 flex-shrink-0">
          {timeSlots.map((time, index) => (
            <div
              key={time}
              className="h-14 sm:h-16 flex items-center justify-center text-xs sm:text-sm font-medium text-slate-500 border-b border-slate-50"
            >
              <span className="text-center">{time}</span>
            </div>
          ))}
        </div>

        {/* Días - Diseño limpio con hover effects */}
        <div className="flex flex-1 min-w-0">
          {weekDays.map((day, dayIndex) => {
            const dayAppointments = getAppointmentsForDate(appointments, day);
            
            return (
              <div key={dayIndex} className="flex-1 min-w-0 border-r border-slate-100 last:border-r-0 relative">
                {/* Slots de tiempo */}
                {timeSlots.map((time, timeIndex) => {
                  const currentHour = new Date().getHours();
                  const currentMinutes = new Date().getMinutes();
                  const slotHour = parseInt(time.split(':')[0]);
                  const isCurrentHourSlot = isToday(day) && currentHour === slotHour;
                  
                  return (
                    <div
                      key={time}
                      className="h-14 sm:h-16 border-b border-slate-50 hover:bg-cyan-25 cursor-pointer transition-colors group relative"
                      onClick={() => onTimeSlotClick(time, day)}
                    >
                      {/* Indicador de hover con icono */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Plus className="w-3 h-3 text-cyan-400" />
                      </div>
                      
                      {/* Línea de hora actual - Corregida */}
                      {isCurrentHourSlot && (
                        <div 
                          className="absolute left-0 right-0 z-20"
                          style={{ 
                            top: `${(currentMinutes / 60) * 100}%`
                          }}
                        >
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-cyan-500 rounded-full border border-white shadow-sm -ml-1"></div>
                            <div className="flex-1 h-px bg-cyan-500"></div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Citas */}
                <div className="absolute inset-0 pointer-events-none">
                  {dayAppointments.map(appointment => (
                    <div key={appointment.id} className="pointer-events-auto">
                      <AppointmentBlock
                        appointment={appointment}
                        date={day}
                        appointments={appointments}
                        viewType="week"
                        onEdit={onAppointmentEdit}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};