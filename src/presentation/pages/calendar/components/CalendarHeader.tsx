// components/CalendarHeader.tsx - Diseño moderno con colores cyan
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
  onDateSelect?: (date: Date) => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  viewMode,
  onViewModeChange,
  onNavigate,
  onToday,
  onDateSelect
}) => {
  const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const monthNamesShort = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dec'];

  const getHeaderContent = () => {
    switch (viewMode) {
      case 'month':
        return (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <button
                onClick={() => onNavigate(-1)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              </button>
              <button
                onClick={() => onNavigate(1)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </div>
        );

      case 'week':
        return (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <button
                onClick={() => onNavigate(-1)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              </button>
              <button
                onClick={() => onNavigate(1)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </div>
        );

      case 'day':
        const isToday = currentDate.toDateString() === new Date().toDateString();

        return (
          <div className="flex items-center justify-between w-full px-2">
            {/* Botón Anterior */}
            <button
              onClick={() => onNavigate(-1)}
              className="p-3 hover:bg-slate-100 rounded-full transition-all duration-200 hover:scale-105 shadow-sm"
            >
              <ChevronLeft className="w-6 h-6 text-slate-600" />
            </button>

            {/* Información del día - Diseño elegante */}
            <div className="flex flex-col items-center space-y-2">
              {/* Año y Mes */}
              <div className="flex items-center space-x-2 text-slate-500">
                <span className="text-sm font-medium uppercase tracking-widest">
                  {monthNames[currentDate.getMonth()]}
                </span>
                <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                <span className="text-sm font-medium">
                  {currentDate.getFullYear()}
                </span>
              </div>

              {/* Día destacado */}
              <div className="flex flex-col items-center">
                <div className="text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">
                  {dayNames[(currentDate.getDay() + 6) % 7]}
                </div>
                <div className={`
          relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center 
          text-2xl sm:text-3xl font-bold transition-all duration-300 shadow-lg
          ${isToday
                    ? 'bg-gradient-to-br from-cyan-400 to-cyan-600 text-white shadow-cyan-200'
                    : 'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-800 shadow-slate-200'
                  }
        `}>
                  {/* Efecto de brillo */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/20 to-transparent"></div>
                  <span className="relative z-10">{currentDate.getDate()}</span>

                  {/* Indicador de "hoy" */}
                  {isToday && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-400 rounded-full border-2 border-white shadow-md">
                      <div className="w-full h-full bg-orange-400 rounded-full animate-pulse"></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Información adicional sutil */}
              <div className="flex items-center space-x-1 text-xs text-slate-400">
                <span>Semana {Math.ceil(currentDate.getDate() / 7)}</span>
              </div>
            </div>

            {/* Botón Siguiente */}
            <button
              onClick={() => onNavigate(1)}
              className="p-3 hover:bg-slate-100 rounded-full transition-all duration-200 hover:scale-105 shadow-sm"
            >
              <ChevronRight className="w-6 h-6 text-slate-600" />
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white border-b border-slate-200">
      {/* Selector de vista responsive con diseño moderno */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-100">
        <div className="flex bg-slate-100 rounded-xl p-1 shadow-sm">
          <button
            onClick={() => onViewModeChange('day')}
            className={`px-4 sm:px-5 py-2 text-sm sm:text-base rounded-lg transition-all duration-200 font-semibold ${viewMode === 'day'
              ? 'bg-white text-slate-800 shadow-sm scale-105'
              : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
              }`}
          >
            Día
          </button>
          <button
            onClick={() => onViewModeChange('week')}
            className={`px-4 sm:px-5 py-2 text-sm sm:text-base rounded-lg transition-all duration-200 font-semibold ${viewMode === 'week'
              ? 'bg-white text-slate-800 shadow-sm scale-105'
              : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
              }`}
          >
            Semana
          </button>
          <button
            onClick={() => onViewModeChange('month')}
            className={`px-4 sm:px-5 py-2 text-sm sm:text-base rounded-lg transition-all duration-200 font-semibold ${viewMode === 'month'
              ? 'bg-white text-slate-800 shadow-sm scale-105'
              : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
              }`}
          >
            Mes
          </button>
        </div>

        <button
          onClick={onToday}
          className="px-4 sm:px-5 py-2 text-sm sm:text-base font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200 hover:border-slate-300"
        >
          Hoy
        </button>
      </div>

      {/* Navegación específica por vista responsive */}
      <div className="px-4 sm:px-6 py-4 sm:py-5">
        {getHeaderContent()}
      </div>
    </div>
  );
};