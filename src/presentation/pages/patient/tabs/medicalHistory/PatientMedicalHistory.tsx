// src/presentation/pages/patient/tabs/PatientMedicalHistory.tsx
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
  Filter,
  AlertCircle,
  Loader
} from 'lucide-react';
import { Patient } from "@/core/use-cases/patients";
import { useMedicalHistory } from "@/presentation/hooks/medical-history";
import { MedicalHistoryRecord } from "@/core/use-cases/medical-history";

interface PatientMedicalHistoryProps {
  patient: Patient;
}

const PatientMedicalHistory: React.FC<PatientMedicalHistoryProps> = ({ patient }) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('todos');
  const [expandedRecord, setExpandedRecord] = useState<string | null>(null);

  // Fetch real medical history data
  const { data: medicalHistoryData, isLoading, error } = useMedicalHistory({
    patientId: patient.id,
  });

  const medicalRecords: MedicalHistoryRecord[] = useMemo(() => {
    if (!medicalHistoryData?.records) {
      return [];
    }
    return medicalHistoryData.records;
  }, [medicalHistoryData]);

  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString("es-CL", options);
  };

  const formatMoney = (amount: number): string => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getCategoryConfig = (categoria: string) => {
    const configs = {
      registro: {
        color: 'from-slate-400 to-slate-600',
        bgColor: 'bg-slate-50',
        borderColor: 'border-slate-200',
        icon: <User className="w-3 h-3 text-white" />,
        label: 'Registro'
      },
      consulta: {
        color: 'from-blue-400 to-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        icon: <Stethoscope className="w-3 h-3 text-white" />,
        label: 'Consulta'
      },
      examen: {
        color: 'from-purple-400 to-purple-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        icon: <Activity className="w-3 h-3 text-white" />,
        label: 'Examen'
      },
      tratamiento: {
        color: 'from-green-400 to-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        icon: <FileText className="w-3 h-3 text-white" />,
        label: 'Tratamiento'
      },
      presupuesto: {
        color: 'from-amber-400 to-amber-600',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        icon: <DollarSign className="w-3 h-3 text-white" />,
        label: 'Presupuesto'
      },
      cita: {
        color: 'from-cyan-400 to-cyan-600',
        bgColor: 'bg-cyan-50',
        borderColor: 'border-cyan-200',
        icon: <Clock className="w-3 h-3 text-white" />,
        label: 'Cita'
      },
      cirugia: {
        color: 'from-red-400 to-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        icon: <FileText className="w-3 h-3 text-white" />,
        label: 'Cirugía'
      },
      diagnostico: {
        color: 'from-orange-400 to-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        icon: <FileText className="w-3 h-3 text-white" />,
        label: 'Diagnóstico'
      }
    };
    return configs[categoria as keyof typeof configs] || configs.consulta;
  };

  const getStatusBadge = (estado: string) => {
    const statusConfig = {
      completado: 'bg-green-100 text-green-700 border-green-200',
      pendiente: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      cancelado: 'bg-red-100 text-red-700 border-red-200',
      aprobado: 'bg-blue-100 text-blue-700 border-blue-200',
      rechazado: 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return statusConfig[estado as keyof typeof statusConfig] || statusConfig.completado;
  };

  const sortedRecords = medicalRecords
    .filter(record => selectedFilter === 'todos' || record.categoria === selectedFilter)
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

  const filterOptions = [
    { value: 'todos', label: 'Todos los registros' },
    { value: 'registro', label: 'Registros' },
    { value: 'consulta', label: 'Consultas' },
    { value: 'examen', label: 'Exámenes' },
    { value: 'tratamiento', label: 'Tratamientos' },
    { value: 'presupuesto', label: 'Presupuestos' },
    { value: 'cita', label: 'Citas' }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            Línea de Tiempo Médica
          </h3>
          <p className="text-gray-500">
            Historial completo de {patient.nombres} {patient.apellidos}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Filtro */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              disabled={isLoading}
              className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:opacity-50"
            >
              {filterOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <Loader className="w-8 h-8 text-cyan-500 animate-spin" />
            <p className="text-gray-600">Cargando historial médico...</p>
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
                {error instanceof Error ? error.message : 'Ocurrió un error al cargar el historial médico'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      {!isLoading && !error && (
      <div className="relative">
        {/* Vista móvil - Timeline centrada */}
        <div className="block sm:hidden">
          {/* Línea vertical centrada para móvil */}
          <div className="absolute left-1/2 transform -translate-x-0.5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-gray-200 via-gray-300 to-gray-200"></div>
          
          <div className="space-y-6">
            {sortedRecords.map((record, index) => {
              const config = getCategoryConfig(record.categoria);
              const isExpanded = expandedRecord === record.id;
              const isLeft = index % 2 === 0;
              
              return (
                <div key={record.id} className="relative flex items-start">
                  {isLeft ? (
                    <>
                      {/* Tarjeta izquierda móvil */}
                      <div className="w-1/2 pr-3">
                        <div className={`${config.bgColor} ${config.borderColor} border rounded-lg p-3 shadow-sm ml-auto`}>
                          <div className="mb-2">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-gray-800 text-xs leading-tight">
                                {record.tipo}
                              </h4>
                              <button
                                onClick={() => setExpandedRecord(isExpanded ? null : record.id)}
                                className="p-1 rounded-full hover:bg-white/50 transition-colors flex-shrink-0 ml-2"
                              >
                                {isExpanded ? (
                                  <ChevronUp className="w-3 h-3 text-gray-500" />
                                ) : (
                                  <ChevronDown className="w-3 h-3 text-gray-500" />
                                )}
                              </button>
                            </div>
                            
                            {record.estado && (
                              <span className={`inline-block px-1.5 py-0.5 text-xs font-medium rounded-full border mb-2 ${getStatusBadge(record.estado)}`}>
                                {record.estado}
                              </span>
                            )}
                            
                            <div className="text-xs text-gray-600 mb-2 space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Calendar className="w-2.5 h-2.5 flex-shrink-0" />
                                <span className="text-xs">{formatDate(record.fechaEvento || record.fecha)}</span>
                                {(record.horaEvento || record.hora) && (
                                  <>
                                    <span className="text-gray-400">•</span>
                                    <Clock className="w-2.5 h-2.5 flex-shrink-0" />
                                    <span className="text-xs">{record.horaEvento || record.hora}</span>
                                  </>
                                )}
                              </div>
                              <div className="text-xs">
                                <span className="font-medium">{record.medico}</span>
                              </div>
                              {record.monto && (
                                <div className="font-semibold text-green-600 text-xs">
                                  {formatMoney(record.monto)}
                                </div>
                              )}
                            </div>
                            
                            <p className={`text-gray-700 text-xs leading-relaxed ${isExpanded ? '' : 'line-clamp-3'}`}>
                              {record.descripcion}
                            </p>
                          </div>
                          
                          {/* Información expandida móvil */}
                          {isExpanded && (
                            <div className="pt-2 border-t border-gray-200">
                              <div className="space-y-1 text-xs">
                                <div>
                                  <span className="font-medium text-gray-600">Categoría:</span>
                                  <span className="ml-1 capitalize">{config.label}</span>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-600">Estado:</span>
                                  <span className="ml-1 capitalize">{record.estado}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Nodo central móvil */}
                      <div className={`relative z-10 w-6 h-6 bg-gradient-to-br ${config.color} rounded-full flex items-center justify-center shadow-md border-2 border-white flex-shrink-0`}>
                        {config.icon}
                      </div>
                      
                      {/* Espacio derecho vacío */}
                      <div className="w-1/2 pl-3"></div>
                    </>
                  ) : (
                    <>
                      {/* Espacio izquierdo vacío */}
                      <div className="w-1/2 pr-3"></div>
                      
                      {/* Nodo central móvil */}
                      <div className={`relative z-10 w-6 h-6 bg-gradient-to-br ${config.color} rounded-full flex items-center justify-center shadow-md border-2 border-white flex-shrink-0`}>
                        {config.icon}
                      </div>
                      
                      {/* Tarjeta derecha móvil */}
                      <div className="w-1/2 pl-3">
                        <div className={`${config.bgColor} ${config.borderColor} border rounded-lg p-3 shadow-sm mr-auto`}>
                          <div className="mb-2">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-gray-800 text-xs leading-tight">
                                {record.tipo}
                              </h4>
                              <button
                                onClick={() => setExpandedRecord(isExpanded ? null : record.id)}
                                className="p-1 rounded-full hover:bg-white/50 transition-colors flex-shrink-0 ml-2"
                              >
                                {isExpanded ? (
                                  <ChevronUp className="w-3 h-3 text-gray-500" />
                                ) : (
                                  <ChevronDown className="w-3 h-3 text-gray-500" />
                                )}
                              </button>
                            </div>
                            
                            {record.estado && (
                              <span className={`inline-block px-1.5 py-0.5 text-xs font-medium rounded-full border mb-2 ${getStatusBadge(record.estado)}`}>
                                {record.estado}
                              </span>
                            )}
                            
                            <div className="text-xs text-gray-600 mb-2 space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Calendar className="w-2.5 h-2.5 flex-shrink-0" />
                                <span className="text-xs">{formatDate(record.fechaEvento || record.fecha)}</span>
                                {(record.horaEvento || record.hora) && (
                                  <>
                                    <span className="text-gray-400">•</span>
                                    <Clock className="w-2.5 h-2.5 flex-shrink-0" />
                                    <span className="text-xs">{record.horaEvento || record.hora}</span>
                                  </>
                                )}
                              </div>
                              <div className="text-xs">
                                <span className="font-medium">{record.medico}</span>
                              </div>
                              {record.monto && (
                                <div className="font-semibold text-green-600 text-xs">
                                  {formatMoney(record.monto)}
                                </div>
                              )}
                            </div>
                            
                            <p className={`text-gray-700 text-xs leading-relaxed ${isExpanded ? '' : 'line-clamp-3'}`}>
                              {record.descripcion}
                            </p>
                          </div>
                          
                          {/* Información expandida móvil */}
                          {isExpanded && (
                            <div className="pt-2 border-t border-gray-200">
                              <div className="space-y-1 text-xs">
                                <div>
                                  <span className="font-medium text-gray-600">Categoría:</span>
                                  <span className="ml-1 capitalize">{config.label}</span>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-600">Estado:</span>
                                  <span className="ml-1 capitalize">{record.estado}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Vista desktop - Timeline centrada */}
        <div className="hidden sm:block max-w-6xl mx-auto">
          {/* Línea vertical principal centrada */}
          <div className="absolute left-1/2 transform -translate-x-0.5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-gray-200 via-gray-300 to-gray-200"></div>
          
          <div className="space-y-8">
            {sortedRecords.map((record, index) => {
              const config = getCategoryConfig(record.categoria);
              const isExpanded = expandedRecord === record.id;
              const isLeft = index % 2 === 0;
              
              return (
                <div key={record.id} className="relative flex items-center">
                  {isLeft ? (
                    <>
                      {/* Tarjeta izquierda */}
                      <div className="w-1/2 pr-8">
                        <div className={`${config.bgColor} ${config.borderColor} border rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-200 ml-auto max-w-md`}>
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-gray-800 text-sm">
                                  {record.tipo}
                                </h4>
                                {record.estado && (
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusBadge(record.estado)}`}>
                                    {record.estado}
                                  </span>
                                )}
                              </div>
                              
                              <div className="flex items-center text-xs text-gray-600 mb-1 flex-wrap gap-2">
                                <Calendar className="w-3 h-3" />
                                <span>{formatDate(record.fechaEvento || record.fecha)}</span>
                                {(record.horaEvento || record.hora) && (
                                  <>
                                    <span className="text-gray-400">•</span>
                                    <Clock className="w-3 h-3" />
                                    <span>{record.horaEvento || record.hora}</span>
                                  </>
                                )}
                                <span className="text-gray-400">•</span>
                                <span className="font-medium">{record.medico}</span>
                                {record.monto && (
                                  <>
                                    <span className="text-gray-400">•</span>
                                    <span className="font-semibold text-green-600">
                                      {formatMoney(record.monto)}
                                    </span>
                                  </>
                                )}
                              </div>
                              
                              <p className={`text-gray-700 text-xs leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>
                                {record.descripcion}
                              </p>
                            </div>
                            
                            <button
                              onClick={() => setExpandedRecord(isExpanded ? null : record.id)}
                              className="ml-4 p-1 rounded-full hover:bg-white/50 transition-colors"
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-gray-500" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-gray-500" />
                              )}
                            </button>
                          </div>
                          
                          {/* Información adicional expandida */}
                          {isExpanded && (
                            <div className="pt-2 border-t border-gray-200">
                              <div className="grid grid-cols-1 gap-2 text-xs">
                                <div>
                                  <span className="font-medium text-gray-600">Categoría:</span>
                                  <span className="ml-2 capitalize">{config.label}</span>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-600">Estado:</span>
                                  <span className="ml-2 capitalize">{record.estado}</span>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-600">Profesional:</span>
                                  <span className="ml-2">{record.medico}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Nodo central */}
                      <div className={`relative z-10 w-8 h-8 bg-gradient-to-br ${config.color} rounded-full flex items-center justify-center shadow-md border-2 border-white flex-shrink-0`}>
                        {config.icon}
                      </div>
                      
                      {/* Espacio derecho vacío */}
                      <div className="w-1/2 pl-8"></div>
                    </>
                  ) : (
                    <>
                      {/* Espacio izquierdo vacío */}
                      <div className="w-1/2 pr-8"></div>
                      
                      {/* Nodo central */}
                      <div className={`relative z-10 w-8 h-8 bg-gradient-to-br ${config.color} rounded-full flex items-center justify-center shadow-md border-2 border-white flex-shrink-0`}>
                        {config.icon}
                      </div>
                      
                      {/* Tarjeta derecha */}
                      <div className="w-1/2 pl-8">
                        <div className={`${config.bgColor} ${config.borderColor} border rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-200 mr-auto max-w-md`}>
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-gray-800 text-sm">
                                  {record.tipo}
                                </h4>
                                {record.estado && (
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusBadge(record.estado)}`}>
                                    {record.estado}
                                  </span>
                                )}
                              </div>
                              
                              <div className="flex items-center text-xs text-gray-600 mb-1 flex-wrap gap-2">
                                <Calendar className="w-3 h-3" />
                                <span>{formatDate(record.fechaEvento || record.fecha)}</span>
                                {(record.horaEvento || record.hora) && (
                                  <>
                                    <span className="text-gray-400">•</span>
                                    <Clock className="w-3 h-3" />
                                    <span>{record.horaEvento || record.hora}</span>
                                  </>
                                )}
                                <span className="text-gray-400">•</span>
                                <span className="font-medium">{record.medico}</span>
                                {record.monto && (
                                  <>
                                    <span className="text-gray-400">•</span>
                                    <span className="font-semibold text-green-600">
                                      {formatMoney(record.monto)}
                                    </span>
                                  </>
                                )}
                              </div>
                              
                              <p className={`text-gray-700 text-xs leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>
                                {record.descripcion}
                              </p>
                            </div>
                            
                            <button
                              onClick={() => setExpandedRecord(isExpanded ? null : record.id)}
                              className="ml-4 p-1 rounded-full hover:bg-white/50 transition-colors"
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-gray-500" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-gray-500" />
                              )}
                            </button>
                          </div>
                          
                          {/* Información adicional expandida */}
                          {isExpanded && (
                            <div className="pt-2 border-t border-gray-200">
                              <div className="grid grid-cols-1 gap-2 text-xs">
                                <div>
                                  <span className="font-medium text-gray-600">Categoría:</span>
                                  <span className="ml-2 capitalize">{config.label}</span>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-600">Estado:</span>
                                  <span className="ml-2 capitalize">{record.estado}</span>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-600">Profesional:</span>
                                  <span className="ml-2">{record.medico}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Estado vacío */}
        {sortedRecords.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-medium text-gray-600 mb-2">
              No hay registros para mostrar
            </h4>
            <p className="text-gray-500 mb-6 text-sm sm:text-base">
              {selectedFilter === 'todos'
                ? 'No hay registros médicos para este paciente'
                : `No hay registros de tipo "${filterOptions.find(f => f.value === selectedFilter)?.label.toLowerCase()}"`
              }
            </p>
          </div>
        )}
      </div>
      )}

    </div>
  );
};

export { PatientMedicalHistory };