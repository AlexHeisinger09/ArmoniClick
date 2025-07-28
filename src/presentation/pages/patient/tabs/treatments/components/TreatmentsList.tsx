// src/presentation/pages/patient/tabs/treatments/components/TreatmentsList.tsx
import React from 'react';
import { Plus, Package } from 'lucide-react';
import { TreatmentsListProps } from '../shared/types';
import { TreatmentCard } from './TreatmentCard';

const TreatmentsList: React.FC<TreatmentsListProps> = ({
  treatments,
  loading,
  onView,
  onEdit,
  onDelete,
  onNewTreatment,
  isLoadingDelete = false
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-cyan-200 p-6">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-6">
            <div className="h-6 bg-gray-200 rounded w-48"></div>
            <div className="h-10 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-cyan-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-700">
          Tratamientos del Paciente
        </h3>
        <button 
          onClick={onNewTreatment}
          className="flex items-center bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg text-sm px-4 py-2 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Tratamiento
        </button>
      </div>

      <div className="space-y-4">
        {treatments.map((treatment) => (
          <TreatmentCard
            key={treatment.id_tratamiento}
            treatment={treatment}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
            isLoadingDelete={isLoadingDelete}
          />
        ))}

        {treatments.length === 0 && (
          <div className="text-center py-8">
            <div className="mb-4">
              <Package className="w-16 h-16 mx-auto text-gray-300" />
            </div>
            <p className="text-slate-500 mb-4">No hay tratamientos registrados para este paciente</p>
            <button 
              onClick={onNewTreatment}
              className="flex items-center mx-auto bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg text-sm px-4 py-2 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar Primer Tratamiento
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export { TreatmentsList };