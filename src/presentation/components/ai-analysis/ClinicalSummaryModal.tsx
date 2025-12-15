import React, { useState } from 'react';
import { X, Brain, AlertCircle, FileText, Clock, Loader2 } from 'lucide-react';
import { usePatientSummary } from '@/presentation/hooks/ai-analysis';
import type { GetPatientSummaryResponse } from '@/core/use-cases/ai-analysis';
import { toast } from 'sonner';

interface ClinicalSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: number;
  patientName: string;
}

export const ClinicalSummaryModal: React.FC<ClinicalSummaryModalProps> = ({
  isOpen,
  onClose,
  patientId,
  patientName,
}) => {
  const [summaryData, setSummaryData] = useState<GetPatientSummaryResponse | null>(null);

  const { generateSummaryMutation, isLoadingSummary } = usePatientSummary();

  // Generar resumen al abrir el modal
  React.useEffect(() => {
    if (isOpen && !summaryData) {
      handleGenerateSummary();
    }
  }, [isOpen]);

  const handleGenerateSummary = async () => {
    try {
      const result = await generateSummaryMutation.mutateAsync(patientId);
      setSummaryData(result);
    } catch (error) {
      console.error('Error al generar resumen:', error);
      toast.error('No se pudo generar el resumen clínico');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Brain className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Resumen Clínico</h2>
              <p className="text-sm text-gray-600">Paciente {patientName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Disclaimer */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>El resumen se basa en los últimos 3 meses de la historia del paciente.</strong>{' '}
              El contenido es generado con IA y debe ser verificado por un profesional de la salud.
            </p>
          </div>

          {/* Loading State */}
          {isLoadingSummary && (
            <div className="flex flex-col items-center justify-center py-12 space-y-6">
              {/* Animación de cerebro con pulso */}
              <div className="relative">
                <div className="absolute inset-0 bg-blue-400 rounded-full opacity-20 animate-ping"></div>
                <div className="absolute inset-0 bg-purple-400 rounded-full opacity-20 animate-pulse"></div>
                <Brain className="w-16 h-16 text-blue-600 relative z-10 animate-pulse" />
              </div>

              {/* Texto animado */}
              <div className="text-center space-y-2">
                <p className="text-lg font-semibold text-gray-800 animate-pulse">
                  IA analizando historial clínico...
                </p>
                <div className="flex items-center justify-center gap-1">
                  <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>

              {/* Barra de progreso con gradiente */}
              <div className="w-full max-w-md">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 animate-shimmer bg-[length:200%_100%]"></div>
                </div>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Procesando datos del paciente con DeepSeek AI
                </p>
              </div>
            </div>
          )}

          {/* Summary Content */}
          {summaryData && !isLoadingSummary && (
            <>
              {/* Alertas Clínicas */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Alertas clínicas y antecedentes</h3>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{summaryData.summary.clinicalAlerts}</p>
                </div>
              </div>

              {/* Tratamiento Actual */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Tratamiento actual - Ok #{patientId}</h3>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{summaryData.summary.currentTreatment}</p>
                </div>
              </div>

              {/* Historial de Prestaciones */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Historial de prestaciones realizadas</h3>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{summaryData.summary.serviceHistory}</p>
                </div>
              </div>

              {/* Asistente IA - Próximamente */}
              {/* <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Asistente IA</h3>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Función de chat con IA disponible próximamente.</p>
                </div>
              </div> */}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
