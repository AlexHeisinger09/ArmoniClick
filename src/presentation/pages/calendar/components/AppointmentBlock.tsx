// components/AppointmentBlock.tsx - Diseño moderno con colores cyan
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

  // Configuración según la vista con diseño moderno
  const config = viewType === 'day' ? {
    slotHeight: 80, // Más espacio en vista diaria (20px * 4)
    leftOffset: 8,
    rightOffset: 8,
    textSize: 'text-sm',
    padding: 'p-3'
  } : {
    slotHeight: 64, // Altura moderada en vista semanal (16px * 4)
    leftOffset: 4,
    rightOffset: 4,
    textSize: 'text-xs',
    padding: 'p-2'
  };

  const getSlotIndex = (time: string) => {
    const [hour] = time.split(':').map(Number);
    return hour - 9;
  };

  const slotIndex = getSlotIndex(appointment.time);
  const topOffset = slotIndex * config.slotHeight + 4;
  const blockHeight = config.slotHeight - 8;

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
        width: '65%',
        right: 'auto'
      };
    } else {
      positionStyle = {
        ...positionStyle,
        right: `${config.rightOffset}px`,
        width: '30%',
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

  // Diseño moderno con colores cyan
  const getAppointmentStyles = () => {
    if (appointment.status === 'confirmed') {
      return 'bg-cyan-500 hover:bg-cyan-600 border-cyan-600 shadow-cyan-100';
    } else {
      return 'bg-cyan-400 hover:bg-cyan-500 border-cyan-500 shadow-cyan-50';
    }
  };

  return (
    <div
      className={`
        absolute rounded-lg text-white shadow-md cursor-pointer transition-all duration-200
        border border-opacity-50 hover:shadow-lg hover:scale-105
        ${getAppointmentStyles()}
        ${isOverbook && appointmentIndex > 0 ? 'p-1.5' : config.padding}
      `}
      style={positionStyle}
      onClick={() => onEdit?.(appointment)}
    >
      {isOverbook && appointmentIndex > 0 ? (
        // Sobrecupo - vista compacta y moderna
        <div className="text-xs h-full flex flex-col justify-center space-y-0.5">
          <div className="font-bold truncate">{appointment.patient.split(' ')[0]}</div>
          <div className="text-xs opacity-90 truncate bg-orange-400 px-1 rounded text-center">
            Sobrecupo
          </div>
          <div className="text-xs opacity-75 text-center">{appointment.time}</div>
        </div>
      ) : (
        // Cita normal - vista completa y elegante
        <div className="h-full flex flex-col justify-between">
          <div className="flex-1 flex flex-col justify-center space-y-1">
            <div className={`font-bold truncate ${config.textSize}`}>
              {appointment.patient}
            </div>
            <div className={`truncate opacity-90 ${config.textSize === 'text-sm' ? 'text-xs' : 'text-xs'}`}>
              {appointment.service}
            </div>
          </div>
          <div className={`opacity-75 ${config.textSize === 'text-sm' ? 'text-xs' : 'text-xs'} flex justify-between items-center`}>
            <span>{appointment.time}</span>
            <span className="bg-white bg-opacity-20 px-1.5 py-0.5 rounded text-xs">
              {appointment.duration}min
            </span>
          </div>
        </div>
      )}
    </div>
  );
};