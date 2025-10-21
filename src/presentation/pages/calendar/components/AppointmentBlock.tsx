// components/AppointmentBlock.tsx - CON MENÚ CONTEXTUAL
import React, { useEffect, useState } from 'react';
import { CalendarAppointment, AppointmentsData } from '../types/calendar';
import { formatDateKey } from '../utils/calendar';

interface AppointmentBlockProps {
  appointment: CalendarAppointment;
  date: Date;
  appointments: AppointmentsData;
  viewType?: 'week' | 'day' | 'month';
  onEdit?: (appointment: CalendarAppointment) => void;
  onClick?: (appointment: CalendarAppointment, event: React.MouseEvent) => void;
}

export const AppointmentBlock: React.FC<AppointmentBlockProps> = ({
  appointment,
  date,
  appointments,
  viewType = 'week',
  onEdit,
  onClick
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
  const appointmentIndex = sameTimeAppointments.findIndex(app => app.id === appointment.id);
  const isOverbook = sameTimeAppointments.length > 1;

  const getSlotIndex = (time: string) => {
    const [hour] = time.split(':').map(Number);
    return hour - 9;
  };

  const slotIndex = getSlotIndex(appointment.time);
  
  const SLOT_HEIGHTS = {
    week: {
      desktop: 64,
      mobile: 48
    },
    day: {
      desktop: 80,
      mobile: 80
    },
    month: {
      desktop: 24,
      mobile: 20
    }
  };

  const getPositionStyle = (): React.CSSProperties => {
    if (viewType === 'month') {
      return {};
    }

    const heights = SLOT_HEIGHTS[viewType];
    const slotHeight = isMobile ? heights.mobile : heights.desktop;
    
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      top: `${slotIndex * slotHeight + 2}px`,
      height: `${slotHeight - 4}px`,
      overflow: 'hidden',
    };

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

  const getAppointmentStyles = () => {
    switch (appointment.status) {
      case 'confirmed':
        return {
          background: 'bg-emerald-200 hover:bg-emerald-300',
          border: 'border-emerald-300',
          text: 'text-emerald-900',
          dot: 'bg-emerald-500'
        };
      case 'pending':
        return {
          background: 'bg-blue-200 hover:bg-blue-300',
          border: 'border-blue-300',
          text: 'text-blue-900',
          dot: 'bg-blue-500'
        };
      case 'cancelled':
        return {
          background: 'bg-red-100 hover:bg-red-200',
          border: 'border-red-200',
          text: 'text-red-800',
          dot: 'bg-red-400'
        };
      case 'no-show':
        return {
          background: 'bg-gray-200 hover:bg-gray-300',
          border: 'border-gray-300',
          text: 'text-gray-700',
          dot: 'bg-gray-500'
        };
      case 'completed':
        return {
          background: 'bg-green-200 hover:bg-green-300',
          border: 'border-green-300',
          text: 'text-green-800',
          dot: 'bg-green-500'
        };
      default:
        return {
          background: 'bg-indigo-200 hover:bg-indigo-300',
          border: 'border-indigo-300',
          text: 'text-indigo-900',
          dot: 'bg-indigo-500'
        };
    }
  };

  const colors = getAppointmentStyles();

  const renderContent = () => {
    switch (viewType) {
      case 'month':
        return (
          <div className="flex items-center space-x-1 min-w-0">
            <div className={`w-1.5 h-1.5 rounded-full ${colors.dot} flex-shrink-0`}></div>
            <span className="text-xs font-medium truncate">
              {appointment.patient}
            </span>
          </div>
        );
      
      case 'week':
        if (isOverbook && appointmentIndex > 0) {
          return (
            <div className="text-xs h-full flex flex-col justify-center items-center space-y-0.5 p-1">
              <div className="font-bold truncate w-full text-center">
                {appointment.patient.split(' ')[0]}
              </div>
              <div className="text-[10px] text-center opacity-80">
                {appointment.time}
              </div>
            </div>
          );
        }
        
        return (
          <div className="h-full flex flex-col justify-center p-2">
            <div className="font-semibold text-xs truncate mb-1">
              {isMobile ? appointment.patient.split(' ')[0] : appointment.patient}
            </div>
            <div className="text-xs opacity-80 font-medium">
              {appointment.time}
            </div>
          </div>
        );
      
      case 'day':
        if (isOverbook && appointmentIndex > 0) {
          return (
            <div className="text-xs h-full flex flex-col justify-center items-center space-y-1 p-2">
              <div className="font-bold truncate w-full text-center">
                {appointment.patient.split(' ')[0]}
              </div>
              <div className="text-[10px] text-center opacity-80">
                {appointment.time}
              </div>
              <div className="text-[9px] text-center opacity-70 leading-tight">
                {appointment.service}
              </div>
            </div>
          );
        }
        
        return (
          <div className="h-full flex flex-col justify-between p-3">
            <div className="flex-1 flex flex-col justify-center space-y-1">
              <div className="font-bold text-sm truncate">
                {appointment.patient}
              </div>
              <div className="text-xs opacity-90 truncate">
                {appointment.service}
              </div>
            </div>
            <div className="text-xs opacity-75 flex justify-between items-center">
              <span className="font-medium">{appointment.time}</span>
              <div className={`w-2 h-2 rounded-full ${colors.dot}`}></div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) {
      onClick(appointment, e);
    }
  };

  const baseClasses = `
    rounded-lg cursor-pointer transition-all duration-200
    border border-opacity-60 hover:shadow-md active:scale-95
    ${colors.background} ${colors.border} ${colors.text}
    ${viewType === 'month' ? 'p-1' : ''}
  `;

  return (
    <div
      className={baseClasses}
      style={getPositionStyle()}
      onClick={handleClick}
      title={`${appointment.patient} - ${appointment.service} (${appointment.time})`}
    >
      {renderContent()}
    </div>
  );
};