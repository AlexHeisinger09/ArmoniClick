// components/CalendarHeader.tsx
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ViewMode } from '../types/calendar';
import { monthNames } from '../constants/calendar';
import { getWeekDays } from '../utils/calendar';

interface CalendarHeaderProps {
  currentDate: Date;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onNavigate: (direction: number) => void;
  onToday: () => void;
  onDateSelect?: (date: Date) => void; // Nueva prop para seleccionar fecha
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  viewMode,
  onViewModeChange,
  onNavigate,
  onToday,
  onDateSelect // Nueva prop
}) => {
  const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const monthNamesShort = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dec'];

  const getHeaderContent = () => {
    switch (viewMode) {
      case 'month':
        return (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <h2 className="text-base sm:text-lg font-semibold text-slate-700">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <button
                onClick={() => onNavigate(-1)}
                className="p-1.5 hover:bg-slate-100 rounded-full transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </button>
              <button
                onClick={() => onNavigate(1)}
                className="p-1.5 hover:bg-slate-100 rounded-full transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </div>
        );

      case 'week':
        return (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <h2 className="text-base sm:text-lg font-semibold text-slate-700">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <button
                onClick={() => onNavigate(-1)}
                className="p-1.5 hover:bg-slate-100 rounded-full transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </button>
              <button
                onClick={() => onNavigate(1)}
                className="p-1.5 hover:bg-slate-100 rounded-full transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </div>
        );

      case 'day':
        const weekDaysForDay = getWeekDays(currentDate);
        
        return (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <button
                onClick={() => onNavigate(-1)}
                className="p-1.5 hover:bg-slate-100 rounded-full transition-colors flex-shrink-0"
              >
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </button>
              
              {/* Selector de días responsive */}
              <div className="flex items-center space-x-0.5 sm:space-x-1 overflow-x-auto">
                {weekDaysForDay.map((day, index) => {
                  const isSelectedDay = day.toDateString() === currentDate.toDateString();
                  
                  return (
                    <div key={index} className="flex flex-col items-center flex-shrink-0">
                      <div className="text-xs font-medium text-slate-600 mb-1">
                        {dayNames[index]}
                      </div>
                      <div 
                        className={`
                          flex flex-col items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full text-xs sm:text-sm font-semibold transition-colors cursor-pointer
                          ${isSelectedDay 
                            ? 'bg-cyan-500 text-white shadow-md' 
                            : 'text-slate-700 hover:bg-slate-100'
                          }
                        `}
                        onClick={() => onDateSelect?.(day)}
                      >
                        <div>{day.getDate()}</div>
                      </div>
                      <div className="text-xs text-slate-400 mt-1 hidden sm:block">
                        {monthNamesShort[day.getMonth()].toUpperCase()}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => onNavigate(1)}
                className="p-1.5 hover:bg-slate-100 rounded-full transition-colors flex-shrink-0"
              >
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            {/* Espacio vacío para mantener el diseño equilibrado */}
            <div></div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white border-b border-slate-200">
      {/* Selector de vista responsive */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-100">
        <div className="flex bg-slate-100 rounded-lg p-0.5">
          <button
            onClick={() => onViewModeChange('day')}
            className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm rounded-md transition-colors font-medium ${
              viewMode === 'day'
                ? 'bg-white text-slate-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Día
          </button>
          <button
            onClick={() => onViewModeChange('week')}
            className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm rounded-md transition-colors font-medium ${
              viewMode === 'week'
                ? 'bg-white text-slate-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Semana
          </button>
          <button
            onClick={() => onViewModeChange('month')}
            className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm rounded-md transition-colors font-medium ${
              viewMode === 'month'
                ? 'bg-white text-slate-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Mes
          </button>
        </div>

        <button
          onClick={onToday}
          className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          Hoy
        </button>
      </div>

      {/* Navegación específica por vista responsive */}
      <div className="px-4 sm:px-6 py-3 sm:py-4">
        {getHeaderContent()}
      </div>
    </div>
  );
};