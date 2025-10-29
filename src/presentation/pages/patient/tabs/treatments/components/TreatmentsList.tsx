// src/presentation/pages/patient/tabs/treatments/components/TreatmentsList.tsx - ACTUALIZADO PARA NUEVO LAYOUT
import React from 'react';
import { Plus, Package, FileText, AlertCircle } from 'lucide-react';
import { Treatment, BudgetSummary } from "@/core/use-cases/treatments";
import { TreatmentCard } from './TreatmentCard';

interface TreatmentsListProps {
  treatments: Treatment[];
  loading: boolean;
  selectedBudget?: BudgetSummary | null;
  onView: (treatment: Treatment) => void;
  onEdit: (treatment: Treatment) => void;
  onComplete: (treatmentId: number) => void;
  onDelete: (treatmentId: number) => void;
  onNewTreatment: () => void;
  isLoadingDelete?: boolean;
  isLoadingComplete?: boolean;
  showEmptyState?: boolean;
}

const TreatmentsList: React.FC<TreatmentsListProps> = ({
  treatments,
  loading,
  selectedBudget,
  onView,
  onEdit,
  onComplete,
  onDelete,
  onNewTreatment,
  isLoadingDelete = false,
  isLoadingComplete = false,
  showEmptyState = false
}) => {
  if (loading) {
    return (
      <div className="bg-white h-full rounded-xl border border-cyan-200">
        {/* Content skeleton */}
        <div className="p-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Estado vacío cuando no hay presupuesto seleccionado
  if (showEmptyState) {
    return (
      <div className="bg-white h-full rounded-xl border border-cyan-200 flex flex-col">
        {/* Empty state */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="mb-4">
              <FileText className="w-16 h-16 mx-auto text-gray-300" />
            </div>
            <h4 className="text-lg font-medium text-slate-700 mb-2">
              No hay tratamientos generados
            </h4>
            <p className="text-slate-500 mb-4 max-w-sm">
              Los tratamientos se generan automáticamente al activar un presupuesto.
              Selecciona o activa un presupuesto para comenzar.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white h-full rounded-xl border border-cyan-200 flex flex-col">
      {/* ✅ SOLO BOTÓN - SIN HEADER COMPLETO */}
      <div className="p-4 flex justify-end">
        {/* Solo mostrar botón de nuevo tratamiento si hay presupuesto seleccionado y está activo */}
        {selectedBudget && selectedBudget.status === 'activo' && (
          <button
            onClick={onNewTreatment}
            className="flex items-center bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg text-sm px-4 py-2 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Tratamiento
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {treatments.map((treatment) => (
            <TreatmentCard
              key={treatment.id_tratamiento}
              treatment={treatment}
              onView={onView}
              onEdit={onEdit}
              onComplete={onComplete}
              onDelete={onDelete}
              isLoadingDelete={isLoadingDelete}
              isLoadingComplete={isLoadingComplete}
              canComplete={treatment.status === 'pending'}
              showBudgetInfo={true}
            />
          ))}

          {treatments.length === 0 && selectedBudget && (
            <div className="flex-1 flex items-center justify-center py-12">
              <div className="text-center">
                <div className="mb-4">
                  {selectedBudget.status === 'activo' ? (
                    <Package className="w-16 h-16 mx-auto text-gray-300" />
                  ) : (
                    <AlertCircle className="w-16 h-16 mx-auto text-gray-300" />
                  )}
                </div>

                {selectedBudget.status === 'activo' ? (
                  <>
                    <h4 className="text-lg font-medium text-slate-700 mb-2">
                      Sin tratamientos registrados
                    </h4>
                    <p className="text-slate-500 mb-4 max-w-sm">
                      Los tratamientos de este presupuesto aún no han sido registrados.
                      Comienza agregando el primer tratamiento.
                    </p>
                    <button
                      onClick={onNewTreatment}
                      className="flex items-center mx-auto bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg text-sm px-4 py-2 transition-colors shadow-sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Registrar Primer Tratamiento
                    </button>
                  </>
                ) : (
                  <>
                    <h4 className="text-lg font-medium text-slate-700 mb-2">
                      Presupuesto no activo
                    </h4>
                    <p className="text-slate-500 mb-4 max-w-sm">
                      Este presupuesto está en estado "{selectedBudget.status}".
                      {selectedBudget.status === 'pendiente' && ' Actívalo para generar tratamientos automáticamente.'}
                      {selectedBudget.status === 'completed' && ' Los tratamientos de este presupuesto ya fueron completados.'}
                    </p>
                    <p className="text-sm text-slate-400">
                      Solo los presupuestos activos pueden generar nuevos tratamientos
                    </p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export { TreatmentsList };