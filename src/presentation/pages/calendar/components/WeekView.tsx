// components/WeekView.tsx - CON MENÚ CONTEXTUAL (PARTE 1)
import React from 'react';
import { AppointmentsData, CalendarAppointment } from '../types/calendar';
import { timeSlots, dayNames } from '../constants/calendar';
import { getWeekDays, isToday, getAppointmentsForDate, isTimeSlotBlockedByScheduleBlock } from '../utils/calendar';
import { AppointmentBlock } from './AppointmentBlock';
import { ScheduleBlockVisual } from './ScheduleBlockVisual';
import { ScheduleBlock } from '@/core/entities/ScheduleBlock';
import { Plus } from 'lucide-react';

interface WeekViewProps {
  currentDate: Date;
  appointments: AppointmentsData;
  onDateSelect: (date: Date) => void;
  onTimeSlotClick: (time: string, date: Date) => void;
  onAppointmentClick?: (appointment: CalendarAppointment, event: React.MouseEvent) => void;
  scheduleBlocks?: ScheduleBlock[];
}

export const WeekView: React.FC<WeekViewProps> = ({
  currentDate,
  appointments,
  onDateSelect,
  onTimeSlotClick,
  onAppointmentClick,
  scheduleBlocks = []
}) => {
  const weekDays = getWeekDays(currentDate);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Header Desktop */}
      <div className="border-b border-slate-100">
        <div className="hidden sm:flex">
          <div className="w-16 md:w-20 bg-slate-50 border-r border-slate-100 flex items-center justify-center">
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              MGS
            </div>
          </div>
          
          {weekDays.map((day, index) => {
            const dayAppointments = getAppointmentsForDate(appointments, day);
            const hasAppointments = dayAppointments.length > 0;
            const isCurrentDay = isToday(day);
            
            return (
              <div key={index} className="flex-1 p-3 md:p-4 text-center border-r border-slate-100 last:border-r-0 min-w-0">
                <div className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wider">
                  {dayNames[(day.getDay() + 6) % 7]}
                </div>
                
                <div 
                  className={`w-8 h-8 md:w-10 md:h-10 mx-auto rounded-full flex items-center justify-center text-base md:text-lg font-bold cursor-pointer transition-all duration-200 ${
                    isCurrentDay 
                      ? 'bg-cyan-500 text-white shadow-md scale-110' 
                      : hasAppointments
                        ? 'bg-cyan-50 text-cyan-600 hover:bg-cyan-100 hover:shadow-sm'
                        : 'text-slate-700 hover:bg-slate-100'
                  }`}
                  onClick={() => onTimeSlotClick('09:00', day)}
                >
                  {day.getDate()}
                </div>
                
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

      {/* Cuerpo del calendario */}
      <div className="relative">
        {/* Desktop */}
        <div className="hidden sm:flex">
          <div className="w-16 md:w-20 bg-slate-50 border-r border-slate-100 flex-shrink-0">
            {timeSlots.map((time) => (
              <div
                key={time}
                className="h-8 flex items-center justify-center text-xs font-medium text-slate-500 border-b border-slate-50"
              >
                {time}
              </div>
            ))}
          </div>

          <div className="flex flex-1">
            {weekDays.map((day, dayIndex) => {
              const dayAppointments = getAppointmentsForDate(appointments, day);
              
              return (
                <div key={dayIndex} className="flex-1 border-r border-slate-100 last:border-r-0 relative">
                  {timeSlots.map((time) => {
                    const currentHour = new Date().getHours();
                    const currentMinutes = new Date().getMinutes();
                    const slotHour = parseInt(time.split(':')[0]);
                    const slotMinutes = parseInt(time.split(':')[1]);
                    const isCurrentSlot = isToday(day) && currentHour === slotHour && Math.floor(currentMinutes / 30) === Math.floor(slotMinutes / 30);
                    const isBlocked = isTimeSlotBlockedByScheduleBlock(scheduleBlocks, day, time, 30);

                    return (
                      <div
                        key={time}
                        className={`h-8 border-b border-slate-50 transition-colors group relative ${
                          isBlocked
                            ? 'cursor-not-allowed'
                            : 'hover:bg-cyan-25 cursor-pointer'
                        }`}
                        onClick={() => !isBlocked && onTimeSlotClick(time, day)}
                      >
                        {!isBlocked && (
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Plus className="w-4 h-4 text-cyan-400" />
                          </div>
                        )}
                        
                        {isCurrentSlot && (
                          <div
                            className="absolute left-0 right-0 z-20"
                            style={{
                              top: `${((currentMinutes % 30) / 30) * 100}%`
                            }}
                          >
                            <div className="flex items-center">
                              <div className="w-1 h-1 bg-cyan-500 rounded-full border border-white shadow-sm -ml-0.5"></div>
                              <div className="flex-1 h-px bg-cyan-500 opacity-70"></div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  <div className="absolute inset-0 pointer-events-none">
                    {/* Renderizar bloques de agenda */}
                    <ScheduleBlockVisual
                      blocks={scheduleBlocks}
                      date={day}
                      viewType="week"
                    />

                    {/* Renderizar citas */}
                    {dayAppointments.map(appointment => (
                      <div key={appointment.id} className="pointer-events-auto">
                        <AppointmentBlock
                          appointment={appointment}
                          date={day}
                          appointments={appointments}
                          viewType="week"
                          onClick={onAppointmentClick}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Móvil */}
        <div className="sm:hidden overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Header móvil */}
            <div className="bg-white border-b border-slate-100 sticky top-0 z-30">
              <div className="flex">
                <div className="w-16 bg-slate-50 border-r border-slate-100 flex items-center justify-center flex-shrink-0">
                  <div className="text-lg text-slate-400">•</div>
                </div>
                
                {weekDays.map((day, index) => {
                  const dayAppointments = getAppointmentsForDate(appointments, day);
                  const hasAppointments = dayAppointments.length > 0;
                  const isCurrentDay = isToday(day);
                  
                  return (
                    <div key={index} className="w-20 p-3 text-center border-r border-slate-100 last:border-r-0 flex-shrink-0">
                      <div className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wider">
                        {dayNames[(day.getDay() + 6) % 7].substring(0, 3)}
                      </div>
                      
                      <div 
                        className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-sm font-bold cursor-pointer transition-all duration-200 ${
                          isCurrentDay 
                            ? 'bg-cyan-500 text-white shadow-md' 
                            : hasAppointments
                              ? 'bg-cyan-50 text-cyan-600 hover:bg-cyan-100'
                              : 'text-slate-700 hover:bg-slate-100'
                        }`}
                        onClick={() => onTimeSlotClick('09:00', day)}
                      >
                        {day.getDate()}
                      </div>
                      
                      {hasAppointments && (
                        <div className="mt-1 flex items-center justify-center space-x-0.5">
                          <div className="w-1 h-1 bg-cyan-400 rounded-full"></div>
                          {dayAppointments.length > 1 && (
                            <div className="w-1 h-1 bg-cyan-300 rounded-full"></div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cuerpo móvil */}
            <div className="flex">
              <div className="w-16 bg-slate-50 border-r border-slate-100 flex-shrink-0 sticky left-0 z-20">
                {timeSlots.map((time) => (
                  <div
                    key={time}
                    className="h-6 flex items-center justify-center text-xs font-medium text-slate-500 border-b border-slate-50"
                  >
                    {time}
                  </div>
                ))}
              </div>

              {weekDays.map((day, dayIndex) => {
                const dayAppointments = getAppointmentsForDate(appointments, day);

                return (
                  <div key={dayIndex} className="w-20 border-r border-slate-100 last:border-r-0 relative flex-shrink-0">
                    {timeSlots.map((time) => {
                      const currentHour = new Date().getHours();
                      const currentMinutes = new Date().getMinutes();
                      const slotHour = parseInt(time.split(':')[0]);
                      const slotMinutes = parseInt(time.split(':')[1]);
                      const isCurrentSlot = isToday(day) && currentHour === slotHour && Math.floor(currentMinutes / 30) === Math.floor(slotMinutes / 30);
                      const isBlocked = isTimeSlotBlockedByScheduleBlock(scheduleBlocks, day, time, 30);

                      return (
                        <div
                          key={time}
                          className={`h-6 border-b border-slate-50 transition-colors group relative ${
                            isBlocked
                              ? 'cursor-not-allowed'
                              : 'hover:bg-cyan-25 cursor-pointer'
                          }`}
                          onClick={() => !isBlocked && onTimeSlotClick(time, day)}
                        >
                          {!isBlocked && (
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Plus className="w-3 h-3 text-cyan-400" />
                            </div>
                          )}
                          
                          {isCurrentSlot && (
                            <div
                              className="absolute left-0 right-0 z-10"
                              style={{
                                top: `${((currentMinutes % 30) / 30) * 100}%`
                              }}
                            >
                              <div className="flex items-center">
                                <div className="w-1 h-1 bg-cyan-500 rounded-full border border-white shadow-sm -ml-0.5"></div>
                                <div className="flex-1 h-px bg-cyan-500 opacity-70"></div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    <div className="absolute inset-0 pointer-events-none">
                      {/* Renderizar bloques de agenda */}
                      <ScheduleBlockVisual
                        blocks={scheduleBlocks}
                        date={day}
                        viewType="week"
                      />

                      {/* Renderizar citas */}
                      {dayAppointments.map(appointment => (
                        <div key={appointment.id} className="pointer-events-auto">
                          <AppointmentBlock
                            appointment={appointment}
                            date={day}
                            appointments={appointments}
                            viewType="week"
                            onClick={onAppointmentClick}
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

        {/* Indicador de navegación móvil */}
        <div className="sm:hidden border-t border-slate-100 bg-slate-50 px-4 py-2">
          <div className="flex items-center justify-center text-xs text-slate-500">
            <span>← Desliza para ver más días →</span>
          </div>
        </div>
      </div>
    </div>
  );
};