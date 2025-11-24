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
    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
      <div className="flex flex-col sm:flex-row gap-4 items-end">
        {/* Fecha inicio */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            Desde
          </label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
          />
        </div>

        {/* Fecha fin */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            Hasta
          </label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
          />
        </div>

        {/* Botón Limpiar */}
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            <X className="w-4 h-4" />
            Limpiar
          </button>
        )}
      </div>
    </div>
  );
};

export { AuditHistoryFilters };
