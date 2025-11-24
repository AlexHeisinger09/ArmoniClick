// src/presentation/pages/patient/tabs/medicalHistory/PatientMedicalHistory.tsx
import React, { useState, useMemo, useEffect } from 'react';
import {
  FileText,
  Stethoscope,
  Activity,
  Calendar,
  DollarSign,
  Clock,
  User,
  AlertCircle,
  Loader,
  Image as ImageIcon,
  X,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Patient } from "@/core/use-cases/patients";
import { useAuditHistory, AuditLog } from "@/presentation/hooks/audit-history/useAuditHistory";
import { useDocuments } from "@/presentation/hooks/documents/useDocuments";
import { useTreatment } from "@/presentation/hooks/treatments/useTreatments";
import { AuditHistoryFilters, FilterState } from './components/AuditHistoryFilters';
import { ExportHistoryButton } from './components/ExportHistoryButton';

interface PatientMedicalHistoryProps {
  patient: Patient;
}

interface DocumentPreview {
  url: string;
  title: string;
  type: 'image' | 'pdf' | 'document';
}

interface TreatmentDetails {
  treatmentId: number;
}

const PatientMedicalHistory: React.FC<PatientMedicalHistoryProps> = ({ patient }) => {
  const [filters, setFilters] = useState<FilterState>({
    entityType: '',
    action: '',
    startDate: '',
    endDate: '',
  });

  const [selectedDocument, setSelectedDocument] = useState<DocumentPreview | null>(null);
  const [selectedTreatment, setSelectedTreatment] = useState<TreatmentDetails | null>(null);
  const queryClient = useQueryClient();

  // Fetch audit history from backend
  const { data: historyData, isLoading, error } = useAuditHistory(patient.id);

  // Hook de documentos para acceder a invalidateQueries
  const { queryDocuments } = useDocuments(patient.id);

  // Hook para obtener detalles del tratamiento cuando se selecciona uno
  const { queryTreatment } = useTreatment(
    selectedTreatment?.treatmentId || 0,
    !!selectedTreatment?.treatmentId
  );

  // Efecto para invalidar el caché de auditoría cuando los documentos cambian
  useEffect(() => {
    if (!queryDocuments.isLoading && queryDocuments.data) {
      // Invalidar el caché de auditoría cuando hay cambios en documentos
      queryClient.invalidateQueries({ queryKey: ['auditHistory', patient.id] });
    }
  }, [queryDocuments.data]);

  const auditLogs: AuditLog[] = useMemo(() => {
    if (!historyData?.logs) {
      return [];
    }
    return historyData.logs;
  }, [historyData]);

  // Función auxiliar para normalizar entity_type
  const normalizeEntityType = (type: string): string => {
    return type.toLowerCase();
  };

  // Aplicar filtros - Excluir tratamientos CREATED, solo mostrar los editados
  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const normalizedType = normalizeEntityType(log.entity_type);

      // Filtro: Excluir tratamientos en estado CREATED
      if (normalizedType === 'tratamiento' && log.action === 'created') {
        return false;
      }

      // Filtro por tipo de entidad
      if (filters.entityType && normalizedType !== filters.entityType) {
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
    const normalizedType = entityType.toLowerCase();
    const configs: Record<string, any> = {
      paciente: {
        color: 'from-slate-400 to-slate-600',
        bgColor: 'bg-slate-50',
        borderColor: 'border-slate-200',
        icon: <User className="w-3 h-3 text-white" />,
        label: 'Paciente'
      },
      presupuesto: {
        color: 'from-amber-400 to-amber-600',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        icon: <DollarSign className="w-3 h-3 text-white" />,
        label: 'Presupuesto'
      },
      tratamiento: {
        color: 'from-green-400 to-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        icon: <Activity className="w-3 h-3 text-white" />,
        label: 'Tratamiento'
      },
      cita: {
        color: 'from-cyan-400 to-cyan-600',
        bgColor: 'bg-cyan-50',
        borderColor: 'border-cyan-200',
        icon: <Clock className="w-3 h-3 text-white" />,
        label: 'Cita'
      },
      documento: {
        color: 'from-purple-400 to-purple-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        icon: <FileText className="w-3 h-3 text-white" />,
        label: 'Documento'
      }
    };
    return configs[normalizedType] || configs.paciente;
  };

  const getActionLabel = (action: string, entityType?: string): string => {
    // Si es un tratamiento actualizado, mostrar "Evolución"
    if (action === 'updated' && entityType && normalizeEntityType(entityType) === 'tratamiento') {
      return 'Evolución';
    }

    const labels: Record<string, string> = {
      created: 'Creado',
      updated: 'Actualizado',
      status_changed: 'Cambio de estado',
      deleted: 'Eliminado'
    };
    return labels[action] || action;
  };

  const getActionBadgeColor = (action: string): string => {
    const colors: Record<string, string> = {
      created: 'bg-green-100 text-green-700 border-green-200',
      updated: 'bg-blue-100 text-blue-700 border-blue-200',
      status_changed: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      deleted: 'bg-red-100 text-red-700 border-red-200'
    };
    return colors[action] || colors.updated;
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

  const getDocumentsFromLog = (log: AuditLog): DocumentPreview[] => {
    const documents: DocumentPreview[] = [];

    // Solo mostrar documentos para logs de documentos firmados
    if (normalizeEntityType(log.entity_type) === 'documento' && log.new_values && log.action === 'status_changed' && log.new_values.status === 'firmado') {
      const title = log.new_values.title || `Documento #${log.entity_id}`;

      // Mostrar PDF si existe en los new_values
      if (log.new_values.pdf_base64) {
        const pdfUrl = `data:application/pdf;base64,${log.new_values.pdf_base64}`;

        documents.push({
          url: pdfUrl,
          title: title,
          type: 'pdf'
        });
      }

      // Mostrar firma si existe en los new_values
      // La firma se guarda como base64 en signature_data
      if (log.new_values.signature_data) {
        const signatureUrl = log.new_values.signature_data.startsWith('data:')
          ? log.new_values.signature_data
          : `data:image/png;base64,${log.new_values.signature_data}`;

        documents.push({
          url: signatureUrl,
          title: `Firma - ${title}`,
          type: 'image'
        });
      }
    }

    return documents;
  };

  const getAppointmentDisplay = (log: AuditLog, entityLabel: string): { title: string; subtitle: string } => {
    if (normalizeEntityType(log.entity_type) === 'cita' && log.new_values) {
      const appointmentDate = log.new_values.appointmentDate;
      const status = log.new_values.status;

      if (appointmentDate) {
        const date = new Date(appointmentDate);
        const formattedDate = date.toLocaleDateString('es-CL', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
        const formattedTime = date.toLocaleTimeString('es-CL', {
          hour: '2-digit',
          minute: '2-digit'
        });
        const statusLabel = status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : '';

        return {
          title: `${formattedDate} - ${formattedTime}`,
          subtitle: statusLabel
        };
      }
    }

    return {
      title: `${entityLabel} #${log.entity_id}`,
      subtitle: ''
    };
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
            <div className="relative px-2 sm:px-4">
              {/* Línea central vertical - Hidden en mobile */}
              <div className="hidden sm:block absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-400 via-purple-400 to-pink-400 transform -translate-x-1/2"></div>

              {/* Línea vertical izquierda en mobile */}
              <div className="sm:hidden absolute left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-400 via-purple-400 to-pink-400"></div>

              <div className="space-y-8 sm:space-y-12">
                {sortedLogs.map((log, index) => {
                  const config = getEntityConfig(log.entity_type);
                  const photos = getPhotosFromLog(log);
                  const documents = getDocumentsFromLog(log);
                  const hasPhotos = photos.length > 0;
                  const hasDocuments = documents.length > 0;
                  const isEven = index % 2 === 0;

                  const appointmentDisplay = getAppointmentDisplay(log, config.label);

                  return (
                    <div key={log.id} className="relative">
                      {/* Desktop: Layout de 2 columnas */}
                      <div className={`hidden sm:flex ${isEven ? 'flex-row' : 'flex-row-reverse'}`}>
                        {/* Información: Fecha, Hora y Tipo */}
                        <div className={`w-1/2 ${isEven ? 'text-right pr-8' : 'text-left pl-8'} pt-1`}>
                          <div className={`inline-block ${isEven ? '' : ''}`}>
                            <p className="text-xs font-semibold text-gray-700">{formatDate(log.created_at)}</p>
                            <p className="text-xs text-gray-500 mb-2">{formatTime(log.created_at)}</p>
                            <p className="text-xs font-semibold text-gray-800 bg-gray-100 rounded px-2 py-1 inline-block">
                              {config.label}
                            </p>
                          </div>
                        </div>

                        {/* Espacio para el círculo en el centro */}
                        <div className="w-0 flex justify-center relative">
                          <div
                            className={`absolute w-12 h-12 bg-gradient-to-br ${config.color} rounded-full flex items-center justify-center shadow-lg border-4 border-white z-10 top-0`}
                          >
                            {config.icon}
                          </div>
                        </div>

                        {/* Card con contenido */}
                        <div className={`w-1/2 ${isEven ? 'pl-8' : 'pr-8'}`}>
                          <div
                            className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4 shadow-sm hover:shadow-lg transition-all duration-200 ${
                              normalizeEntityType(log.entity_type) === 'tratamiento' ? 'cursor-pointer hover:border-green-400' : ''
                            }`}
                            onClick={() => {
                              if (normalizeEntityType(log.entity_type) === 'tratamiento') {
                                setSelectedTreatment({
                                  treatmentId: log.entity_id
                                });
                              }
                            }}
                          >
                            {/* Header */}
                            <div className="mb-3">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <h4 className="font-semibold text-gray-800 text-base">
                                  {normalizeEntityType(log.entity_type) === 'cita'
                                    ? appointmentDisplay.title
                                    : normalizeEntityType(log.entity_type) === 'tratamiento'
                                    ? (log.new_values?.nombre_servicio || `Tratamiento #${log.entity_id}`)
                                    : normalizeEntityType(log.entity_type) === 'paciente'
                                    ? `${log.new_values?.nombres || ''} ${log.new_values?.apellidos || ''}`.trim()
                                    : `${config.label} #${log.entity_id}`
                                  }
                                </h4>
                                <span
                                  className={`px-2 py-1 text-xs font-medium rounded-full border whitespace-nowrap ${getActionBadgeColor(
                                    log.action
                                  )}`}
                                >
                                  {getActionLabel(log.action, log.entity_type)}
                                </span>
                              </div>

                              {/* Estado de cita */}
                              {normalizeEntityType(log.entity_type) === 'cita' && appointmentDisplay.subtitle && (
                                <p className="text-sm text-gray-600 mb-2">Estado: <span className="font-medium">{appointmentDisplay.subtitle}</span></p>
                              )}

                              {/* Doctor que realizó la acción */}
                              <p className="text-xs text-gray-500 mb-2">
                                Doctor: <span className="text-gray-700 font-medium">{log.doctor_name || 'Desconocido'}</span>
                              </p>

                              {/* Información de piezas para tratamiento */}
                              {normalizeEntityType(log.entity_type) === 'tratamiento' && log.new_values?.piezas && (
                                <div className="mt-2 mb-2">
                                  <p className="text-xs font-semibold text-green-700 mb-1">Piezas:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {(Array.isArray(log.new_values.piezas)
                                      ? log.new_values.piezas
                                      : typeof log.new_values.piezas === 'string'
                                      ? log.new_values.piezas.split(',').map((p: string) => p.trim())
                                      : []
                                    ).map((pieza: string, idx: number) => (
                                      <span key={idx} className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                                        {pieza}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Información de productos para tratamiento */}
                              {normalizeEntityType(log.entity_type) === 'tratamiento' && log.new_values?.productos && (
                                <div className="mt-2 mb-2">
                                  <p className="text-xs font-semibold text-blue-700 mb-1">Productos:</p>
                                  <div className="space-y-1">
                                    {(Array.isArray(log.new_values.productos)
                                      ? log.new_values.productos
                                      : typeof log.new_values.productos === 'string'
                                      ? log.new_values.productos.split(',').map((p: string) => p.trim())
                                      : []
                                    ).map((producto: string, idx: number) => {
                                      // Intentar parsear si es un objeto JSON
                                      let productoData = { nombre: producto, fecha_vencimiento: '', dilusion: '' };
                                      try {
                                        if (typeof producto === 'string' && producto.includes('{')) {
                                          productoData = JSON.parse(producto);
                                        } else if (typeof producto === 'object') {
                                          productoData = producto as any;
                                        }
                                      } catch (e) {
                                        // Mantener el formato original si no es JSON
                                      }

                                      return (
                                        <div key={idx} className="text-xs text-blue-800 bg-blue-50 p-1.5 rounded">
                                          <p className="font-medium">
                                            {typeof productoData === 'object' && 'nombre' in productoData
                                              ? productoData.nombre
                                              : producto}
                                          </p>
                                          <div className="text-xs text-blue-700 mt-0.5">
                                            {typeof productoData === 'object' && 'fecha_vencimiento' in productoData && productoData.fecha_vencimiento && (
                                              <p><span className="font-semibold">Vto:</span> {productoData.fecha_vencimiento}</p>
                                            )}
                                            {typeof productoData === 'object' && 'dilusion' in productoData && productoData.dilusion && (
                                              <p><span className="font-semibold">Dilución:</span> {productoData.dilusion}</p>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* Información adicional para paciente creado */}
                              {normalizeEntityType(log.entity_type) === 'paciente' && log.action === 'created' && (
                                <div className="bg-white bg-opacity-50 rounded p-2 mb-2 text-sm space-y-1">
                                  {log.new_values?.email && (
                                    <p><span className="text-gray-600">Email:</span> <span className="text-gray-800">{log.new_values.email}</span></p>
                                  )}
                                  {log.new_values?.telefono && (
                                    <p><span className="text-gray-600">Teléfono:</span> <span className="text-gray-800">{log.new_values.telefono}</span></p>
                                  )}
                                  {log.new_values?.alergias && (
                                    <p><span className="text-gray-600">Alergias:</span> <span className="text-red-700 font-medium">{log.new_values.alergias}</span></p>
                                  )}
                                  {log.new_values?.medicamentos_actuales && (
                                    <p><span className="text-gray-600">Medicamentos:</span> <span className="text-gray-800">{log.new_values.medicamentos_actuales}</span></p>
                                  )}
                                </div>
                              )}

                              {/* Descripción */}
                              {log.notes && (
                                <p className="text-sm text-gray-700 mt-2">{log.notes}</p>
                              )}
                            </div>

                            {/* Miniaturas (documentos/fotos) */}
                            {(hasPhotos || hasDocuments) && (
                              <div className="flex gap-2 flex-wrap">
                                {/* Miniaturas de documentos */}
                                {documents.slice(0, 3).map((doc, idx) => (
                                  <div
                                    key={`doc-${idx}`}
                                    className="relative group cursor-pointer"
                                    onClick={() => setSelectedDocument(doc)}
                                  >
                                    {doc.type === 'pdf' ? (
                                      <div className="h-16 w-16 bg-red-100 rounded border border-red-300 flex items-center justify-center hover:border-red-500 transition-all">
                                        <FileText className="w-8 h-8 text-red-600" />
                                      </div>
                                    ) : (
                                      <img
                                        src={doc.url}
                                        alt={doc.title}
                                        className="h-16 w-16 object-cover rounded border border-gray-300 hover:border-cyan-500 transition-all"
                                        onError={(e) => {
                                          const img = e.target as HTMLImageElement;
                                          img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23f0f0f0" width="100" height="100"/%3E%3Ctext x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999" font-size="12"%3ENo disponible%3C/text%3E%3C/svg%3E';
                                        }}
                                      />
                                    )}
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 rounded transition-all flex items-center justify-center">
                                      {doc.type === 'pdf' ? (
                                        <FileText className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-all" />
                                      ) : (
                                        <ImageIcon className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-all" />
                                      )}
                                    </div>
                                  </div>
                                ))}

                                {/* Miniaturas de fotos */}
                                {photos.slice(0, 3 - documents.length).map((photo, idx) => (
                                  <div
                                    key={`photo-${idx}`}
                                    className="relative group cursor-pointer"
                                    onClick={() => setSelectedDocument({
                                      url: photo.url,
                                      title: photo.alt || `Foto ${idx + 1}`,
                                      type: 'image'
                                    })}
                                  >
                                    <img
                                      src={photo.url}
                                      alt={photo.alt}
                                      className="h-16 w-16 object-cover rounded border border-gray-300 hover:border-cyan-500 transition-all"
                                      onError={(e) => {
                                        const img = e.target as HTMLImageElement;
                                        img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23f0f0f0" width="100" height="100"/%3E%3Ctext x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999" font-size="12"%3ENo disponible%3C/text%3E%3C/svg%3E';
                                      }}
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 rounded transition-all flex items-center justify-center">
                                      <ImageIcon className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-all" />
                                    </div>
                                  </div>
                                ))}

                                {/* Indicador de más elementos */}
                                {(documents.length + photos.length) > 3 && (
                                  <div className="h-16 w-16 rounded border border-gray-300 bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-700">
                                    +{(documents.length + photos.length) - 3}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Mobile: Layout de una columna */}
                      <div className="sm:hidden flex flex-col pl-16">
                        {/* Círculo en el lado izquierdo */}
                        <div className={`absolute left-1 top-0 w-12 h-12 bg-gradient-to-br ${config.color} rounded-full flex items-center justify-center shadow-lg border-4 border-white z-10`}>
                          {config.icon}
                        </div>

                        {/* Card con contenido */}
                        <div
                          className={`${config.bgColor} ${config.borderColor} border rounded-lg p-3 shadow-sm ${
                            normalizeEntityType(log.entity_type) === 'tratamiento' ? 'cursor-pointer hover:border-green-400 hover:shadow-md' : ''
                          }`}
                          onClick={() => {
                            if (normalizeEntityType(log.entity_type) === 'tratamiento') {
                              setSelectedTreatment({
                                treatmentId: log.entity_id
                              });
                            }
                          }}
                        >
                          {/* Header */}
                          <div className="mb-3">
                            <div className="flex items-start gap-2 mb-2 flex-wrap">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-800 text-sm break-words">
                                  {normalizeEntityType(log.entity_type) === 'cita'
                                    ? appointmentDisplay.title
                                    : normalizeEntityType(log.entity_type) === 'tratamiento'
                                    ? (log.new_values?.nombre_servicio || `Tratamiento #${log.entity_id}`)
                                    : normalizeEntityType(log.entity_type) === 'paciente'
                                    ? `${log.new_values?.nombres || ''} ${log.new_values?.apellidos || ''}`.trim()
                                    : `${config.label} #${log.entity_id}`
                                  }
                                </h4>
                              </div>
                            </div>

                            {/* Fecha y hora */}
                            <p className="text-xs font-semibold text-gray-700 mb-1">{formatDate(log.created_at)}</p>
                            <p className="text-xs text-gray-500 mb-2">{formatTime(log.created_at)}</p>

                            {/* Badge de acción */}
                            <span className={`text-xs font-medium rounded-full border inline-block mb-2 px-2 py-1 ${getActionBadgeColor(log.action)}`}>
                              {getActionLabel(log.action, log.entity_type)}
                            </span>

                            {/* Label de tipo */}
                            <p className="text-xs font-semibold text-gray-800 bg-gray-100 rounded px-2 py-1 inline-block">
                              {config.label}
                            </p>

                            {/* Estado de cita */}
                            {normalizeEntityType(log.entity_type) === 'cita' && appointmentDisplay.subtitle && (
                              <p className="text-xs text-gray-600 mt-2">Estado: <span className="font-medium">{appointmentDisplay.subtitle}</span></p>
                            )}

                            {/* Doctor que realizó la acción */}
                            <p className="text-xs text-gray-500 mt-2">
                              Doctor: <span className="text-gray-700 font-medium">{log.doctor_name || 'Desconocido'}</span>
                            </p>

                            {/* Información de piezas para tratamiento (mobile) */}
                            {normalizeEntityType(log.entity_type) === 'tratamiento' && log.new_values?.piezas && (
                              <div className="mt-2 mb-2">
                                <p className="text-xs font-semibold text-green-700 mb-1">Piezas:</p>
                                <div className="flex flex-wrap gap-1">
                                  {(Array.isArray(log.new_values.piezas)
                                    ? log.new_values.piezas
                                    : typeof log.new_values.piezas === 'string'
                                    ? log.new_values.piezas.split(',').map((p: string) => p.trim())
                                    : []
                                  ).map((pieza: string, idx: number) => (
                                    <span key={idx} className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                                      {pieza}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Información de productos para tratamiento (mobile) */}
                            {normalizeEntityType(log.entity_type) === 'tratamiento' && log.new_values?.productos && (
                              <div className="mt-2 mb-2">
                                <p className="text-xs font-semibold text-blue-700 mb-1">Productos:</p>
                                <div className="space-y-1">
                                  {(Array.isArray(log.new_values.productos)
                                    ? log.new_values.productos
                                    : typeof log.new_values.productos === 'string'
                                    ? log.new_values.productos.split(',').map((p: string) => p.trim())
                                    : []
                                  ).map((producto: string, idx: number) => {
                                    // Intentar parsear si es un objeto JSON
                                    let productoData = { nombre: producto, fecha_vencimiento: '', dilusion: '' };
                                    try {
                                      if (typeof producto === 'string' && producto.includes('{')) {
                                        productoData = JSON.parse(producto);
                                      } else if (typeof producto === 'object') {
                                        productoData = producto as any;
                                      }
                                    } catch (e) {
                                      // Mantener el formato original si no es JSON
                                    }

                                    return (
                                      <div key={idx} className="text-xs text-blue-800 bg-blue-50 p-1.5 rounded">
                                        <p className="font-medium">
                                          {typeof productoData === 'object' && 'nombre' in productoData
                                            ? productoData.nombre
                                            : producto}
                                        </p>
                                        <div className="text-xs text-blue-700 mt-0.5">
                                          {typeof productoData === 'object' && 'fecha_vencimiento' in productoData && productoData.fecha_vencimiento && (
                                            <p><span className="font-semibold">Vto:</span> {productoData.fecha_vencimiento}</p>
                                          )}
                                          {typeof productoData === 'object' && 'dilusion' in productoData && productoData.dilusion && (
                                            <p><span className="font-semibold">Dilución:</span> {productoData.dilusion}</p>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Información adicional para paciente creado */}
                            {normalizeEntityType(log.entity_type) === 'paciente' && log.action === 'created' && (
                              <div className="bg-white bg-opacity-50 rounded p-2 mt-2 text-xs space-y-1">
                                {log.new_values?.email && (
                                  <p><span className="text-gray-600">Email:</span> <span className="text-gray-800 break-all">{log.new_values.email}</span></p>
                                )}
                                {log.new_values?.telefono && (
                                  <p><span className="text-gray-600">Teléfono:</span> <span className="text-gray-800">{log.new_values.telefono}</span></p>
                                )}
                                {log.new_values?.alergias && (
                                  <p><span className="text-gray-600">Alergias:</span> <span className="text-red-700 font-medium">{log.new_values.alergias}</span></p>
                                )}
                                {log.new_values?.medicamentos_actuales && (
                                  <p><span className="text-gray-600">Medicamentos:</span> <span className="text-gray-800">{log.new_values.medicamentos_actuales}</span></p>
                                )}
                              </div>
                            )}

                            {/* Descripción */}
                            {log.notes && (
                              <p className="text-xs text-gray-700 mt-2">{log.notes}</p>
                            )}
                          </div>

                          {/* Miniaturas (documentos/fotos) */}
                          {(hasPhotos || hasDocuments) && (
                            <div className="flex gap-2 flex-wrap">
                              {/* Miniaturas de documentos */}
                              {documents.slice(0, 3).map((doc, idx) => (
                                <div
                                  key={`doc-${idx}`}
                                  className="relative group cursor-pointer"
                                  onClick={() => setSelectedDocument(doc)}
                                >
                                  {doc.type === 'pdf' ? (
                                    <div className="h-12 w-12 bg-red-100 rounded border border-red-300 flex items-center justify-center hover:border-red-500 transition-all">
                                      <FileText className="w-6 h-6 text-red-600" />
                                    </div>
                                  ) : (
                                    <img
                                      src={doc.url}
                                      alt={doc.title}
                                      className="h-12 w-12 object-cover rounded border border-gray-300 hover:border-cyan-500 transition-all"
                                      onError={(e) => {
                                        const img = e.target as HTMLImageElement;
                                        img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23f0f0f0" width="100" height="100"/%3E%3Ctext x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999" font-size="12"%3ENo disponible%3C/text%3E%3C/svg%3E';
                                      }}
                                    />
                                  )}
                                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 rounded transition-all flex items-center justify-center">
                                    {doc.type === 'pdf' ? (
                                      <FileText className="w-3 h-3 text-white opacity-0 group-hover:opacity-100 transition-all" />
                                    ) : (
                                      <ImageIcon className="w-3 h-3 text-white opacity-0 group-hover:opacity-100 transition-all" />
                                    )}
                                  </div>
                                </div>
                              ))}

                              {/* Miniaturas de fotos */}
                              {photos.slice(0, 3 - documents.length).map((photo, idx) => (
                                <div
                                  key={`photo-${idx}`}
                                  className="relative group cursor-pointer"
                                  onClick={() => setSelectedDocument({
                                    url: photo.url,
                                    title: photo.alt || `Foto ${idx + 1}`,
                                    type: 'image'
                                  })}
                                >
                                  <img
                                    src={photo.url}
                                    alt={photo.alt}
                                    className="h-12 w-12 object-cover rounded border border-gray-300 hover:border-cyan-500 transition-all"
                                    onError={(e) => {
                                      const img = e.target as HTMLImageElement;
                                      img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23f0f0f0" width="100" height="100"/%3E%3Ctext x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999" font-size="12"%3ENo disponible%3C/text%3E%3C/svg%3E';
                                    }}
                                  />
                                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 rounded transition-all flex items-center justify-center">
                                    <ImageIcon className="w-3 h-3 text-white opacity-0 group-hover:opacity-100 transition-all" />
                                  </div>
                                </div>
                              ))}

                              {/* Indicador de más elementos */}
                              {(documents.length + photos.length) > 3 && (
                                <div className="h-12 w-12 rounded border border-gray-300 bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-700">
                                  +{(documents.length + photos.length) - 3}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Círculo final - Inicio de la historia del paciente */}
              <div className="relative pt-8 pb-4">
                {/* Desktop */}
                <div className="hidden sm:block absolute left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full flex items-center justify-center shadow-lg border-4 border-white z-10">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                {/* Mobile */}
                <div className="sm:hidden absolute left-1 w-12 h-12 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full flex items-center justify-center shadow-lg border-4 border-white z-10">
                  <Activity className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal de detalles del tratamiento - Obtiene datos del endpoint */}
      {selectedTreatment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg shadow-2xl w-[95vw] sm:w-[90vw] lg:w-[75vw] max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header azul */}
            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white p-4 sm:p-6 flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">
                  {queryTreatment.isLoading ? 'Cargando...' : queryTreatment.data?.treatment?.nombre_servicio || 'Tratamiento'}
                </h2>
                {queryTreatment.data?.treatment && (
                  <p className="text-xs sm:text-sm text-cyan-100 mt-1">
                    {formatDate(queryTreatment.data.treatment.fecha_control)} a las {formatTime(queryTreatment.data.treatment.fecha_control)}
                  </p>
                )}
              </div>
              <button
                onClick={() => setSelectedTreatment(null)}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors flex-shrink-0"
                aria-label="Cerrar"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Contenido del modal con scroll */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {queryTreatment.isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader className="w-6 h-6 text-cyan-500 animate-spin" />
                </div>
              ) : queryTreatment.error ? (
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <p className="text-sm text-red-700">Error al cargar los detalles del tratamiento</p>
                </div>
              ) : queryTreatment.data?.treatment ? (
                <>
                  {/* Servicio */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Servicio</h3>
                    <p className="text-sm text-gray-900">{queryTreatment.data.treatment.nombre_servicio}</p>
                  </div>

                  {/* Producto */}
                  {queryTreatment.data.treatment.producto && (
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <h3 className="text-sm font-semibold text-green-700 mb-3 flex items-center gap-2">
                        <span className="w-5 h-5 bg-green-600 text-white rounded-full flex items-center justify-center text-xs">💊</span>
                        Producto
                      </h3>
                      <div className="bg-white rounded p-3 border border-green-100 space-y-2">
                        <p className="text-sm font-medium text-gray-900">{queryTreatment.data.treatment.producto}</p>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          {queryTreatment.data.treatment.lote_producto && (
                            <div>
                              <span className="text-gray-600">Lote:</span>
                              <p className="text-gray-900 font-medium">{queryTreatment.data.treatment.lote_producto}</p>
                            </div>
                          )}
                          {queryTreatment.data.treatment.fecha_venc_producto && (
                            <div>
                              <span className="text-gray-600">Vencimiento:</span>
                              <p className="text-gray-900 font-medium">{queryTreatment.data.treatment.fecha_venc_producto}</p>
                            </div>
                          )}
                          {queryTreatment.data.treatment.dilucion && (
                            <div className="col-span-2">
                              <span className="text-gray-600">Dilución:</span>
                              <p className="text-gray-900 font-medium">{queryTreatment.data.treatment.dilucion}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Descripción */}
                  {queryTreatment.data.treatment.descripcion && (
                    <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                      <h3 className="text-sm font-semibold text-amber-700 mb-2">Descripción</h3>
                      <p className="text-sm text-amber-900">{queryTreatment.data.treatment.descripcion}</p>
                    </div>
                  )}

                  {/* Fotos */}
                  {(queryTreatment.data.treatment.foto1 || queryTreatment.data.treatment.foto2) && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <span className="w-5 h-5 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs">📸</span>
                        Fotografías
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {queryTreatment.data.treatment.foto1 && (
                          <div
                            className="rounded-lg overflow-hidden border border-gray-300 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => setSelectedDocument({
                              url: queryTreatment.data.treatment.foto1!,
                              title: 'Foto 1',
                              type: 'image'
                            })}
                          >
                            <img
                              src={queryTreatment.data.treatment.foto1}
                              alt="Foto 1"
                              className="w-full h-24 sm:h-32 object-cover hover:opacity-80 transition-opacity"
                              onError={(e) => {
                                const img = e.target as HTMLImageElement;
                                img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23f0f0f0" width="100" height="100"/%3E%3Ctext x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999" font-size="12"%3ENo disponible%3C/text%3E%3C/svg%3E';
                              }}
                            />
                          </div>
                        )}
                        {queryTreatment.data.treatment.foto2 && (
                          <div
                            className="rounded-lg overflow-hidden border border-gray-300 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => setSelectedDocument({
                              url: queryTreatment.data.treatment.foto2!,
                              title: 'Foto 2',
                              type: 'image'
                            })}
                          >
                            <img
                              src={queryTreatment.data.treatment.foto2}
                              alt="Foto 2"
                              className="w-full h-24 sm:h-32 object-cover hover:opacity-80 transition-opacity"
                              onError={(e) => {
                                const img = e.target as HTMLImageElement;
                                img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23f0f0f0" width="100" height="100"/%3E%3Ctext x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999" font-size="12"%3ENo disponible%3C/text%3E%3C/svg%3E';
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Estado vacío */}
                  {!queryTreatment.data.treatment.producto && !queryTreatment.data.treatment.descripcion && !queryTreatment.data.treatment.foto1 && !queryTreatment.data.treatment.foto2 && (
                    <div className="text-center py-8">
                      <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">No hay detalles disponibles</p>
                    </div>
                  )}
                </>
              ) : null}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
              <p className="text-xs sm:text-sm text-gray-600">
                Detalles del tratamiento
              </p>
              <button
                onClick={() => setSelectedTreatment(null)}
                className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors text-sm font-medium"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de vista previa de documentos */}
      {selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg shadow-2xl w-[95vw] h-[95vh] sm:w-[90vw] sm:h-[90vh] lg:w-[85vw] lg:h-[85vh] flex flex-col">
            {/* Header del modal */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 truncate pr-4">{selectedDocument.title}</h3>
              <button
                onClick={() => setSelectedDocument(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                aria-label="Cerrar"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Contenido del modal */}
            <div className="flex-1 overflow-auto p-4 sm:p-6 flex items-center justify-center bg-gray-50">
              {selectedDocument.type === 'pdf' ? (
                <div className="w-full h-full flex items-center justify-center">
                  <iframe
                    src={selectedDocument.url}
                    className="w-full h-full rounded border border-gray-200"
                    title={selectedDocument.title}
                  />
                </div>
              ) : (
                <img
                  src={selectedDocument.url}
                  alt={selectedDocument.title}
                  className="max-w-full max-h-full object-contain rounded border border-gray-200"
                />
              )}
            </div>

            {/* Footer del modal */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
              <p className="text-xs sm:text-sm text-gray-600">
                {selectedDocument.type === 'pdf' ? 'Documento PDF' : 'Imagen'}
              </p>
              <a
                href={selectedDocument.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 sm:px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors text-xs sm:text-sm font-medium flex-shrink-0"
              >
                Descargar
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { PatientMedicalHistory };
