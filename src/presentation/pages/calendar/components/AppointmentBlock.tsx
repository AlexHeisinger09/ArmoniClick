// components/AppointmentBlock.tsx - Posicionamiento corregido y minimalista
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

  const getSlotIndex = (time: string) => {
    const [hour] = time.split(':').map(Number);
    return hour - 9; // Los slots empiezan a las 9:00
  };

  const slotIndex = getSlotIndex(appointment.time);
  
  // Configuración unificada de alturas para consistencia
  const SLOT_HEIGHTS = {
    week: {
      desktop: 64, // h-16 = 64px (4rem)
      mobile: 48   // h-12 = 48px (3rem)
    },
    day: {
      desktop: 80, // h-20 = 80px (5rem)
      mobile: 64   // h-16 = 64px (4rem)
    }
  };

  // Cálculo de posición corregido
  const getPositionStyle = (): React.CSSProperties => {
    const slotHeight = viewType === 'day' 
      ? SLOT_HEIGHTS.day.desktop 
      : SLOT_HEIGHTS.week.desktop;
    
    const slotHeightMobile = viewType === 'day'
      ? SLOT_HEIGHTS.day.mobile
      : SLOT_HEIGHTS.week.mobile;

    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      // Posición top corregida - debe coincidir exactamente con los slots
      top: `${slotIndex * slotHeight + 2}px`, // +2px para el border
      overflow: 'hidden',
      // Altura responsive usando calc para mayor precisión
      height: `${slotHeight - 4}px`, // -4px para borders y spacing
    };

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

  // Configuración responsive de texto y padding
  const getTextConfig = () => {
    if (viewType === 'day') {
      return {
        textSize: 'text-xs sm:text-sm',
        padding: isOverbook && appointmentIndex > 0 ? 'p-1' : 'p-2 sm:p-3'
      };
    } else {
      return {
        textSize: 'text-xs',
        padding: isOverbook && appointmentIndex > 0 ? 'p-1' : 'p-1 sm:p-2'
      };
    }
  };

  const { textSize, padding } = getTextConfig();

  return (
    <div
      className={`
        rounded-lg text-white shadow-md cursor-pointer transition-all duration-200
        border border-opacity-50 hover:shadow-lg active:scale-95
        ${getAppointmentStyles()}
        ${padding}
      `}
      style={getPositionStyle()}
      onClick={() => onEdit?.(appointment)}
    >
      {isOverbook && appointmentIndex > 0 ? (
        // Vista compacta para sobrecupos - Ultra minimalista
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
            <div className={`font-bold truncate ${textSize}`}>
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