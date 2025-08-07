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
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-cyan-100">
      <div className="flex min-h-96">
        {/* Columna de horarios - Con colores cyan */}
        <div className="w-16 lg:w-20 bg-cyan-50/30 border-r border-cyan-100 flex-shrink-0">
          {/* Espacio para header más pequeño */}
          <div className="h-13 lg:h-15 border-b border-cyan-100 bg-white rounded-tl-2xl"></div>
          
          {/* Horarios con mejor tipografía */}
          {timeSlots.map(time => (
            <div
              key={time}
              className="px-1 lg:px-2 py-3 lg:py-4 text-xs lg:text-sm text-slate-600 border-b border-cyan-50 flex items-center justify-center font-medium"
              style={{ height: '60px' }}
            >
              <span className="text-center leading-tight font-semibold">
                {time}
              </span>
            </div>
          ))}
        </div>

        {/* Contenedor scrolleable para días en móvil */}
        <div className="flex-1 overflow-x-auto">
          <div className="flex min-w-max lg:min-w-0">
            {/* Columnas de días */}
            {getWeekDays(currentDate).map((day, dayIndex) => {
              const dayAppointments = getAppointmentsForDate(appointments, day);

              return (
                <div 
                  key={dayIndex} 
                  className="w-32 sm:w-40 lg:flex-1 border-r border-cyan-100 last:border-r-0"
                  style={{ minWidth: '120px' }}
                >
                  {/* Header del día - Más compacto y seleccionable */}
                  <div
                    className={`
                      h-13 lg:h-15 p-1.5 lg:p-2 text-center border-b border-cyan-100 
                      transition-all duration-200 cursor-pointer group
                      ${isToday(day) 
                        ? 'bg-gradient-to-b from-cyan-50 to-cyan-100/60' 
                        : 'bg-white hover:bg-cyan-25'
                      }
                    `}
                    onClick={() => onDateSelect(day)}
                  >
                    <div className={`
                      text-xs font-bold uppercase tracking-wide mb-0.5
                      ${isToday(day) ? 'text-cyan-700' : 'text-slate-500'}
                    `}>
                      {dayNames[(day.getDay() + 6) % 7].slice(0, 3)}
                    </div>
                    
                    <div className={`
                      w-7 h-7 lg:w-8 lg:h-8 mx-auto rounded-lg flex items-center justify-center
                      text-sm lg:text-base font-bold transition-all duration-200 border-2
                      ${isToday(day) 
                        ? 'bg-cyan-500 text-white shadow-lg border-cyan-600' 
                        : 'text-slate-700 border-transparent hover:bg-cyan-100 hover:border-cyan-200 hover:scale-105'
                      }
                    `}>
                      {day.getDate()}
                    </div>
                  </div>

                  {/* Timeline del día - Con bordes redondeados */}
                  <div className="relative bg-white">
                    {timeSlots.map((time, timeIndex) => (
                      <div
                        key={time}
                        className={`
                          border-b border-cyan-50 hover:bg-cyan-50/40 cursor-pointer 
                          transition-colors duration-150 group relative
                          ${timeIndex % 2 === 0 ? 'bg-cyan-25/20' : 'bg-white'}
                        `}
                        style={{ height: '60px' }}
                        onClick={() => onTimeSlotClick(time, day)}
                      >
                        {/* Línea de hover sutil */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                          <div className="absolute left-0 top-1/2 w-full h-px bg-cyan-300"></div>
                        </div>
                        
                        {/* Indicador de hora actual */}
                        {isToday(day) && new Date().getHours() === parseInt(time.split(':')[0]) && (
                          <div className="absolute left-0 top-1/2 w-full">
                            <div className="flex items-center">
                              <div className="w-3 h-3 bg-cyan-500 rounded-full border-2 border-white shadow-md -ml-1.5"></div>
                              <div className="flex-1 h-0.5 bg-cyan-500 shadow-sm"></div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Citas del día con mejor posicionamiento */}
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
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Línea base elegante con colores cyan */}
      <div className="h-px bg-gradient-to-r from-transparent via-cyan-200 to-transparent"></div>
    </div>
  );
};