// src/presentation/pages/patient/tabs/treatments/components/TreatmentsList.tsx - ACTUALIZADO
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

  // Estado vacío cuando no hay presupuesto seleccionado
  if (showEmptyState) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-cyan-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-700">
            Tratamientos del Paciente
          </h3>
        </div>

        <div className="text-center py-12">
          <div className="mb-4">
            <FileText className="w-16 h-16 mx-auto text-gray-300" />
          </div>
          <p className="text-slate-500 mb-4">
            No hay tratamientos generados
          </p>
          <p className="text-sm text-slate-400">
            Los tratamientos se generan automáticamente al activar un presupuesto
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-cyan-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-700">
            Tratamientos
            {selectedBudget && (
              <span className="text-base font-normal text-slate-500 ml-2">
                - Presupuesto #{selectedBudget.id} ({selectedBudget.budget_type === 'odontologico' ? 'Odontológico' : 'Estética'})
              </span>
            )}
          </h3>
          {selectedBudget && (
            <p className="text-sm text-slate-500 mt-1">
              Estado: <span className="font-medium">{selectedBudget.status}</span> •
              Total: <span className="font-medium">${parseFloat(selectedBudget.total_amount).toLocaleString('es-CL')}</span>
            </p>
          )}
        </div>

        {/* Solo mostrar botón de nuevo tratamiento si hay presupuesto seleccionado y está activo */}
        {selectedBudget && selectedBudget.status === 'activo' && (
          <button
            onClick={onNewTreatment}
            className="flex items-center bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg text-sm px-4 py-2 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Tratamiento
          </button>
        )}
      </div>

      <div className="space-y-4">
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
            showBudgetInfo={false} // No mostrar info del presupuesto en el card cuando ya está seleccionado
          />
        ))}

        {treatments.length === 0 && selectedBudget && (
          <div className="text-center py-8">
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
                <p className="text-slate-500 mb-4">
                  Los tratamientos de este presupuesto aún no han sido registrados
                </p>
                <button
                  onClick={onNewTreatment}
                  className="flex items-center mx-auto bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg text-sm px-4 py-2 transition-colors"
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
                <p className="text-slate-500 mb-4">
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
        )}
      </div>

      {/* Información adicional del presupuesto seleccionado */}
      {selectedBudget && (
        <div className="mt-6 p-4 bg-slate-50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <span className="text-slate-600">
                <strong>Tipo:</strong> {selectedBudget.budget_type === 'odontologico' ? 'Odontológico' : 'Estética'}
              </span>
              <span className="text-slate-600">
                <strong>Estado:</strong> {selectedBudget.status}
              </span>
              <span className="text-slate-600">
                <strong>Creado:</strong> {new Date(selectedBudget.created_at).toLocaleDateString('es-CL')}
              </span>
            </div>
            <div className="text-slate-600">
              <strong>Total:</strong> ${parseFloat(selectedBudget.total_amount).toLocaleString('es-CL')}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { TreatmentsList };