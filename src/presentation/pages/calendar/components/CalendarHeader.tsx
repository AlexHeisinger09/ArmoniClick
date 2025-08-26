// components/CalendarHeader.tsx - Con leyenda de estados sutil
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ViewMode } from '../types/calendar';
import { monthNames } from '../constants/calendar';
import { StatusLegend } from './StatusLegend';

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

  const getNavigationContent = () => {
    switch (viewMode) {
      case 'month':
      case 'week':
        return (
          <div className="flex items-center justify-center w-full">
            <button
              onClick={() => onNavigate(-1)}
              className="p-3 hover:bg-slate-100 rounded-full transition-all duration-200 hover:scale-105"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        );

      case 'day':
        // Generar días para el carrusel (7 días: 3 anteriores, actual, 3 posteriores)
        const carouselDays = [];
        for (let i = -3; i <= 3; i++) {
          const day = new Date(currentDate);
          day.setDate(currentDate.getDate() + i);
          carouselDays.push(day);
        }

        const today = new Date();
        const isToday = (date: Date) => date.toDateString() === today.toDateString();

        return (
          <div className="flex items-center justify-center w-full px-2 sm:px-4">
            {/* Botón anterior */}
            <button
              onClick={() => onNavigate(-1)}
              className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-full transition-all duration-200 hover:scale-105 mr-2 sm:mr-4 flex-shrink-0"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
            </button>

            {/* Carrusel de días - Responsive */}
            <div className="flex items-center justify-center overflow-hidden flex-1 max-w-2xl">
              <div className="flex items-center space-x-1 sm:space-x-2">
                {carouselDays.map((day, index) => {
                  const isCurrentDay = day.toDateString() === currentDate.toDateString();
                  const isTodayDay = isToday(day);
                  const dayName = dayNames[(day.getDay() + 6) % 7];
                  
                  // Responsive visibility - ocultar días extremos en móvil
                  const isHiddenOnMobile = (index === 0 || index === 6);
                  
                  return (
                    <button
                      key={index}
                      onClick={() => onDateSelect?.(day)}
                      className={`
                        relative flex flex-col items-center rounded-2xl transition-all duration-300 
                        p-2 sm:p-3 min-w-[48px] sm:min-w-[64px]
                        ${isCurrentDay 
                          ? 'bg-cyan-500 text-white shadow-lg z-10' 
                          : 'hover:bg-slate-100 text-slate-700 hover:scale-102'
                        }
                        ${index === 0 || index === 6 ? 'opacity-40 scale-90 hidden sm:flex' : ''}
                        ${index === 1 || index === 5 ? 'opacity-70 scale-95' : ''}
                      `}
                    >
                      {/* Nombre del día */}
                      <span className="text-xs font-medium uppercase tracking-wider mb-1">
                        {dayName}
                      </span>
                      
                      {/* Número del día */}
                      <span className="text-base sm:text-lg font-bold">
                        {day.getDate()}
                      </span>
                      
                      {/* Mes (solo si es diferente al actual) */}
                      {day.getMonth() !== currentDate.getMonth() && (
                        <span className="text-xs opacity-75 mt-1">
                          {monthNames[day.getMonth()].substring(0, 3)}
                        </span>
                      )}
                      
                      {/* Indicador de "hoy" */}
                      {isTodayDay && !isCurrentDay && (
                        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-orange-400 rounded-full border border-white"></div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Botón siguiente */}
            <button
              onClick={() => onNavigate(1)}
              className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-full transition-all duration-200 hover:scale-105 ml-2 sm:ml-4 flex-shrink-0"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
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

      {/* Header unificado con Mes y Año - Diseño elegante */}
      <div className="px-4 sm:px-6 py-6 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
        <div className="flex items-center justify-between">
          {/* Mes y Año centrados con diseño elegante */}
          <div className="flex-1 flex justify-center">
            <div className="flex flex-col items-center space-y-2">
              {/* Año con estilo sutil */}
              <div className="text-sm font-medium text-slate-500 uppercase tracking-widest">
                {currentDate.getFullYear()}
              </div>
              
              {/* Mes destacado */}
              <h1 className="text-3xl sm:text-4xl font-light text-slate-800 tracking-wide">
                {monthNames[currentDate.getMonth()]}
              </h1>
              
              {/* Línea decorativa */}
              <div className="w-16 h-0.5 bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-full"></div>
            </div>
          </div>

          {/* Navegación lateral para mes y semana */}
          {(viewMode === 'month' || viewMode === 'week') && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onNavigate(-1)}
                className="p-3 hover:bg-slate-100 rounded-full transition-all duration-200 hover:scale-105 shadow-sm"
              >
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              </button>
              <button
                onClick={() => onNavigate(1)}
                className="p-3 hover:bg-slate-100 rounded-full transition-all duration-200 hover:scale-105 shadow-sm"
              >
                <ChevronRight className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 🎨 LEYENDA DE ESTADOS SUTIL */}
      <div className="px-4 sm:px-6 py-3 bg-slate-50 border-b border-slate-100">
        <StatusLegend compact className="justify-center" />
      </div>

      {/* Navegación específica para vista diaria */}
      {viewMode === 'day' && (
        <div className="px-4 sm:px-6 py-4 bg-white">
          {getNavigationContent()}
        </div>
      )}
    </div>
  );
};