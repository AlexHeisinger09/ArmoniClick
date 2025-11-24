import React, { useState } from 'react';
import { Filter, X, Calendar } from 'lucide-react';

export interface FilterState {
  entityType: string;
  action: string;
  startDate: string;
  endDate: string;
}

interface AuditHistoryFiltersProps {
  onFiltersChange: (filters: FilterState) => void;
  isLoading?: boolean;
}

const AuditHistoryFilters: React.FC<AuditHistoryFiltersProps> = ({
  onFiltersChange,
  isLoading = false,
}) => {
  const [filters, setFilters] = useState<FilterState>({
    entityType: '',
    action: '',
    startDate: '',
    endDate: '',
  });

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      entityType: '',
      action: '',
      startDate: '',
      endDate: '',
    };
    setFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  const hasActiveFilters = filters.startDate !== '' || filters.endDate !== '';

  return (
    <div className="p-3 sm:p-4 bg-gray-50 border border-gray-200 rounded-lg overflow-x-auto">
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-end min-w-max sm:min-w-0">
        {/* Fecha inicio */}
        <div className="flex-shrink-0 w-full sm:flex-1">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2 flex items-center gap-1 whitespace-nowrap">
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="hidden sm:inline">Desde</span>
            <span className="sm:hidden">Inicio</span>
          </label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
            disabled={isLoading}
            className="w-full px-2 sm:px-3 py-1 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
          />
        </div>

        {/* Fecha fin */}
        <div className="flex-shrink-0 w-full sm:flex-1">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2 flex items-center gap-1 whitespace-nowrap">
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="hidden sm:inline">Hasta</span>
            <span className="sm:hidden">Fin</span>
          </label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
            disabled={isLoading}
            className="w-full px-2 sm:px-3 py-1 sm:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
          />
        </div>

        {/* Botón Limpiar */}
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            disabled={isLoading}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap flex-shrink-0"
          >
            <X className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Limpiar</span>
            <span className="sm:hidden">Limpiar</span>
          </button>
        )}
      </div>
    </div>
  );
};

export { AuditHistoryFilters };
