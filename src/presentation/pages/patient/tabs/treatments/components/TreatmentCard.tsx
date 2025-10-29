// src/presentation/pages/patient/tabs/treatments/components/TreatmentCard.tsx - VERSIÓN COMPACTA PARA NUEVO LAYOUT
import React from 'react';
import { Calendar, Clock, Camera, Edit, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
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

  const getStatusInfo = (status?: string) => {
    switch (status) {
      case 'completed':
        return {
          icon: <CheckCircle className="w-4 h-4 text-blue-600" />,
          label: 'Completado',
          color: 'text-blue-600 bg-blue-50 border-blue-200'
        };
      case 'pending':
      default:
        return {
          icon: <AlertCircle className="w-4 h-4 text-orange-600" />,
          label: 'Pendiente', 
          color: 'text-orange-600 bg-orange-50 border-orange-200'
        };
    }
  };

  const statusInfo = getStatusInfo(treatment.status);

  return (
    <div 
      className={`p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer group hover:shadow-md ${
        treatment.status === 'completed' 
          ? 'border-blue-200 bg-gradient-to-r from-blue-50/50 to-green-50/50 hover:from-blue-50 hover:to-green-50' 
          : 'border-cyan-200 bg-white hover:border-cyan-300 hover:bg-cyan-50/30'
      }`}
      onClick={() => onView(treatment)}
    >
      {/* Header con nombre del servicio y estado */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-slate-800 text-base truncate">
                {treatment.nombre_servicio}
                {showBudgetInfo && treatment.budget_item_pieza && (
                  <span className="text-slate-600 font-normal"> {treatment.budget_item_pieza}</span>
                )}
              </h4>
              {/* Precio debajo del título */}
              {showBudgetInfo && treatment.budget_item_valor && (
                <div className="text-xs sm:text-sm text-slate-600 mt-1">
                  <span className="font-medium">Valor:</span> ${parseFloat(treatment.budget_item_valor).toLocaleString('es-CL')}
                </div>
              )}
            </div>

            {/* Badge de estado más compacto */}
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border shrink-0 w-fit ${statusInfo.color}`}>
              {statusInfo.icon}
              <span className="ml-1 hidden sm:inline">{statusInfo.label}</span>
            </span>
          </div>
        </div>

        {/* Botones de acción más compactos */}
        <div className="flex items-center space-x-1 opacity-70 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(treatment);
            }}
            className="p-2 text-slate-500 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
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
              className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
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
            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
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

      {/* Información de fechas responsive */}
      <div className="flex flex-col sm:flex-row gap-2 text-xs sm:text-sm text-slate-600 mb-3 space-y-1 sm:space-y-0 sm:space-x-4">
        <div className="flex items-center flex-wrap gap-1">
          <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <span className="truncate">Control: {formatDate(treatment.fecha_control)}</span>
          <span className="hidden sm:inline">{formatTime(treatment.hora_control)}</span>
        </div>

        {treatment.fecha_proximo_control && (
          <div className="flex items-center flex-wrap gap-1">
            <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span className="hidden sm:inline">Próximo:</span>
            <span className="truncate">{formatDate(treatment.fecha_proximo_control)}</span>
            {treatment.hora_proximo_control && (
              <span className="hidden lg:inline text-xs">{formatTime(treatment.hora_proximo_control)}</span>
            )}
          </div>
        )}
      </div>

      {/* Descripción más compacta */}
      {treatment.descripcion && (
        <p className="text-sm text-slate-600 mb-3 line-clamp-2">
          {treatment.descripcion.length > 120 
            ? `${treatment.descripcion.substring(0, 120)}...` 
            : treatment.descripcion
          }
        </p>
      )}

      {/* Footer con información adicional - responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-500">
          {treatment.producto && (
            <span className="hidden sm:inline whitespace-nowrap">
              <span className="font-medium">Producto:</span> {treatment.producto}
            </span>
          )}

          {(treatment.foto1 || treatment.foto2) && (
            <div className="flex items-center text-purple-600 whitespace-nowrap">
              <Camera className="w-4 h-4 mr-1 flex-shrink-0" />
              <span className="text-xs">{treatment.foto1 && treatment.foto2 ? '2 fotos' : '1 foto'}</span>
            </div>
          )}
        </div>

        {/* Indicador de estado del producto */}
        {treatment.fecha_venc_producto && (
          <div className="text-xs w-fit">
            {new Date(treatment.fecha_venc_producto) < new Date() ? (
              <span className="text-red-600 bg-red-50 px-2 py-1 rounded-full border border-red-200 whitespace-nowrap">
                ⚠️ Vencido
              </span>
            ) : (
              <span className="text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-200 whitespace-nowrap">
                ✓ Vigente
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export { TreatmentCard };