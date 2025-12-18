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
          icon: <CheckCircle className="w-4 h-4 text-green-600" />,
          label: 'Completado',
          color: 'text-green-600 bg-green-50 border-green-200'
        };
      case 'en_proceso':
        return {
          icon: <Activity className="w-4 h-4 text-blue-600" />,
          label: 'En Proceso',
          color: 'text-blue-600 bg-blue-50 border-blue-200'
        };
      case 'planificado':
      default:
        return {
          icon: <AlertCircle className="w-4 h-4 text-orange-600" />,
          label: 'Planificado',
          color: 'text-orange-600 bg-orange-50 border-orange-200'
        };
    }
  };

  const statusInfo = getStatusInfo(status);
  const canAddSession = status !== 'completado';
  const canComplete = status !== 'completado' && hasTreatments;

  return (
    <div className={`rounded-xl border-2 transition-all duration-200 ${
      status === 'completado'
        ? 'border-green-200 bg-gradient-to-r from-green-50/50 to-blue-50/50'
        : status === 'en_proceso'
        ? 'border-blue-200 bg-white'
        : 'border-cyan-200 bg-white'
    }`}>
      {/* ✅ ENCABEZADO: Budget Item (NO editable/eliminable) */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {/* Botón expandir/colapsar si hay sesiones */}
              {totalTreatments > 0 && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-slate-600 hover:text-cyan-600 transition-colors flex-shrink-0"
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
                {/* ✅ Título del budget_item con Pieza y Valor inline */}
                <h4 className="font-semibold text-slate-800 text-base truncate">
                  {mainTreatment.nombre_servicio.replace(/ - Sesión \d+$/, '')}
                  {budget_item_pieza && (
                    <span className="text-slate-600 font-normal"> - Pieza {budget_item_pieza}</span>
                  )}
                  {budget_item_valor && (
                    <span className="text-slate-600 font-normal"> - Valor ${parseFloat(budget_item_valor).toLocaleString('es-CL')}</span>
                  )}
                </h4>

                {/* Info debajo del título */}
                <div className="flex flex-wrap items-center gap-2 mt-1">

                  {/* Badge de estado */}
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                    {statusInfo.icon}
                    <span className="ml-1">{statusInfo.label}</span>
                  </span>

                  {/* Indicador de sesiones */}
                  {totalTreatments > 0 && (
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full border border-slate-200">
                      {totalTreatments} {totalTreatments === 1 ? 'sesión' : 'sesiones'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ✅ BOTONES: Agregar Sesión, Ver Fotos y Completar */}
          <div className="flex items-center gap-1">
            {/* Botón ver fotos (solo si tiene sesiones con fotos) */}
            {hasTreatments && allTreatments.some(t => t.foto1 || t.foto2) && (
              <button
                onClick={() => setShowPhotoModal(true)}
                className="flex items-center gap-1 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 text-xs font-medium rounded-lg px-2 py-1 border border-cyan-200 transition-colors whitespace-nowrap"
                title="Ver todas las fotos de las sesiones"
              >
                <Images className="w-3 h-3" />
                <span className="hidden sm:inline">Ver Fotos</span>
              </button>
            )}

            {/* Botón agregar sesión */}
            {canAddSession && group.budget_item_id && (
              <button
                onClick={() => onAddSession(group.budget_item_id!)}
                className={`flex items-center gap-1 ${
                  isPlanned
                    ? 'bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 shadow-sm'
                    : 'bg-purple-50 hover:bg-purple-100 text-purple-700 px-2 py-1 border border-purple-200'
                } text-xs font-medium rounded-lg transition-colors whitespace-nowrap`}
                title={isPlanned ? "Registrar primera sesión" : "Agregar nueva sesión"}
              >
                <Plus className={isPlanned ? 'w-4 h-4' : 'w-3 h-3'} />
                <span className={isPlanned ? '' : 'hidden sm:inline'}>
                  {isPlanned ? 'Registrar Primera Sesión' : 'Sesión'}
                </span>
              </button>
            )}

            {/* Botón completar todo (solo si tiene sesiones) */}
            {canComplete && (
              <button
                onClick={() => {
                  if (group.budget_item_id) {
                    onCompleteBudgetItem(group.budget_item_id);
                  }
                }}
                disabled={isLoadingCompleteItem}
                className="flex items-center gap-1 bg-green-50 hover:bg-green-100 text-green-700 text-xs font-medium rounded-lg px-2 py-1 border border-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                title="Marcar todas las sesiones como completadas"
              >
                {isLoadingCompleteItem ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-700"></div>
                ) : (
                  <CheckCircle className="w-3 h-3" />
                )}
                <span className="hidden sm:inline">Completar Todo</span>
              </button>
            )}

            {/* Botón eliminar budget_item (elimina todas las sesiones en cascada) */}
            <button
              onClick={() => {
                if (group.budget_item_id) {
                  onDeleteBudgetItem(group.budget_item_id);
                }
              }}
              disabled={isLoadingDeleteItem || !group.budget_item_id}
              className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-medium rounded-lg px-2 py-1 border border-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              title="Eliminar item del presupuesto y todas sus sesiones"
            >
              {isLoadingDeleteItem ? (
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-700"></div>
              ) : (
                <Trash2 className="w-3 h-3" />
              )}
              <span className="hidden sm:inline">Eliminar</span>
            </button>
          </div>
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
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded">
                          Sesión {index + 1}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-slate-600">
                          <Calendar className="w-3 h-3" />
                          {formatDate(treatment.fecha_control)} - {formatTime(treatment.hora_control)}
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
                        className="flex items-center gap-1 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 text-xs font-medium rounded px-2 py-1 border border-cyan-200 transition-colors"
                        title="Ver detalles"
                      >
                        <Eye className="w-3 h-3" />
                      </button>

                      <button
                        onClick={() => onEdit(treatment.id_tratamiento)}
                        className="flex items-center gap-1 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 text-xs font-medium rounded px-2 py-1 border border-yellow-200 transition-colors"
                        title="Editar sesión"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
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
