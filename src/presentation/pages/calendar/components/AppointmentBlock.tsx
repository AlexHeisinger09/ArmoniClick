// components/AppointmentBlock.tsx
import React from 'react';
import { Appointment, AppointmentsData } from '../types/calendar';
import { formatDateKey } from '../utils/calendar';

interface AppointmentBlockProps {
  appointment: Appointment;
  date: Date;
  appointments: AppointmentsData;
  viewType?: 'week' | 'day';
  onEdit?: (appointment: Appointment) => void;
}

export const AppointmentBlock: React.FC<AppointmentBlockProps> = ({
  appointment,
  date,
  appointments,
  viewType = 'week',
  onEdit
}) => {
  const dateKey = formatDateKey(date);
  const dayAppointments = appointments[dateKey] || [];
  const sameTimeAppointments = dayAppointments.filter(app => app.time === appointment.time);
  const appointmentIndex = sameTimeAppointments.findIndex(app => app.id === appointment.id);
  const isOverbook = sameTimeAppointments.length > 1;

  // Configuración según la vista
  const config = viewType === 'day' ? {
    slotHeight: 72,
    leftOffset: 6,
    rightOffset: 6,
    textSize: 'text-sm',
    padding: 'p-2'
  } : {
    slotHeight: 65,
    leftOffset: 2,
    rightOffset: 2,
    textSize: 'text-xs',
    padding: 'p-1'
  };

  const getSlotIndex = (time: string) => {
    const [hour] = time.split(':').map(Number);
    return hour - 9;
  };

  const slotIndex = getSlotIndex(appointment.time);
  const topOffset = slotIndex * config.slotHeight + 2;
  const blockHeight = config.slotHeight - 4;

  let positionStyle: React.CSSProperties = {
    top: `${topOffset}px`,
    height: `${blockHeight}px`,
    maxHeight: `${blockHeight}px`,
    overflow: 'hidden'
  };

  if (isOverbook) {
    if (appointmentIndex === 0) {
      positionStyle = {
        ...positionStyle,
        left: `${config.leftOffset}px`,
        width: '70%',
        right: 'auto'
      };
    } else {
      positionStyle = {
        ...positionStyle,
        right: `${config.rightOffset}px`,
        width: '25%',
        left: 'auto'
      };
    }
  } else {
    positionStyle = {
      ...positionStyle,
      left: `${config.leftOffset}px`,
      right: `${config.rightOffset}px`
    };
  }

  return (
    <div
      className={`
        absolute rounded-lg text-white shadow-md cursor-pointer transition-all
        ${appointment.status === 'confirmed'
          ? 'bg-cyan-600 hover:bg-cyan-700'
          : 'bg-cyan-400 hover:bg-cyan-500'}
        ${isOverbook && appointmentIndex > 0 ? 'p-1' : config.padding}
      `}
      style={positionStyle}
      onClick={() => onEdit?.(appointment)}
    >
      {isOverbook && appointmentIndex > 0 ? (
        // Sobrecupo - vista compacta
        <div className="text-xs h-full flex flex-col justify-center">
          <div className="font-semibold truncate">{appointment.patient.split(' ')[0]}</div>
          <div className="text-xs opacity-90 truncate">Sobrecupo</div>
          <div className="text-xs opacity-75">{appointment.time}</div>
        </div>
      ) : (
        // Cita normal - vista completa
        <div className="h-full flex flex-col justify-center">
          <div className={`font-semibold truncate ${config.textSize}`}>
            {appointment.patient}
          </div>
          <div className={`truncate opacity-90 ${config.textSize === 'text-sm' ? 'text-xs' : 'text-xs'}`}>
            {appointment.service}
          </div>
          <div className={`opacity-75 ${config.textSize === 'text-sm' ? 'text-xs' : 'text-xs'}`}>
            {appointment.time} ({appointment.duration}min)
          </div>
        </div>
      )}
    </div>
  );
};