// components/AppointmentBlock.tsx - Optimizado para móviles con diseño minimalista
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

  // Configuración responsive según la vista
  const config = viewType === 'day' ? {
    slotHeight: {
      mobile: 48, // 12 * 4 (h-12)
      desktop: 80  // 20 * 4 (h-20)
    },
    leftOffset: {
      mobile: 4,
      desktop: 8
    },
    rightOffset: {
      mobile: 4,
      desktop: 8
    },
    textSize: 'text-xs sm:text-sm',
    padding: 'p-2 sm:p-3'
  } : {
    slotHeight: {
      mobile: 48, // 12 * 4 (h-12)
      tablet: 56, // 14 * 4 (h-14)
      desktop: 64  // 16 * 4 (h-16)
    },
    leftOffset: {
      mobile: 2,
      desktop: 4
    },
    rightOffset: {
      mobile: 2,
      desktop: 4
    },
    textSize: 'text-xs',
    padding: 'p-1 sm:p-2'
  };

  const getSlotIndex = (time: string) => {
    const [hour] = time.split(':').map(Number);
    return hour - 9;
  };

  const slotIndex = getSlotIndex(appointment.time);
  
  // Cálculo responsive de posición
  const getPositionStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      top: `${slotIndex * (viewType === 'day' ? 64 : 56) + 2}px`, // Ajuste general
      overflow: 'hidden'
    };

    // Altura responsive usando CSS calc y variables CSS
    if (viewType === 'day') {
      baseStyle.height = 'calc(5rem - 8px)'; // h-20 - 8px en desktop
    } else {
      baseStyle.height = 'calc(3.5rem - 4px)'; // h-14 - 4px en tablet/desktop
    }

    // Ancho y posición según overlap
    if (isOverbook) {
      if (appointmentIndex === 0) {
        return {
          ...baseStyle,
          left: '4px',
          width: 'calc(65% - 2px)',
        };
      } else {
        return {
          ...baseStyle,
          right: '4px',
          width: 'calc(30% - 2px)',
        };
      }
    } else {
      return {
        ...baseStyle,
        left: '4px',
        right: '4px',
      };
    }
  };

  // Estilos de color minimalistas
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
        rounded-lg text-white shadow-md cursor-pointer transition-all duration-200
        border border-opacity-50 hover:shadow-lg active:scale-95
        ${getAppointmentStyles()}
        ${isOverbook && appointmentIndex > 0 ? 'p-1' : config.padding}
      `}
      style={getPositionStyle()}
      onClick={() => onEdit?.(appointment)}
    >
      {isOverbook && appointmentIndex > 0 ? (
        // Vista compacta para sobrecupos - Ultra minimalista en móvil
        <div className="text-xs h-full flex flex-col justify-center items-center space-y-0.5">
          <div className="font-bold truncate w-full text-center">
            {appointment.patient.split(' ')[0]}
          </div>
          <div className="text-[10px] opacity-90 bg-orange-400 px-1 rounded text-center whitespace-nowrap">
            Sobrecupo
          </div>
          <div className="text-[10px] opacity-75 text-center">{appointment.time}</div>
        </div>
      ) : (
        // Vista normal - Responsive y minimalista
        <div className="h-full flex flex-col justify-between">
          <div className="flex-1 flex flex-col justify-center space-y-1">
            {/* Nombre del paciente - Responsive */}
            <div className={`font-bold truncate ${config.textSize}`}>
              <span className="sm:hidden">{appointment.patient.split(' ')[0]}</span>
              <span className="hidden sm:inline">{appointment.patient}</span>
            </div>
            
            {/* Servicio - Solo en desktop/tablet */}
            <div className={`truncate opacity-90 text-xs hidden sm:block`}>
              {appointment.service}
            </div>
          </div>
          
          {/* Footer - Información minimal */}
          <div className="text-xs opacity-75 flex justify-between items-center">
            <span className="text-xs">{appointment.time}</span>
            <span className="bg-white bg-opacity-20 px-1 py-0.5 rounded text-xs hidden sm:inline">
              {appointment.duration}min
            </span>
            {/* Solo duración en móvil */}
            <span className="bg-white bg-opacity-20 px-1 py-0.5 rounded text-xs sm:hidden">
              {appointment.duration}'
            </span>
          </div>
        </div>
      )}
    </div>
  );
};