import React from 'react';
import { Download, Loader } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { AuditLog } from '@/presentation/hooks/audit-history/useAuditHistory';
import { Patient } from '@/core/use-cases/patients';

interface ExportHistoryButtonProps {
  logs: AuditLog[];
  patient: Patient;
  isLoading?: boolean;
}

const ExportHistoryButton: React.FC<ExportHistoryButtonProps> = ({
  logs,
  patient,
  isLoading = false,
}) => {
  const [isExporting, setIsExporting] = React.useState(false);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getEntityTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      PACIENTE: 'Paciente',
      PRESUPUESTO: 'Presupuesto',
      TRATAMIENTO: 'Tratamiento',
      CITA: 'Cita',
      DOCUMENTO: 'Documento',
    };
    return labels[type] || type;
  };

  const getActionLabel = (action: string): string => {
    const labels: Record<string, string> = {
      created: 'Creado',
      updated: 'Actualizado',
      status_changed: 'Cambio de estado',
      deleted: 'Eliminado',
      signed: 'Firma de documento',
      CREATED: 'Creado',
      UPDATED: 'Actualizado',
      STATUS_CHANGED: 'Cambio de estado',
      DELETED: 'Eliminado',
      SIGNED: 'Firma de documento',
    };
    return labels[action] || action;
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean') return value ? 'Sí' : 'No';
    if (typeof value === 'string') {
      // Excluir datos codificados en base64 (muy largos)
      if (value.length > 100 && (value.startsWith('data:') || /^[A-Za-z0-9+/=]{100,}$/.test(value))) {
        return '[Archivo binario]';
      }
      return value;
    }
    if (typeof value === 'object') {
      // Si es un objeto, mostrar pares clave-valor legibles
      return Object.entries(value)
        .filter(([_, v]) => {
          // Filtrar valores base64
          return !(typeof v === 'string' && v.length > 100 && (v.startsWith('data:') || /^[A-Za-z0-9+/=]{100,}$/.test(v)));
        })
        .map(([key, val]) => `${key}: ${formatValue(val)}`)
        .join(', ');
    }
    return String(value);
  };

  const getReadableLabel = (key: string): string => {
    const labels: Record<string, string> = {
      status: 'Estado',
      title: 'Título',
      nombre_servicio: 'Nombre del Servicio',
      email: 'Email',
      telefono: 'Teléfono',
      nombres: 'Nombres',
      apellidos: 'Apellidos',
      fecha: 'Fecha',
      signed_date: 'Fecha de Firma',
      document_type: 'Tipo de Documento',
    };
    return labels[key] || key;
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);

      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - 2 * margin;

      let yPosition = margin;

      // Título
      pdf.setFontSize(18);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Historial Médico del Paciente', margin, yPosition);
      yPosition += 10;

      // Información del paciente
      pdf.setFontSize(11);
      pdf.setTextColor(60, 60, 60);
      pdf.text(`Paciente: ${patient.nombres} ${patient.apellidos}`, margin, yPosition);
      yPosition += 6;
      pdf.text(`RUT: ${patient.rut}`, margin, yPosition);
      yPosition += 6;
      pdf.text(
        `Fecha de reporte: ${new Date().toLocaleDateString('es-CL', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })}`,
        margin,
        yPosition
      );
      yPosition += 10;

      // Línea separadora
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 8;

      // Tabla de registros - ordenados de más antiguo a más reciente
      pdf.setFontSize(10);

      const sortedLogsForExport = [...logs].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

      sortedLogsForExport.forEach((log, index) => {
        // Verificar si necesitamos nueva página
        if (yPosition > pageHeight - 20) {
          pdf.addPage();
          yPosition = margin;
        }

        // Encabezado del registro
        pdf.setTextColor(0, 102, 204);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${index + 1}. ${getEntityTypeLabel(log.entity_type)}`, margin, yPosition);
        yPosition += 5;

        // Detalles
        pdf.setTextColor(60, 60, 60);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);

        const details = [
          `Acción: ${getActionLabel(log.action)}`,
          `Fecha: ${formatDate(log.created_at)}`,
          `ID Entidad: ${log.entity_id}`,
          ...(log.notes ? [`Notas: ${log.notes}`] : []),
        ];

        details.forEach((detail) => {
          const lines = pdf.splitTextToSize(detail, contentWidth - 10) as string[];
          lines.forEach((line: string) => {
            if (yPosition > pageHeight - 15) {
              pdf.addPage();
              yPosition = margin;
            }
            pdf.text(line, margin + 5, yPosition);
            yPosition += 4;
          });
        });

        // Cambios (si existen)
        if (log.old_values || log.new_values) {
          if (yPosition > pageHeight - 15) {
            pdf.addPage();
            yPosition = margin;
          }

          pdf.setFont('helvetica', 'bold');
          pdf.text('Cambios:', margin + 5, yPosition);
          yPosition += 4;

          pdf.setFont('helvetica', 'normal');
          if (log.old_values) {
            Object.entries(log.old_values).forEach(([key, value]) => {
              // Saltar valores base64
              if (typeof value === 'string' && value.length > 100 && (value.startsWith('data:') || /^[A-Za-z0-9+/=]{100,}$/.test(value))) {
                return;
              }

              const oldText = `${getReadableLabel(key)} anterior: ${formatValue(value)}`;
              const oldLines = pdf.splitTextToSize(oldText, contentWidth - 15) as string[];
              oldLines.forEach((line: string) => {
                if (yPosition > pageHeight - 15) {
                  pdf.addPage();
                  yPosition = margin;
                }
                pdf.text(line, margin + 10, yPosition);
                yPosition += 3;
              });
            });
          }

          if (log.new_values) {
            Object.entries(log.new_values).forEach(([key, value]) => {
              // Saltar valores base64
              if (typeof value === 'string' && value.length > 100 && (value.startsWith('data:') || /^[A-Za-z0-9+/=]{100,}$/.test(value))) {
                return;
              }

              const newText = `${getReadableLabel(key)} nuevo: ${formatValue(value)}`;
              const newLines = pdf.splitTextToSize(newText, contentWidth - 15) as string[];
              newLines.forEach((line: string) => {
                if (yPosition > pageHeight - 15) {
                  pdf.addPage();
                  yPosition = margin;
                }
                pdf.text(line, margin + 10, yPosition);
                yPosition += 3;
              });
            });
          }
        }

        yPosition += 5;

        // Línea separadora entre registros
        if (index < sortedLogsForExport.length - 1) {
          pdf.setDrawColor(220, 220, 220);
          pdf.line(margin, yPosition, pageWidth - margin, yPosition);
          yPosition += 3;
        }
      });

      // Guardar PDF
      const filename = `Historial_${patient.nombres}_${patient.apellidos}_${new Date().getTime()}.pdf`;
      pdf.save(filename);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      alert('Error al exportar el historial a PDF');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isLoading || isExporting || logs.length === 0}
      className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      title={logs.length === 0 ? 'No hay registros para exportar' : 'Exportar historial a PDF'}
    >
      {isExporting ? (
        <Loader className="w-4 h-4 text-green-600 animate-spin" />
      ) : (
        <Download className="w-4 h-4 text-green-600" />
      )}
      <span className="text-sm font-medium text-green-700">
        {isExporting ? 'Exportando...' : 'Exportar PDF'}
      </span>
    </button>
  );
};

export { ExportHistoryButton };
