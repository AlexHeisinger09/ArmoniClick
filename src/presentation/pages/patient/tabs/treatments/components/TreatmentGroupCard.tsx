// src/presentation/pages/patient/tabs/treatments/components/TreatmentGroupCard.tsx
import React, { useState } from 'react';
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
  Eye
} from 'lucide-react';
import { TreatmentGroup } from '@/presentation/hooks/treatments/useTreatments';

interface TreatmentGroupCardProps {
  group: TreatmentGroup;
  onView: (treatmentId: number) => void;
  onEdit: (treatmentId: number) => void;
  onComplete: (treatmentId: number) => void;
  onDelete: (treatmentId: number) => void;
  onAddSession: (budgetItemId: number) => void;
  isLoadingDelete?: boolean;
  isLoadingComplete?: boolean;
}

const TreatmentGroupCard: React.FC<TreatmentGroupCardProps> = ({
  group,
  onView,
  onEdit,
  onComplete,
  onDelete,
  onAddSession,
  isLoadingDelete = false,
  isLoadingComplete = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { mainTreatment, sessions, status, hasTreatments, budget_item_pieza, budget_item_valor } = group;

  // ✅ Detectar si es un budget_item sin treatments
  const isPlanned = !hasTreatments || mainTreatment.id_tratamiento === 0;

  // ✅ NUEVO: Todos los treatments (main + sessions)
  const allTreatments = hasTreatments ? [mainTreatment, ...sessions] : [];
  const totalTreatments = allTreatments.length;

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("es-CL");
  };

  const formatTime = (timeString: string): string => {
    return timeString.slice(0, 5);
  };

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
                {/* ✅ Título del budget_item */}
                <h4 className="font-semibold text-slate-800 text-base truncate">
                  {mainTreatment.nombre_servicio.replace(/ - Sesión \d+$/, '')}
                  {budget_item_pieza && (
                    <span className="text-slate-600 font-normal"> - Pieza {budget_item_pieza}</span>
                  )}
                </h4>

                {/* Info debajo del título */}
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  {/* Valor */}
                  {budget_item_valor && (
                    <span className="text-sm text-slate-600">
                      <span className="font-medium">Valor:</span> ${parseFloat(budget_item_valor).toLocaleString('es-CL')}
                    </span>
                  )}

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

          {/* ✅ BOTONES: Solo Agregar Sesión y Completar */}
          <div className="flex items-center gap-1">
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
                  // ✅ TODO: Implementar lógica para completar TODAS las sesiones
                  console.log('Completar todas las sesiones del budget_item');
                }}
                disabled={isLoadingComplete}
                className="flex items-center gap-1 bg-green-50 hover:bg-green-100 text-green-700 text-xs font-medium rounded-lg px-2 py-1 border border-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                title="Marcar todas las sesiones como completadas"
              >
                {isLoadingComplete ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-700"></div>
                ) : (
                  <CheckCircle className="w-3 h-3" />
                )}
                <span className="hidden sm:inline">Completar Todo</span>
              </button>
            )}
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

                    {/* ✅ BOTONES POR SESIÓN: Ver, Editar, Eliminar */}
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

                      <button
                        onClick={() => onDelete(treatment.id_tratamiento)}
                        disabled={isLoadingDelete}
                        className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-medium rounded px-2 py-1 border border-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Eliminar sesión"
                      >
                        {isLoadingDelete ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-700"></div>
                        ) : (
                          <Trash2 className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { TreatmentGroupCard };
