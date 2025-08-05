// src/presentation/pages/patient/tabs/treatments/components/TreatmentCard.tsx - ACTUALIZADO
import React from 'react';
import { Calendar, Clock, Camera, Eye, Edit, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { Treatment } from "@/core/use-cases/treatments";

interface TreatmentCardProps {
  treatment: Treatment;
  onView: (treatment: Treatment) => void;
  onEdit: (treatment: Treatment) => void;
  onComplete: (treatmentId: number) => void;
  onDelete: (treatmentId: number) => void;
  isLoadingDelete?: boolean;
  isLoadingComplete?: boolean;
  canComplete?: boolean;
  showBudgetInfo?: boolean;
}

const TreatmentCard: React.FC<TreatmentCardProps> = ({
  treatment,
  onView,
  onEdit,
  onComplete,
  onDelete,
  isLoadingDelete = false,
  isLoadingComplete = false,
  canComplete = false,
  showBudgetInfo = true
}) => {
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("es-CL");
  };

  const formatTime = (timeString: string): string => {
    return timeString.slice(0, 5);
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
      default:
        return <AlertCircle className="w-4 h-4 text-orange-600" />;
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'completed':
        return 'Completado';
      case 'pending':
      default:
        return 'Pendiente';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'pending':
      default:
        return 'text-orange-600 bg-orange-50 border-orange-200';
    }
  };

  return (
    <div 
      className={`border rounded-lg p-4 hover:bg-cyan-50 transition-colors cursor-pointer ${
        treatment.status === 'completed' ? 'border-green-200 bg-green-50/30' : 'border-cyan-200'
      }`}
      onClick={() => onView(treatment)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h4 className="font-medium text-slate-700 text-lg">
              {treatment.nombre_servicio}
            </h4>
            
            {/* Badge de estado */}
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(treatment.status)}`}>
              {getStatusIcon(treatment.status)}
              <span className="ml-1">{getStatusLabel(treatment.status)}</span>
            </span>
          </div>

          {/* Información del presupuesto (opcional) */}
          {showBudgetInfo && treatment.budget_item_id && (
            <div className="flex items-center space-x-4 text-sm text-slate-500 mb-2">
              {treatment.budget_item_pieza && (
                <span>
                  <strong>Pieza:</strong> {treatment.budget_item_pieza}
                </span>
              )}
              {treatment.budget_item_valor && (
                <span>
                  <strong>Valor:</strong> ${parseFloat(treatment.budget_item_valor).toLocaleString('es-CL')}
                </span>
              )}
            </div>
          )}

          {treatment.descripcion && (
            <p className="text-slate-500 mb-3 text-sm">
              {treatment.descripcion.length > 100 
                ? `${treatment.descripcion.substring(0, 100)}...` 
                : treatment.descripcion
              }
            </p>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(treatment);
            }}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
            title="Editar"
          >
            <Edit className="w-4 h-4" />
          </button>

          {/* Botón completar (solo si está pendiente) */}
          {canComplete && treatment.status === 'pending' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onComplete(treatment.id_tratamiento);
              }}
              disabled={isLoadingComplete}
              className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
              title="Marcar como completado"
            >
              {isLoadingComplete ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(treatment.id_tratamiento);
            }}
            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
            title="Eliminar"
            disabled={isLoadingDelete}
          >
            {isLoadingDelete ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
      
      {/* Información de fechas */}
      <div className="flex items-center text-sm text-slate-500 mb-2">
        <Calendar className="w-4 h-4 mr-2" />
        Control: {formatDate(treatment.fecha_control)} a las {formatTime(treatment.hora_control)}
        {treatment.fecha_proximo_control && (
          <span className="ml-4 flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            Próximo: {formatDate(treatment.fecha_proximo_control)}
            {treatment.hora_proximo_control && ` a las ${formatTime(treatment.hora_proximo_control)}`}
          </span>
        )}
      </div>

      {/* Información adicional */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 text-sm text-slate-500">
          {treatment.producto && (
            <span>
              <strong>Producto:</strong> {treatment.producto}
            </span>
          )}
          
          {(treatment.foto1 || treatment.foto2) && (
            <div className="flex items-center text-purple-600">
              <Camera className="w-4 h-4 mr-1" />
              {treatment.foto1 && treatment.foto2 ? '2 fotos' : '1 foto'}
            </div>
          )}
        </div>

        {/* Indicador de estado del producto */}
        {treatment.fecha_venc_producto && (
          <div className="text-xs">
            {new Date(treatment.fecha_venc_producto) < new Date() ? (
              <span className="text-red-600 bg-red-50 px-2 py-1 rounded-full">
                ⚠️ Producto vencido
              </span>
            ) : (
              <span className="text-green-600 bg-green-50 px-2 py-1 rounded-full">
                ✓ Producto vigente
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export { TreatmentCard };