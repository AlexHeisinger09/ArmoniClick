// src/presentation/pages/patient/tabs/medicalHistory/PatientMedicalHistory.tsx
import React, { useState, useMemo } from 'react';
import {
  FileText,
  Stethoscope,
  Activity,
  Calendar,
  DollarSign,
  Clock,
  User,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Loader,
  Image as ImageIcon,
} from 'lucide-react';
import { Patient } from "@/core/use-cases/patients";
import { useAuditHistory, AuditLog } from "@/presentation/hooks/audit-history/useAuditHistory";
import { AuditHistoryFilters, FilterState } from './components/AuditHistoryFilters';
import { ExportHistoryButton } from './components/ExportHistoryButton';
import { AuditLogPhotoGallery } from './components/AuditLogPhotoGallery';

interface PatientMedicalHistoryProps {
  patient: Patient;
}

const PatientMedicalHistory: React.FC<PatientMedicalHistoryProps> = ({ patient }) => {
  const [expandedRecord, setExpandedRecord] = useState<number | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    entityType: '',
    action: '',
    startDate: '',
    endDate: '',
  });

  // Fetch audit history from backend
  const { data: historyData, isLoading, error } = useAuditHistory(patient.id);

  const auditLogs: AuditLog[] = useMemo(() => {
    if (!historyData?.logs) {
      return [];
    }
    return historyData.logs;
  }, [historyData]);

  // Aplicar filtros - Excluir tratamientos CREATED, solo mostrar los editados
  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      // Filtro: Excluir tratamientos en estado CREATED
      if (log.entity_type === 'TRATAMIENTO' && log.action === 'CREATED') {
        return false;
      }

      // Filtro por tipo de entidad
      if (filters.entityType && log.entity_type !== filters.entityType) {
        return false;
      }

      // Filtro por acción
      if (filters.action && log.action !== filters.action) {
        return false;
      }

      // Filtro por fecha inicio
      if (filters.startDate) {
        const logDate = new Date(log.created_at);
        const startDate = new Date(filters.startDate);
        if (logDate < startDate) {
          return false;
        }
      }

      // Filtro por fecha fin
      if (filters.endDate) {
        const logDate = new Date(log.created_at);
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999);
        if (logDate > endDate) {
          return false;
        }
      }

      return true;
    });
  }, [auditLogs, filters]);

  // Ordenar por fecha descendente
  const sortedLogs = useMemo(() => {
    return [...filteredLogs].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [filteredLogs]);

  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    };
    return new Date(dateString).toLocaleDateString("es-CL", options);
  };

  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }) + ' ' + date.toLocaleTimeString('es-CL', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-CL', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getEntityConfig = (entityType: string) => {
    const configs: Record<string, any> = {
      PACIENTE: {
        color: 'from-slate-400 to-slate-600',
        bgColor: 'bg-slate-50',
        borderColor: 'border-slate-200',
        icon: <User className="w-3 h-3 text-white" />,
        label: 'Paciente'
      },
      PRESUPUESTO: {
        color: 'from-amber-400 to-amber-600',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        icon: <DollarSign className="w-3 h-3 text-white" />,
        label: 'Presupuesto'
      },
      TRATAMIENTO: {
        color: 'from-green-400 to-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        icon: <Activity className="w-3 h-3 text-white" />,
        label: 'Tratamiento'
      },
      CITA: {
        color: 'from-cyan-400 to-cyan-600',
        bgColor: 'bg-cyan-50',
        borderColor: 'border-cyan-200',
        icon: <Clock className="w-3 h-3 text-white" />,
        label: 'Cita'
      },
      DOCUMENTO: {
        color: 'from-purple-400 to-purple-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        icon: <FileText className="w-3 h-3 text-white" />,
        label: 'Documento'
      }
    };
    return configs[entityType] || configs.PACIENTE;
  };

  const getActionLabel = (action: string): string => {
    const labels: Record<string, string> = {
      CREATED: 'Creado',
      UPDATED: 'Actualizado',
      STATUS_CHANGED: 'Cambio de estado',
      DELETED: 'Eliminado'
    };
    return labels[action] || action;
  };

  const getActionBadgeColor = (action: string): string => {
    const colors: Record<string, string> = {
      CREATED: 'bg-green-100 text-green-700 border-green-200',
      UPDATED: 'bg-blue-100 text-blue-700 border-blue-200',
      STATUS_CHANGED: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      DELETED: 'bg-red-100 text-red-700 border-red-200'
    };
    return colors[action] || colors.UPDATED;
  };

  const getPhotosFromLog = (log: AuditLog): Array<{ url: string; alt?: string }> => {
    const photos: Array<{ url: string; alt?: string }> = [];

    if (log.new_values) {
      if (log.new_values.foto1) {
        photos.push({ url: log.new_values.foto1, alt: 'Foto 1' });
      }
      if (log.new_values.foto2) {
        photos.push({ url: log.new_values.foto2, alt: 'Foto 2' });
      }
    }

    return photos;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            Historial Médico del Paciente
          </h3>
          <p className="text-gray-500">
            Registro completo de cambios para {patient.nombres} {patient.apellidos}
          </p>
        </div>

        {/* Botón Exportar en la esquina superior derecha */}
        <div className="flex-shrink-0">
          <ExportHistoryButton
            logs={sortedLogs}
            patient={patient}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Filtros de fecha - Siempre visibles */}
      <div className="mb-6">
        <AuditHistoryFilters
          onFiltersChange={setFilters}
          isLoading={isLoading}
        />
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <Loader className="w-8 h-8 text-cyan-500 animate-spin" />
            <p className="text-gray-600">Cargando historial del paciente...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-800 mb-1">Error al cargar historial</h4>
              <p className="text-sm text-red-700">
                {error instanceof Error ? error.message : 'Ocurrió un error al cargar el historial'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Timeline elegante */}
      {!isLoading && !error && (
        <div>
          {sortedLogs.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h4 className="text-lg font-medium text-gray-600 mb-2">
                No hay registros para mostrar
              </h4>
              <p className="text-gray-500 mb-6 text-sm sm:text-base">
                {filters.entityType || filters.action || filters.startDate || filters.endDate
                  ? 'No hay registros que coincidan con los filtros seleccionados'
                  : 'No hay registros de auditoría para este paciente'
                }
              </p>
            </div>
          ) : (
            <div className="relative">
              {/* Línea vertical del timeline */}
              <div className="absolute left-4 sm:left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-400 to-purple-400"></div>

              {/* Eventos del timeline */}
              <div className="space-y-6">
                {sortedLogs.map((log, index) => {
                  const config = getEntityConfig(log.entity_type);
                  const isExpanded = expandedRecord === log.id;
                  const photos = getPhotosFromLog(log);
                  const hasPhotos = photos.length > 0;
                  const isLastItem = index === sortedLogs.length - 1;

                  return (
                    <div key={log.id} className="relative pl-20 sm:pl-24">
                      {/* Círculo del timeline */}
                      <div
                        className={`absolute -left-3.5 sm:-left-4 top-1 w-8 h-8 bg-gradient-to-br ${config.color} rounded-full flex items-center justify-center shadow-lg border-4 border-white`}
                      >
                        {config.icon}
                      </div>

                      {/* Card del evento */}
                      <div className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200`}>
                        {/* Fecha en la izquierda */}
                        <div className="absolute -left-24 sm:-left-32 top-4 text-right w-20 hidden sm:block">
                          <p className="text-xs font-semibold text-gray-600">{formatDate(log.created_at)}</p>
                          <p className="text-xs text-gray-500">{formatTime(log.created_at)}</p>
                        </div>

                        {/* Header */}
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h4 className="font-semibold text-gray-800 text-sm truncate">
                                {config.label} #{log.entity_id}
                              </h4>
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-full border whitespace-nowrap ${getActionBadgeColor(
                                  log.action
                                )}`}
                              >
                                {getActionLabel(log.action)}
                              </span>
                            </div>

                            {/* En mobile, mostrar fecha aquí */}
                            <div className="sm:hidden flex items-center gap-2 text-xs text-gray-600 mb-2">
                              <Calendar className="w-3 h-3 flex-shrink-0" />
                              <span>{formatDate(log.created_at)}</span>
                              <Clock className="w-3 h-3 flex-shrink-0" />
                              <span>{formatTime(log.created_at)}</span>
                            </div>

                            {/* Descripción */}
                            {log.notes && (
                              <p className="text-sm text-gray-700 mb-2">{log.notes}</p>
                            )}

                            {hasPhotos && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-cyan-100 text-cyan-700 text-xs rounded-full border border-cyan-200 mt-1">
                                <ImageIcon className="w-3 h-3" />
                                {photos.length} foto{photos.length > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>

                          {/* Botón expandir */}
                          <button
                            onClick={() => setExpandedRecord(isExpanded ? null : log.id)}
                            className="p-1 rounded-full hover:bg-white/50 transition-colors flex-shrink-0"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5 text-gray-600" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-600" />
                            )}
                          </button>
                        </div>

                        {/* Contenido expandido */}
                        {isExpanded && (
                          <div className="pt-3 border-t border-gray-300 space-y-3">
                            {/* Cambios */}
                            {(log.old_values || log.new_values) && (
                              <div>
                                <h5 className="font-semibold text-sm text-gray-800 mb-2">
                                  Cambios realizados
                                </h5>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                  {log.old_values && (
                                    <div className="bg-white bg-opacity-60 p-2 rounded border border-gray-300">
                                      <p className="font-medium text-gray-700 mb-1">Anterior:</p>
                                      <pre className="text-xs text-gray-600 overflow-auto max-h-20 whitespace-pre-wrap break-words">
                                        {JSON.stringify(log.old_values, null, 2)}
                                      </pre>
                                    </div>
                                  )}
                                  {log.new_values && (
                                    <div className="bg-white bg-opacity-60 p-2 rounded border border-gray-300">
                                      <p className="font-medium text-gray-700 mb-1">Nuevo:</p>
                                      <pre className="text-xs text-gray-600 overflow-auto max-h-20 whitespace-pre-wrap break-words">
                                        {JSON.stringify(log.new_values, null, 2)}
                                      </pre>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Fotos */}
                            {hasPhotos && (
                              <AuditLogPhotoGallery photos={photos} title="Fotos" />
                            )}

                            {/* Detalles */}
                            <div className="bg-white bg-opacity-40 p-2 rounded text-xs text-gray-700">
                              <p className="text-gray-600">Doctor ID: {log.changed_by} • ID Log: #{log.id}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export { PatientMedicalHistory };
