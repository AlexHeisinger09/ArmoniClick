// components/DayView.tsx - CON MENÚ CONTEXTUAL
import React from 'react';
import { AppointmentsData, CalendarAppointment } from '../types/calendar';
import { timeSlots } from '../constants/calendar';
import { formatDateKey, getAppointmentsForDate, isToday, isTimeSlotBlockedByScheduleBlock } from '../utils/calendar';
import { AppointmentBlock } from './AppointmentBlock';
import { ScheduleBlockVisual } from './ScheduleBlockVisual';
import { ScheduleBlock } from '@/core/entities/ScheduleBlock';
import { Plus } from 'lucide-react';

interface DayViewProps {
  currentDate: Date;
  appointments: AppointmentsData;
  onTimeSlotClick: (time: string, date: Date) => void;
  onAppointmentClick?: (appointment: CalendarAppointment, event: React.MouseEvent) => void;
  scheduleBlocks?: ScheduleBlock[];
}

export const DayView: React.FC<DayViewProps> = ({
  currentDate,
  appointments,
  onTimeSlotClick,
  onAppointmentClick,
  scheduleBlocks = []
}) => {
  const dayAppointments = getAppointmentsForDate(appointments, currentDate);
  const isCurrentDay = isToday(currentDate);

  React.useEffect(() => {
    const dateKey = formatDateKey(currentDate);
    console.log('🔍 DayView - appointments for date:', {
      currentDate: currentDate.toISOString(),
      dateKey,
      dayAppointments,
      dayAppointmentsCount: dayAppointments.length
    });
  }, [currentDate, appointments, dayAppointments]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="flex">
        <div className="w-20 sm:w-24 bg-slate-50 border-r border-slate-100 flex-shrink-0">
          {timeSlots.map((time) => (
            <div
              key={time}
              className="h-20 flex items-center justify-center text-xs font-medium text-slate-500 border-b border-slate-50"
            >
              <span className="text-center">{time}</span>
            </div>
          ))}
        </div>

        <div className="flex-1 relative">
          {timeSlots.map((time) => {
            const currentHour = new Date().getHours();
            const currentMinutes = new Date().getMinutes();
            const slotHour = parseInt(time.split(':')[0]);
            const slotMinutes = parseInt(time.split(':')[1]);
            const isCurrentSlot = isCurrentDay && currentHour === slotHour && currentMinutes >= slotMinutes && currentMinutes < (slotMinutes + 30);
            const isBlocked = isTimeSlotBlockedByScheduleBlock(scheduleBlocks, currentDate, time, 30);

            return (
              <div
                key={time}
                className={`h-20 border-b border-slate-50 transition-colors group px-4 sm:px-6 flex items-center relative ${
                  isBlocked
                    ? 'bg-slate-500 cursor-not-allowed'
                    : 'hover:bg-cyan-25 cursor-pointer'
                }`}
                onClick={() => !isBlocked && onTimeSlotClick(time, currentDate)}
              >
                {!isBlocked && (
                  <div className="text-sm text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center font-medium">
                    <Plus className="w-4 h-4 mr-2 text-cyan-400" />
                    Agendar nueva cita
                  </div>
                )}

                {isCurrentSlot && (
                  <div
                    className="absolute left-0 right-4 z-20"
                    style={{
                      top: `${((currentMinutes % 30) / 30) * 100}%`
                    }}
                  >
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-cyan-500 rounded-full border-2 border-white shadow-md -ml-1.5"></div>
                      <div className="flex-1 h-px bg-cyan-500 shadow-sm"></div>
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
              date={currentDate}
              viewType="day"
            />

            {/* Renderizar citas */}
            {dayAppointments.map(appointment => (
              <div key={appointment.id} className="pointer-events-auto">
                <AppointmentBlock
                  appointment={appointment}
                  date={currentDate}
                  appointments={appointments}
                  viewType="day"
                  onClick={onAppointmentClick}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};