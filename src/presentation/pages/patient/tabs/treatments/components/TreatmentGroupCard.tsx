// src/presentation/pages/patient/tabs/treatments/components/TreatmentGroupCard.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Calendar,
  Clock,
  Camera,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Plus,
  FileText,
  Activity,
  Eye,
  Images
} from 'lucide-react';
import { TreatmentGroup } from '@/presentation/hooks/treatments/useTreatments';
import { PhotoComparisonModal } from '../modals/PhotoComparisonModal';
import { formatDate, formatTime } from '@/presentation/utils/dateHelpers';

interface TreatmentGroupCardProps {
  group: TreatmentGroup;
  onView: (treatmentId: number) => void;
  onEdit: (treatmentId: number) => void;
  onComplete: (treatmentId: number) => void;
  onCompleteBudgetItem: (budgetItemId: number) => void;
  onDelete: (treatmentId: number) => void;
  onDeleteBudgetItem: (budgetItemId: number) => void;
  onAddSession: (budgetItemId: number) => void;
  isLoadingDelete?: boolean;
  isLoadingDeleteItem?: boolean;
  isLoadingComplete?: boolean;
  isLoadingCompleteItem?: boolean;
  budgetStatus?: string; // ✅ NUEVO: Estado del presupuesto para deshabilitar acciones
}

