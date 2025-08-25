// components/AppointmentBlock.tsx - TIPOS CORREGIDOS
import React, { useEffect, useState } from 'react';
import { CalendarAppointment, AppointmentsData } from '../types/calendar';
import { formatDateKey } from '../utils/calendar';

interface AppointmentBlockProps {
  appointment: CalendarAppointment; // ✅ Usar CalendarAppointment
  date: Date;
  appointments: AppointmentsData;
  viewType?: 'week' | 'day';
  onEdit?: (appointment: CalendarAppointment) => void; // ✅ Usar CalendarAppointment
}

export const AppointmentBlock: React.FC<AppointmentBlockProps> = ({
  appointment,
  date,
  appointments,
  viewType = 'week',
  onEdit
}) => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const dateKey = formatDateKey(date);
  const dayAppointments = appointments[dateKey] || [];
  const sameTimeAppointments = dayAppointments.filter(app => app.time === appointment.time);
  const appointmentIndex = sameTimeAppointments.findIndex(app => app.id === appointment.id); // ✅ Ahora ambos son string
  const isOverbook = sameTimeAppointments.length > 1;

  const getSlotIndex = (time: string) => {
    const [hour] = time.split(':').map(Number);
    return hour - 9; // Los slots empiezan a las 9:00
  };

  const slotIndex = getSlotIndex(appointment.time);
  
  // Configuración de alturas exactas para cada vista y dispositivo
  const SLOT_HEIGHTS = {
    week: {
      desktop: 64, // h-16 = 64px
      mobile: 48   // h-12 = 48px
    },
    day: {
      desktop: 80, // h-20 = 80px
      mobile: 80   // h-20 = 80px
    }
  };

  // Cálculo de posición completamente responsive
  const getPositionStyle = (): React.CSSProperties => {
    const heights = SLOT_HEIGHTS[viewType];
    const slotHeight = isMobile ? heights.mobile : heights.desktop;
    
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      top: `${slotIndex * slotHeight + 2}px`, // +2px para border
      height: `${slotHeight - 4}px`, // -4px para spacing
      overflow: 'hidden',
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

  // PALETA SUAVE Y ELEGANTE - Colores distintivos pero no agresivos
  const getAppointmentStyles = () => {
    switch (appointment.status) {
      case 'confirmed':
        return {
          background: 'bg-teal-300 hover:bg-teal-400',
          border: 'border-teal-400',
          text: 'text-teal-900',
          shadow: 'shadow-teal-100'
        };
      case 'pending':
        return {
          background: 'bg-sky-300 hover:bg-sky-400',
          border: 'border-sky-400',
          text: 'text-sky-900',
          shadow: 'shadow-sky-100'
        };
      case 'cancelled':
        return {
          background: 'bg-rose-200 hover:bg-rose-300',
          border: 'border-rose-300',
          text: 'text-rose-800',
          shadow: 'shadow-rose-100'
        };
      case 'no-show':
        return {
          background: 'bg-slate-200 hover:bg-slate-300',
          border: 'border-slate-300',
          text: 'text-slate-700',
          shadow: 'shadow-slate-100'
        };
      case 'completed':
        return {
          background: 'bg-green-200 hover:bg-green-300',
          border: 'border-green-300',
          text: 'text-green-800',
          shadow: 'shadow-green-100'
        };
      default:
        return {
          background: 'bg-indigo-300 hover:bg-indigo-400',
          border: 'border-indigo-400',
          text: 'text-indigo-900',
          shadow: 'shadow-indigo-100'
        };
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
  const colors = getAppointmentStyles();

  // Etiquetas de estado en español
  const getStatusLabel = () => {
    switch (appointment.status) {
      case 'confirmed':
        return 'confirmada';
      case 'pending':
        return 'pendiente';
      case 'cancelled':
        return 'cancelada';
      case 'no-show':
        return 'no asistió';
      case 'completed':
        return 'completada';
      default:
        return 'pendiente';
    }
  };

  // Indicadores suaves de estado
  const getStatusBadge = () => {
    switch (appointment.status) {
      case 'confirmed':
        return { label: 'Confirmada', bgColor: 'bg-teal-500' };
      case 'pending':
        return { label: 'Pendiente', bgColor: 'bg-sky-500' };
      case 'cancelled':
        return { label: 'Cancelada', bgColor: 'bg-rose-400' };
      case 'no-show':
        return { label: 'No asistió', bgColor: 'bg-slate-400' };
      case 'completed':
        return { label: 'Completada', bgColor: 'bg-green-500' };
      default:
        return { label: 'Sobrecupo', bgColor: 'bg-orange-400' };
    }
  };

  return (
    <div
      className={`
        rounded-lg shadow-md cursor-pointer transition-all duration-200
        border border-opacity-60 hover:shadow-lg active:scale-95
        ${colors.background} ${colors.border} ${colors.text} ${colors.shadow}
        ${padding}
      `}
      style={getPositionStyle()}
      onClick={() => onEdit?.(appointment)}
    >
      {isOverbook && appointmentIndex > 0 ? (
        // Vista compacta para sobrecupos
        <div className="text-xs h-full flex flex-col justify-center items-center space-y-0.5">
          <div className="font-bold truncate w-full text-center">
            {appointment.patient.split(' ')[0]}
          </div>
          <div className={`text-[10px] text-white px-1 rounded text-center whitespace-nowrap ${getStatusBadge().bgColor}`}>
            {isOverbook ? 'Sobrecupo' : getStatusLabel()}
          </div>
          <div className="text-[10px] opacity-75 text-center">{getStatusLabel()}</div>
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
          
          {/* Footer - Solo estado */}
          <div className="text-xs opacity-75 flex justify-between items-center">
            {/* Estado de la cita */}
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${getStatusBadge().bgColor}`}></div>
              <span className="text-xs capitalize">{getStatusLabel()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};