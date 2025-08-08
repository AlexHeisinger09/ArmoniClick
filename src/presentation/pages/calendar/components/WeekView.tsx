// components/WeekView.tsx - Optimizado para móviles con diseño minimalista
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
      {/* Header con días de la semana - Optimizado para móvil */}
      <div className="border-b border-slate-100">
        <div className="flex">
          {/* Espacio para columna de horas - Más pequeño en móvil */}
          <div className="w-12 sm:w-16 md:w-20 bg-slate-50 border-r border-slate-100 flex items-center justify-center">
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider transform -rotate-90">
              <span className="hidden sm:inline">MGS</span>
              <span className="sm:hidden">•</span>
            </div>
          </div>
          
          {/* Días de la semana - Responsive */}
          {weekDays.map((day, index) => {
            const dayAppointments = getAppointmentsForDate(appointments, day);
            const hasAppointments = dayAppointments.length > 0;
            const isCurrentDay = isToday(day);
            
            return (
              <div key={index} className="flex-1 p-2 sm:p-3 md:p-4 text-center border-r border-slate-100 last:border-r-0 min-w-0">
                {/* Nombre del día - Abreviado en móvil */}
                <div className="text-xs font-medium text-slate-500 mb-1 sm:mb-2 uppercase tracking-wider">
                  <span className="sm:hidden">{dayNames[(day.getDay() + 6) % 7].substring(0, 1)}</span>
                  <span className="hidden sm:inline">{dayNames[(day.getDay() + 6) % 7]}</span>
                </div>
                
                {/* Círculo del día - Responsive */}
                <div 
                  className={`w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 mx-auto rounded-full flex items-center justify-center text-sm sm:text-base md:text-lg font-bold cursor-pointer transition-all duration-200 ${
                    isCurrentDay 
                      ? 'bg-cyan-500 text-white shadow-md scale-110' 
                      : hasAppointments
                        ? 'bg-cyan-50 text-cyan-600 hover:bg-cyan-100 hover:shadow-sm'
                        : 'text-slate-700 hover:bg-slate-100'
                  }`}
                  onClick={() => onDateSelect(day)}
                >
                  {day.getDate()}
                </div>
                
                {/* Indicador de citas - Más visible en móvil */}
                {hasAppointments && (
                  <div className="mt-1">
                    <div className="flex items-center justify-center space-x-0.5">
                      <div className="w-1 h-1 bg-cyan-400 rounded-full"></div>
                      {dayAppointments.length > 1 && (
                        <div className="w-1 h-1 bg-cyan-300 rounded-full"></div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Cuerpo del calendario - Scroll horizontal en móvil */}
      <div className="relative">
        {/* Contenedor con scroll horizontal en móvil */}
        <div className="overflow-x-auto">
          <div className="flex min-w-[600px] sm:min-w-0">
            {/* Columna de horas - Responsive */}
            <div className="w-12 sm:w-16 md:w-20 bg-slate-50 border-r border-slate-100 flex-shrink-0 sticky left-0 z-10">
              {timeSlots.map((time) => (
                <div
                  key={time}
                  className="h-12 sm:h-14 md:h-16 flex items-center justify-center text-xs sm:text-sm font-medium text-slate-500 border-b border-slate-50"
                >
                  <span className="text-center leading-tight">
                    <span className="sm:hidden">{time.split(':')[0]}</span>
                    <span className="hidden sm:inline">{time}</span>
                  </span>
                </div>
              ))}
            </div>

            {/* Días - Optimizado para móvil */}
            <div className="flex flex-1">
              {weekDays.map((day, dayIndex) => {
                const dayAppointments = getAppointmentsForDate(appointments, day);
                
                return (
                  <div key={dayIndex} className="flex-1 border-r border-slate-100 last:border-r-0 relative min-w-[70px] sm:min-w-0">
                    {/* Slots de tiempo - Altura reducida en móvil */}
                    {timeSlots.map((time) => {
                      const currentHour = new Date().getHours();
                      const currentMinutes = new Date().getMinutes();
                      const slotHour = parseInt(time.split(':')[0]);
                      const isCurrentHourSlot = isToday(day) && currentHour === slotHour;
                      
                      return (
                        <div
                          key={time}
                          className="h-12 sm:h-14 md:h-16 border-b border-slate-50 hover:bg-cyan-25 cursor-pointer transition-colors group relative"
                          onClick={() => onTimeSlotClick(time, day)}
                        >
                          {/* Indicador de hover - Más pequeño en móvil */}
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Plus className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-400" />
                          </div>
                          
                          {/* Línea de hora actual */}
                          {isCurrentHourSlot && (
                            <div 
                              className="absolute left-0 right-0 z-20"
                              style={{ 
                                top: `${(currentMinutes / 60) * 100}%`
                              }}
                            >
                              <div className="flex items-center">
                                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-cyan-500 rounded-full border border-white shadow-sm -ml-0.5 sm:-ml-1"></div>
                                <div className="flex-1 h-px bg-cyan-500"></div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Citas - Con ajustes para móvil */}
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

        {/* Indicador de scroll en móvil */}
        <div className="absolute bottom-2 right-2 sm:hidden">
          <div className="bg-slate-700 text-white text-xs px-2 py-1 rounded-full opacity-75">
            ← → Desliza
          </div>
        </div>
      </div>
    </div>
  );
};