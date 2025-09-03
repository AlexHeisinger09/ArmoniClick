// src/presentation/pages/calendar/components/StatusLegend.tsx - MEJORADO PARA MÓVILES
import React from 'react';
import { CheckCircle, Clock, XCircle, UserX, Calendar, Info } from 'lucide-react';

interface StatusLegendProps {
  className?: string;
  compact?: boolean;
}

export const StatusLegend: React.FC<StatusLegendProps> = ({ 
  className = '', 
  compact = false 
}) => {
  const statusItems = [
    {
      status: 'confirmed',
      label: 'Confirmada',
      shortLabel: 'Conf.',
      icon: CheckCircle,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-700',
      bgColor: 'bg-emerald-50'
    },
    {
      status: 'pending',
      label: 'Pendiente', 
      shortLabel: 'Pend.',
      icon: Clock,
      color: 'bg-blue-500',
      textColor: 'text-blue-700',
      bgColor: 'bg-blue-50'
    },
    {
      status: 'cancelled',
      label: 'Cancelada',
      shortLabel: 'Canc.',
      icon: XCircle,
      color: 'bg-red-400',
      textColor: 'text-red-700',
      bgColor: 'bg-red-50'
    },
    {
      status: 'no-show',
      label: 'No asistió',
      shortLabel: 'No fue',
      icon: UserX,
      color: 'bg-gray-500',
      textColor: 'text-gray-700',
      bgColor: 'bg-gray-50'
    }
  ];

  if (compact) {
    return (
      <div className={`flex items-center space-x-2 sm:space-x-3 ${className}`}>
        <div className="flex items-center text-xs text-slate-500 flex-shrink-0">
          <Info className="w-3 h-3 mr-1" />
          <span className="hidden sm:inline">Estados:</span>
          <span className="sm:hidden">•</span>
        </div>
        <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto pb-1">
          {statusItems.map((item) => {
            return (
              <div key={item.status} className="flex items-center space-x-1 flex-shrink-0 bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-sm">
                <div className={`w-2 h-2 rounded-full ${item.color} flex-shrink-0`}></div>
                <span className="text-xs text-slate-600 font-medium whitespace-nowrap">
                  <span className="sm:hidden">{item.shortLabel}</span>
                  <span className="hidden sm:inline">{item.label}</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-slate-200 p-3 sm:p-4 shadow-sm ${className}`}>
      <div className="flex items-center mb-2 sm:mb-3">
        <Info className="w-4 h-4 text-slate-500 mr-2" />
        <h3 className="text-sm font-semibold text-slate-700">Estados de las citas</h3>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
        {statusItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <div 
              key={item.status} 
              className={`flex items-center space-x-1.5 sm:space-x-2 p-2 rounded-lg ${item.bgColor} transition-colors border ${item.bgColor.replace('bg-', 'border-').replace('-50', '-200')}`}
            >
              <div className="flex items-center space-x-1">
                <div className={`w-3 h-3 rounded-full ${item.color} flex-shrink-0`}></div>
                <IconComponent className={`w-3 h-3 ${item.textColor} flex-shrink-0`} />
              </div>
              <span className={`text-xs font-medium ${item.textColor} truncate`}>
                <span className="sm:hidden">{item.shortLabel}</span>
                <span className="hidden sm:inline">{item.label}</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};