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

  const [isOpen, setIsOpen] = useState(false);

  const entityTypeOptions = [
    { value: '', label: 'Todos los tipos' },
    { value: 'PACIENTE', label: 'Paciente' },
    { value: 'PRESUPUESTO', label: 'Presupuesto' },
    { value: 'TRATAMIENTO', label: 'Tratamiento' },
    { value: 'CITA', label: 'Cita' },
    { value: 'DOCUMENTO', label: 'Documento' },
  ];

  const actionOptions = [
    { value: '', label: 'Todas las acciones' },
    { value: 'CREATED', label: 'Creado' },
    { value: 'UPDATED', label: 'Actualizado' },
    { value: 'STATUS_CHANGED', label: 'Cambio de estado' },
    { value: 'DELETED', label: 'Eliminado' },
  ];

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

  const hasActiveFilters =
    filters.entityType !== '' ||
    filters.action !== '' ||
    filters.startDate !== '' ||
    filters.endDate !== '';

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="flex items-center gap-2 px-4 py-2 bg-cyan-50 border border-cyan-200 rounded-lg hover:bg-cyan-100 transition-colors disabled:opacity-50"
      >
        <Filter className="w-4 h-4 text-cyan-600" />
        <span className="text-sm font-medium text-cyan-700">Filtros avanzados</span>
        {hasActiveFilters && (
          <span className="ml-2 px-2 py-1 bg-cyan-600 text-white text-xs rounded-full font-medium">
            {Object.values(filters).filter((v) => v !== '').length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Tipo de entidad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de entidad
              </label>
              <select
                value={filters.entityType}
                onChange={(e) => handleFilterChange('entityType', e.target.value)}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
              >
                {entityTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Acción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Acción
              </label>
              <select
                value={filters.action}
                onChange={(e) => handleFilterChange('action', e.target.value)}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
              >
                {actionOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Fecha inicio */}
            <div>
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
            <div>
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
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleReset}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4" />
              Limpiar filtros
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export { AuditHistoryFilters };