const TreatmentGroupCard: React.FC<TreatmentGroupCardProps> = ({
  group,
  onView,
  onEdit,
  onComplete,
  onCompleteBudgetItem,
  onDelete,
  onDeleteBudgetItem,
  onAddSession,
  isLoadingDelete = false,
  isLoadingDeleteItem = false,
  isLoadingComplete = false,
  isLoadingCompleteItem = false,
  budgetStatus,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const { mainTreatment, sessions, status, hasTreatments, budget_item_pieza, budget_item_valor } = group;

  // ✅ Detectar si es un budget_item sin treatments
  const isPlanned = !hasTreatments || mainTreatment.id_tratamiento === 0;

  // ✅ NUEVO: Todos los treatments (main + sessions)
  const allTreatments = hasTreatments ? [mainTreatment, ...sessions] : [];
  const totalTreatments = allTreatments.length;

  // ✅ Referencia para detectar cuando se agrega una nueva sesión
  const prevTreatmentsCount = useRef(totalTreatments);

  // ✅ Expandir automáticamente cuando se agrega una nueva sesión
  useEffect(() => {
    if (totalTreatments > prevTreatmentsCount.current && totalTreatments > 0) {
      setIsExpanded(true);
    }
    prevTreatmentsCount.current = totalTreatments;
  }, [totalTreatments]);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'completado':
        return {
          icon: <CheckCircle className="w-4 h-4 text-green-700" />,
          label: 'Completado',
          color: 'text-green-700 bg-green-50 border-green-300'
        };
      case 'en_proceso':
        return {
          icon: <Activity className="w-4 h-4 text-blue-700" />,
          label: 'En Proceso',
          color: 'text-blue-700 bg-blue-50 border-blue-300'
        };
      case 'planificado':
      default:
        return {
          icon: <AlertCircle className="w-4 h-4 text-orange-600" />,
          label: 'Planificado',
          color: 'text-orange-600 bg-orange-50 border-orange-300'
        };
    }
  };

  const statusInfo = getStatusInfo(status);
  const canAddSession = status !== 'completado';
  const canComplete = status !== 'completado' && hasTreatments;

  return (
    <div className={`rounded-xl border transition-all duration-200 ${
      status === 'completado'
        ? 'border-slate-300 bg-slate-50'
        : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
    }`}>
      {/* ✅ ENCABEZADO: Budget Item (NO editable/eliminable) */}
      <div className="p-4">
        {/* Nueva estructura: información principal siempre visible arriba */}
        <div className="mb-3">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-start gap-2 flex-1 min-w-0">
              {/* Botón expandir/colapsar si hay sesiones */}
              {totalTreatments > 0 && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-slate-600 hover:text-slate-800 transition-colors flex-shrink-0 mt-1"
                  title={isExpanded ? 'Ocultar sesiones' : 'Ver sesiones'}
                >
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5" />
                  ) : (
                    <ChevronRight className="w-5 h-5" />
                  )}
                </button>
              )}

              <div className="flex-1 min-w-0">
                {/* ✅ Nombre del tratamiento con badge de estado al lado */}
                <div className="flex items-start gap-2 flex-wrap mb-2">
                  <h4 className="font-semibold text-slate-800 text-base leading-snug break-words flex-1">
                    {mainTreatment.nombre_servicio.replace(/ - Sesión \d+$/, '')}
                  </h4>
                  {/* Badge de estado destacado al lado del nombre */}
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold border-2 whitespace-nowrap ${statusInfo.color}`}>
                    {statusInfo.icon}
                    {statusInfo.label}
                  </span>
                </div>

                {/* Indicador de sesiones */}
                {totalTreatments > 0 && (
                  <span className="inline-flex items-center text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full border border-slate-200 whitespace-nowrap">
                    {totalTreatments} {totalTreatments === 1 ? 'sesión' : 'sesiones'}
                  </span>
                )}
              </div>
            </div>

            {/* ✅ Valor en la esquina superior derecha */}
            {budget_item_valor && (
              <div className="flex-shrink-0 text-right">
                <p className="text-lg font-bold text-slate-800">
                  ${parseFloat(budget_item_valor).toLocaleString('es-CL')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ✅ BOTONES: Ahora en su propia fila, sin competir por espacio */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-200">
          {/* Botón ver fotos (solo si tiene sesiones con fotos) */}
          {hasTreatments && allTreatments.some(t => t.foto1 || t.foto2) && (
            <button
              onClick={() => setShowPhotoModal(true)}
              className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg px-3 py-2 border border-slate-300 transition-colors whitespace-nowrap"
              title="Ver todas las fotos de las sesiones"
            >
              <Images className="w-4 h-4" />
              <span>Ver Fotos</span>
            </button>
          )}

          {/* Botón agregar sesión */}
          {canAddSession && group.budget_item_id && (
            <button
              onClick={() => onAddSession(group.budget_item_id!)}
              className={`flex items-center gap-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                isPlanned
                  ? 'bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 shadow-sm'
                  : 'bg-white hover:bg-slate-50 text-slate-700 px-3 py-2 border border-slate-300'
              }`}
              title={isPlanned ? "Registrar primera sesión" : "Agregar nueva sesión"}
            >
              <Plus className="w-4 h-4" />
              <span>{isPlanned ? 'Registrar Primera Sesión' : 'Nueva Sesión'}</span>
            </button>
          )}

          {/* Botón marcar como realizado */}
          {canComplete && (
            <button
              onClick={() => {
                if (group.budget_item_id) {
                  onCompleteBudgetItem(group.budget_item_id);
                }
              }}
              disabled={isLoadingCompleteItem}
              className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg px-3 py-2 border border-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              title="Marcar como realizado"
            >
              {isLoadingCompleteItem ? (
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-slate-700"></div>
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              <span>Realizar</span>
            </button>
          )}

          {/* Botón eliminar budget_item (solo si el presupuesto NO está completado) */}
          {budgetStatus !== 'completed' && (
            <button
              onClick={() => {
                if (group.budget_item_id) {
                  onDeleteBudgetItem(group.budget_item_id);
                }
              }}
              disabled={isLoadingDeleteItem || !group.budget_item_id}
              className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg px-3 py-2 border border-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              title="Eliminar item del presupuesto y todas sus sesiones"
            >
              {isLoadingDeleteItem ? (
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-slate-700"></div>
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              <span>Eliminar</span>
            </button>
          )}
        </div>

        {/* ✅ Mensaje para budget_items planificados */}
        {isPlanned && (
          <p className="text-sm text-slate-500 italic">
            Presiona "Registrar Primera Sesión" para comenzar el tratamiento
          </p>
        )}
      </div>

      {/* ✅ ACORDEÓN: Lista de Sesiones */}
      {isExpanded && totalTreatments > 0 && (
        <div className="border-t border-slate-200 bg-slate-50/50">
          <div className="p-4">
            <h5 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Sesiones Registradas ({totalTreatments})
            </h5>

            <div className="space-y-2">
              {allTreatments.map((treatment, index) => (
                <div
                  key={treatment.id_tratamiento}
                  className="bg-white border border-slate-200 rounded-lg p-3 hover:border-cyan-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      {/* Número de sesión y fecha */}
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="inline-flex items-center text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded whitespace-nowrap">
                          Sesión {index + 1}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-slate-600 whitespace-nowrap">
                          <Calendar className="w-3 h-3 flex-shrink-0" />
                          <span>{formatDate(treatment.fecha_control)} - {formatTime(treatment.hora_control)}</span>
                        </div>
                      </div>

                      {/* Descripción */}
                      {treatment.descripcion && (
                        <p className="text-sm text-slate-600 line-clamp-2 mt-1">
                          {treatment.descripcion}
                        </p>
                      )}

                      {/* Producto */}
                      {treatment.producto && (
                        <p className="text-xs text-slate-500 mt-1">
                          <span className="font-medium">Producto:</span> {treatment.producto}
                        </p>
                      )}

                      {/* Fotos */}
                      {(treatment.foto1 || treatment.foto2) && (
                        <div className="flex items-center text-purple-600 mt-1">
                          <Camera className="w-3 h-3 mr-1" />
                          <span className="text-xs">
                            {treatment.foto1 && treatment.foto2 ? '2 fotos' : '1 foto'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* ✅ BOTONES POR SESIÓN: Ver y Editar */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onView(treatment.id_tratamiento)}
                        className="flex items-center gap-1 bg-white hover:bg-slate-50 text-slate-600 text-xs font-medium rounded px-2 py-1 border border-slate-300 transition-colors whitespace-nowrap"
                        title="Ver detalles de la sesión"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Ver</span>
                      </button>

                      {/* Solo mostrar botón editar si el tratamiento NO está completado */}
                      {treatment.status !== 'completed' && (
                        <button
                          onClick={() => onEdit(treatment.id_tratamiento)}
                          className="flex items-center gap-1 bg-white hover:bg-slate-50 text-slate-600 text-xs font-medium rounded px-2 py-1 border border-slate-300 transition-colors whitespace-nowrap"
                          title="Editar sesión"
                        >
                          <Edit className="w-3 h-3" />
                          <span>Editar</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ✅ Modal de comparación de fotos */}
      <PhotoComparisonModal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
        sessions={allTreatments}
        serviceName={mainTreatment.nombre_servicio.replace(/ - Sesión \d+$/, '')}
      />
    </div>
  );
};

export { TreatmentGroupCard };
