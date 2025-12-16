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
  Activity
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
  const { mainTreatment, sessions, totalSessions, status, hasTreatments } = group;

  // ✅ NUEVO: Detectar si es un budget_item sin treatments
  const isPlanned = !hasTreatments || mainTreatment.id_tratamiento === 0;

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
  const canComplete = status !== 'completado' && !isPlanned; // ✅ No se puede completar si no tiene treatments

  return (
    <div className={`rounded-xl border-2 transition-all duration-200 ${
      status === 'completado'
        ? 'border-green-200 bg-gradient-to-r from-green-50/50 to-blue-50/50'
        : status === 'en_proceso'
        ? 'border-blue-200 bg-white'
        : 'border-cyan-200 bg-white'
    }`}>
      {/* Tratamiento Principal */}
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {/* Botón expandir/colapsar si hay sesiones */}
              {totalSessions > 0 && (
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
                <h4 className="font-semibold text-slate-800 text-base truncate">
                  {mainTreatment.nombre_servicio}
                  {group.budget_item_pieza && (
                    <span className="text-slate-600 font-normal"> - {group.budget_item_pieza}</span>
                  )}
                </h4>

                {/* Info debajo del título */}
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  {/* Valor */}
                  {group.budget_item_valor && (
                    <span className="text-sm text-slate-600">
                      <span className="font-medium">Valor:</span> ${parseFloat(group.budget_item_valor).toLocaleString('es-CL')}
                    </span>
                  )}

                  {/* Badge de estado */}
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                    {statusInfo.icon}
                    <span className="ml-1">{statusInfo.label}</span>
                  </span>

                  {/* Indicador de sesiones */}
                  {totalSessions > 0 && (
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full border border-slate-200">
                      {totalSessions} {totalSessions === 1 ? 'sesión' : 'sesiones'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center gap-1">
            {/* ✅ MODO PLANIFICADO: Solo botón de agregar sesión */}
            {isPlanned && canAddSession && group.budget_item_id ? (
              <button
                onClick={() => onAddSession(group.budget_item_id!)}
                className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium rounded-lg px-4 py-2 border border-purple-600 transition-colors shadow-sm whitespace-nowrap"
                title="Registrar primera sesión"
              >
                <Plus className="w-4 h-4" />
                <span>Registrar Primera Sesión</span>
              </button>
            ) : (
              /* ✅ MODO CON TREATMENTS: Mostrar todos los botones de acción */
              <>
                {/* Botón agregar sesión */}
                {canAddSession && group.budget_item_id && (
                  <button
                    onClick={() => onAddSession(group.budget_item_id!)}
                    className="flex items-center gap-1 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-medium rounded px-2 py-1 border border-purple-200 transition-colors whitespace-nowrap"
                    title="Agregar nueva sesión"
                  >
                    <Plus className="w-3 h-3" />
                    <span className="hidden sm:inline">Sesión</span>
                  </button>
                )}

                {/* Botón editar */}
                <button
                  onClick={() => onEdit(mainTreatment.id_tratamiento)}
                  className="flex items-center gap-1 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 text-xs font-medium rounded px-2 py-1 border border-yellow-200 transition-colors whitespace-nowrap"
                  title="Editar tratamiento"
                >
                  <Edit className="w-3 h-3" />
                  <span className="hidden sm:inline">Editar</span>
                </button>

                {/* Botón completar (solo si NO está completado) */}
                {canComplete && (
                  <button
                    onClick={() => onComplete(mainTreatment.id_tratamiento)}
                    disabled={isLoadingComplete}
                    className="flex items-center gap-1 bg-green-50 hover:bg-green-100 text-green-700 text-xs font-medium rounded px-2 py-1 border border-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    title="Marcar como completado"
                  >
                    {isLoadingComplete ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-700"></div>
                    ) : (
                      <CheckCircle className="w-3 h-3" />
                    )}
                    <span className="hidden sm:inline">Completar</span>
                  </button>
                )}

                {/* Botón eliminar */}
                <button
                  onClick={() => onDelete(mainTreatment.id_tratamiento)}
                  disabled={isLoadingDelete}
                  className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-medium rounded px-2 py-1 border border-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  title="Eliminar tratamiento"
                >
                  {isLoadingDelete ? (
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-700"></div>
                  ) : (
                    <Trash2 className="w-3 h-3" />
                  )}
                  <span className="hidden sm:inline">Eliminar</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* ✅ Solo mostrar fechas/descripción/fotos si tiene treatments reales */}
        {!isPlanned && (
          <>
            {/* Fechas del tratamiento principal */}
            <div className="flex flex-wrap gap-3 text-sm text-slate-600 mb-2">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Inicio: {formatDate(mainTreatment.fecha_control)}</span>
              </div>

              {mainTreatment.fecha_proximo_control && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>Próximo: {formatDate(mainTreatment.fecha_proximo_control)}</span>
                </div>
              )}
            </div>

            {/* Descripción */}
            {mainTreatment.descripcion && (
              <p className="text-sm text-slate-600 line-clamp-2">
                {mainTreatment.descripcion}
              </p>
            )}

            {/* Fotos */}
            {(mainTreatment.foto1 || mainTreatment.foto2) && (
              <div className="flex items-center text-purple-600 mt-2">
                <Camera className="w-4 h-4 mr-1" />
                <span className="text-xs">{mainTreatment.foto1 && mainTreatment.foto2 ? '2 fotos' : '1 foto'}</span>
              </div>
            )}
          </>
        )}

        {/* ✅ Mensaje para budget_items planificados */}
        {isPlanned && (
          <p className="text-sm text-slate-500 italic">
            Presiona "Registrar Primera Sesión" para comenzar el tratamiento
          </p>
        )}
      </div>

      {/* Lista de Sesiones (expandible) */}
      {isExpanded && totalSessions > 0 && (
        <div className="border-t border-slate-200 bg-slate-50/50">
          <div className="p-4">
            <h5 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Evoluciones / Sesiones ({totalSessions})
            </h5>

            <div className="space-y-2">
              {sessions.map((session, index) => (
                <div
                  key={session.id_tratamiento}
                  className="bg-white border border-slate-200 rounded-lg p-3 hover:border-cyan-300 transition-colors cursor-pointer"
                  onClick={() => onView(session.id_tratamiento)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          Sesión {index + 1}
                        </span>
                        <span className="text-xs text-slate-600">
                          {formatDate(session.fecha_control)} {formatTime(session.hora_control)}
                        </span>
                      </div>

                      {session.descripcion && (
                        <p className="text-sm text-slate-600 line-clamp-1">
                          {session.descripcion}
                        </p>
                      )}

                      {(session.foto1 || session.foto2) && (
                        <div className="flex items-center text-purple-600 mt-1">
                          <Camera className="w-3 h-3 mr-1" />
                          <span className="text-xs">{session.foto1 && session.foto2 ? '2 fotos' : '1 foto'}</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onView(session.id_tratamiento);
                      }}
                      className="text-cyan-600 hover:text-cyan-700 transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
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
