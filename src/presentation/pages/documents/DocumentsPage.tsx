import React, { useState, useRef, useCallback } from 'react';
import {
  FileText,
  Download,
  Save,
  RotateCcw,
  Send,
  Plus,
  ChevronRight,
  PenTool,
  Check,
  AlertCircle,
  X,
  Mail,
  Loader,
  Eye
} from 'lucide-react';
import { useDocuments } from '@/presentation/hooks/documents/useDocuments';
import { useLoginMutation, useProfile } from '@/presentation/hooks';
import { documentTemplates } from './templates';
import { Document } from '@/core/use-cases/documents/types';
import { generateDocumentPDF } from './utils/pdfGenerator';

// Interfaces
interface SignatureCanvasRef {
  clear: () => void;
  getSignatureData: () => string;
}

interface NotificationProps {
  type: 'success' | 'error' | 'info';
  message: string;
  onClose: () => void;
}

interface SignatureCanvasProps {
  onSignatureChange?: (signature: string) => void;
  signatureRef: React.RefObject<SignatureCanvasRef | null>;
}

// Componente para la firma digital
const SignatureCanvas: React.FC<SignatureCanvasProps> = ({ onSignatureChange, signatureRef }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

  const getCoordinates = useCallback((event: MouseEvent | TouchEvent): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();

    if ('touches' in event && event.touches && event.touches[0]) {
      return {
        x: event.touches[0].clientX - rect.left,
        y: event.touches[0].clientY - rect.top
      };
    }

    if ('clientX' in event) {
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };
    }

    return { x: 0, y: 0 };
  }, []);

  const startDrawing = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    setIsDrawing(true);
    const coords = getCoordinates(event.nativeEvent);
    setLastPos(coords);
  }, [getCoordinates]);

  const draw = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    event.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCoordinates(event.nativeEvent);

    ctx.beginPath();
    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.lineTo(coords.x, coords.y);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    setLastPos(coords);

    if (onSignatureChange) {
      onSignatureChange(canvas.toDataURL());
    }
  }, [isDrawing, lastPos, getCoordinates, onSignatureChange]);

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
  }, []);

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (onSignatureChange) {
      onSignatureChange('');
    }
  };

  React.useImperativeHandle(signatureRef, () => ({
    clear: clearSignature,
    getSignatureData: () => canvasRef.current?.toDataURL() || ''
  }));

  return (
    <div className="border-2 border-dashed border-cyan-300 rounded-xl p-3 sm:p-4 bg-cyan-50">
      <div className="text-center mb-2 sm:mb-3">
        <PenTool className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-600 mx-auto mb-1 sm:mb-2" />
        <p className="text-xs sm:text-sm font-medium text-cyan-800">Firma aquí</p>
        <p className="text-xs text-cyan-600">Usa tu dedo o mouse para firmar</p>
      </div>

      <canvas
        ref={canvasRef}
        width={400}
        height={150}
        className="w-full h-24 sm:h-32 bg-white rounded-lg border-2 border-cyan-200 cursor-crosshair touch-none"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        style={{ touchAction: 'none' }}
      />

      <div className="flex justify-center mt-2 sm:mt-3">
        <button
          onClick={clearSignature}
          className="flex items-center text-xs sm:text-sm text-slate-600 hover:text-slate-800 transition-colors"
        >
          <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
          Limpiar firma
        </button>
      </div>
    </div>
  );
};

// Componente de notificación
const Notification: React.FC<NotificationProps> = ({ type, message, onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <Check className="w-5 h-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-md w-full mx-4 p-4 rounded-xl border shadow-lg ${getStyles()}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="ml-4 flex-shrink-0 flex"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Componente principal
const DocumentsPage: React.FC = () => {
  const [currentView, setCurrentView] = useState<'list' | 'generate' | 'sign' | 'view'>('list');
  const [selectedPatientId, setSelectedPatientId] = useState<number | undefined>();
  const [selectedDocumentType, setSelectedDocumentType] = useState('consentimiento-estetica');
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [signature, setSignature] = useState('');
  const [sendEmail, setSendEmail] = useState(false);
  const [filterPatientId, setFilterPatientId] = useState<number | undefined>();
  const [filterSearchText, setFilterSearchText] = useState<string>('');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [doctorName, setDoctorName] = useState<string>('');
  const [doctorRut, setDoctorRut] = useState<string>('');
  const [sendingEmailDocId, setSendingEmailDocId] = useState<number | null>(null);
  const [parentName, setParentName] = useState<string>('');
  const [parentRut, setParentRut] = useState<string>('');
  const [parentPhone, setParentPhone] = useState<string>('');
  const [parentRelation, setParentRelation] = useState<string>('Padre');
  const [patientAge, setPatientAge] = useState<string>('');
  const [signedDate, setSignedDate] = useState<string>(new Date().toLocaleDateString('es-CL'));
  const [shouldSendEmail, setShouldSendEmail] = useState(false);
  const signatureRef = useRef<SignatureCanvasRef | null>(null);

  // Use hooks
  const { token } = useLoginMutation();
  const { queryProfile } = useProfile(token || '');
  const {
    queryPatients,
    queryDocuments,
    createDocumentMutation,
    signDocumentMutation,
    sendDocumentEmailMutation,
    isLoadingPatients,
    isLoadingCreate,
    isLoadingSign,
    isLoadingSendEmail,
  } = useDocuments(selectedPatientId); // Solo usar selectedPatientId para crear documentos, no para filtrar la lista

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
  };

  // Obtener nombre y RUT del doctor desde el profile
  React.useEffect(() => {
    if (queryProfile.data) {
      setDoctorName(`${queryProfile.data.name} ${queryProfile.data.lastName || ''}`.trim());
      setDoctorRut(queryProfile.data.rut || '');
    }
  }, [queryProfile.data]);

  const documentTypesList = [
    {
      id: 'consentimiento-estetica',
      name: 'CONSENTIMIENTO INFORMADO - Estética Facial',
      description: 'Para procedimientos estéticos faciales'
    },
    {
      id: 'consentimiento-odontologico',
      name: 'CONSENTIMIENTO INFORMADO - Odontológico',
      description: 'Para tratamientos dentales'
    },
    {
      id: 'consentimiento-anestesia',
      name: 'CONSENTIMIENTO INFORMADO - Anestesia',
      description: 'Para procedimientos bajo anestesia'
    },
    {
      id: 'permiso-padres-estetica',
      name: 'AUTORIZACIÓN DE PADRES - Procedimiento Estético',
      description: 'Autorización para pacientes mayores de edad'
    }
  ];

  // Helper function to interpolate template variables
  const interpolateTemplate = (
    content: string,
    patientName: string,
    patientRut: string,
    doctorName: string = 'Dr./Dra.',
    parentName?: string,
    parentRut?: string,
    parentPhone?: string,
    parentRelation?: string,
    patientAge?: string,
    signedDate?: string
  ): string => {
    let result = content;
    result = result.replace(/{{PATIENT_NAME}}/g, patientName);
    result = result.replace(/{{PATIENT_RUT}}/g, patientRut);
    result = result.replace(/{{DOCTOR_NAME}}/g, doctorName);
    result = result.replace(/{{DOCTOR_RUT}}/g, doctorRut || '');
    result = result.replace(/{{DOCTOR_PHONE}}/g, queryProfile.data?.phone || '');
    result = result.replace(/{{DOCTOR_EMAIL}}/g, queryProfile.data?.email || '');
    result = result.replace(/{{SIGNED_DATE}}/g, signedDate || '');
    if (parentName) {
      result = result.replace(/{{PARENT_NAME}}/g, parentName);
    }
    if (parentRut) {
      result = result.replace(/{{PARENT_RUT}}/g, parentRut);
    }
    if (parentPhone) {
      result = result.replace(/{{PARENT_PHONE}}/g, parentPhone);
    }
    if (parentRelation) {
      result = result.replace(/{{PARENT_RELATION}}/g, parentRelation);
    }
    if (patientAge) {
      result = result.replace(/{{PATIENT_AGE}}/g, patientAge);
    }
    return result;
  };

  // Filtrar pacientes según texto de búsqueda
  const filteredPatients = (queryPatients.data || []).filter(patient => {
    const searchLower = filterSearchText.toLowerCase();
    const fullName = `${patient.nombres} ${patient.apellidos}`.toLowerCase();
    const rut = patient.rut?.toLowerCase() || '';
    return fullName.includes(searchLower) || rut.includes(searchLower);
  });

  // Filtrar documentos según paciente seleccionado
  const filteredDocuments = filterPatientId
    ? (queryDocuments.data || []).filter(doc => doc.id_patient === filterPatientId)
    : (queryDocuments.data || []);

  const handleGenerateDocument = async () => {
    if (!selectedPatientId || !selectedDocumentType) {
      showNotification('error', 'Selecciona un paciente y un tipo de documento');
      return;
    }

    // Validar campos de padre/tutor si es necesario
    if ((selectedDocumentType === 'permiso-padres' || selectedDocumentType === 'permiso-padres-estetica') && (!parentName || !parentRut)) {
      showNotification('error', 'Debes ingresar el nombre y RUT del padre/madre/tutor');
      return;
    }

    const patient = queryPatients.data?.find(p => p.id === selectedPatientId);
    if (!patient) {
      showNotification('error', 'Paciente no encontrado');
      return;
    }

    const docType = documentTypesList.find(d => d.id === selectedDocumentType);
    if (!docType) {
      showNotification('error', 'Tipo de documento no encontrado');
      return;
    }

    const template = documentTemplates[selectedDocumentType as keyof typeof documentTemplates];
    if (!template) {
      showNotification('error', 'Plantilla no encontrada');
      return;
    }

    const patientFullName = `${patient.nombres} ${patient.apellidos}`;

    // Interpolate template with actual patient and doctor data
    const interpolatedContent = interpolateTemplate(
      template.content,
      patientFullName,
      patient.rut,
      doctorName || 'Dr./Dra.',
      parentName || undefined,
      parentRut || undefined,
      parentPhone || undefined,
      parentRelation || undefined,
      patientAge || undefined,
      signedDate || undefined
    );

    try {
      const createdDoc = await createDocumentMutation.mutateAsync({
        id_patient: selectedPatientId,
        document_type: selectedDocumentType,
        title: docType.name,
        content: interpolatedContent,
        patient_name: patientFullName,
        patient_rut: patient.rut,
      });

      showNotification('success', 'Documento generado correctamente');

      // Set the created document and navigate to sign view
      setSelectedDocument(createdDoc);
      setCurrentView('sign');
    } catch (error) {
      showNotification('error', 'Error al generar el documento');
    }
  };

  const handleSignDocument = async () => {
    if (!selectedDocument || !signature) {
      showNotification('error', 'Por favor, agregue su firma antes de guardar');
      return;
    }

    try {
      const patientEmail = queryPatients.data?.find(p => p.id === selectedDocument.id_patient)?.email;

      console.log('🖊️ Firmando documento con estos datos:');
      console.log('  - Document ID:', selectedDocument.id);
      console.log('  - Patient ID:', selectedDocument.id_patient);
      console.log('  - Patient Email:', patientEmail);
      console.log('  - Should Send Email:', shouldSendEmail);
      console.log('  - Signature length:', signature.length);

      const signedDoc = await signDocumentMutation.mutateAsync({
        documentId: selectedDocument.id,
        signatureData: signature,
        sendEmail: shouldSendEmail,
        patientEmail: shouldSendEmail ? patientEmail : undefined,
      });

      console.log('✅ Documento firmado exitosamente:', signedDoc);

      // Generate and download PDF
      try {
        await generateDocumentPDF({
          ...selectedDocument,
          signature_data: signature
        });
        showNotification('success', 'PDF descargado correctamente');
      } catch (pdfError) {
        console.error('Error al generar PDF:', pdfError);
      }

      showNotification('success', 'Documento firmado correctamente' + (shouldSendEmail ? ' y enviado por correo' : ''));

      // Refresh documents list and go back to list view
      setTimeout(() => {
        queryDocuments.refetch?.();
        setCurrentView('list');
        setSelectedDocument(null);
        setSignature('');
        setFilterPatientId(undefined);
        setParentName('');
        setParentRut('');
        setParentPhone('');
        setParentRelation('Padre');
        setPatientAge('');
        setShouldSendEmail(false);
        setSignedDate(new Date().toLocaleDateString('es-CL'));
        signatureRef.current?.clear();
      }, 1000);
    } catch (error) {
      showNotification('error', 'Error al firmar el documento');
    }
  };

  // Vista: Lista de documentos
  if (currentView === 'list') {
    return (
      <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
        {notification && (
          <Notification
            type={notification.type}
            message={notification.message}
            onClose={() => setNotification(null)}
          />
        )}

        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm border border-cyan-200 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Documentos</h1>
                <p className="text-sm sm:text-base text-slate-600 mt-1">Gestiona tus documentos médicos con firma digital</p>
              </div>
              <button
                onClick={() => {
                  setCurrentView('generate');
                  setSelectedPatientId(undefined);
                }}
                className="flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white px-4 sm:px-6 py-2.5 rounded-lg transition-colors font-medium text-sm sm:text-base"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                Generar Documento
              </button>
            </div>
          </div>

          {/* Filtro por paciente con búsqueda */}
          <div className="bg-white rounded-xl shadow-sm border border-cyan-200 p-4 sm:p-6">
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Filtrar por paciente (opcional)
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Busca por nombre o RUT..."
                value={filterSearchText}
                onChange={(e) => {
                  setFilterSearchText(e.target.value);
                  setShowFilterDropdown(true);
                }}
                onFocus={() => setShowFilterDropdown(true)}
                onBlur={() => setTimeout(() => setShowFilterDropdown(false), 200)}
                disabled={isLoadingPatients}
                className="w-full px-4 py-2.5 border border-cyan-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
              />

              {/* Dropdown de resultados de búsqueda */}
              {showFilterDropdown && filterSearchText && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-cyan-200 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                  {filteredPatients.length > 0 ? (
                    <>
                      <button
                        onClick={() => {
                          setFilterPatientId(undefined);
                          setFilterSearchText('');
                          setShowFilterDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2.5 hover:bg-cyan-50 text-sm text-slate-600 border-b border-cyan-100"
                      >
                        Limpiar filtro
                      </button>
                      {filteredPatients.map((patient) => (
                        <button
                          key={patient.id}
                          onClick={() => {
                            setFilterPatientId(patient.id);
                            setFilterSearchText(`${patient.nombres} ${patient.apellidos}`);
                            setShowFilterDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 hover:bg-cyan-50 text-sm transition-colors ${
                            filterPatientId === patient.id ? 'bg-cyan-100 text-cyan-900 font-medium' : 'text-slate-700'
                          }`}
                        >
                          <div>{patient.nombres} {patient.apellidos}</div>
                          <div className="text-xs text-slate-500">{patient.rut}</div>
                        </button>
                      ))}
                    </>
                  ) : (
                    <div className="px-4 py-3 text-sm text-slate-500 text-center">
                      No se encontraron pacientes
                    </div>
                  )}
                </div>
              )}

              {/* Mostrar paciente seleccionado */}
              {filterPatientId && (
                <button
                  onClick={() => {
                    setFilterPatientId(undefined);
                    setFilterSearchText('');
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cyan-500 hover:text-cyan-700 transition-colors"
                  title="Limpiar filtro"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Tabla de Documentos - Responsiva */}
          {isLoadingPatients ? (
            <div className="flex justify-center py-12">
              <Loader className="w-8 h-8 text-cyan-500 animate-spin" />
            </div>
          ) : filteredDocuments && filteredDocuments.length > 0 ? (
            <>
              {/* Vista Desktop (tabla) */}
              <div className="hidden md:block bg-white rounded-xl shadow-sm border border-cyan-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-cyan-50 border-b border-cyan-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-cyan-900">Documento</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-cyan-900">Paciente</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-cyan-900">RUT</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-cyan-900">Fecha</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-cyan-900">Estado</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-cyan-900">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredDocuments.map((doc) => (
                        <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm text-slate-900 font-medium">{doc.title}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{doc.patient_name}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{doc.patient_rut}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {new Date(doc.createdAt || '').toLocaleDateString('es-CL')}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                              doc.status === 'firmado'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {doc.status === 'firmado' ? '✓ Firmado' : '⏱ Pendiente'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 flex-wrap">
                              {doc.status === 'pendiente' ? (
                                <>
                                  <button
                                    onClick={() => {
                                      setSelectedDocument(doc);
                                      setCurrentView('sign');
                                    }}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded text-xs font-medium transition-colors"
                                    title="Firmar documento"
                                  >
                                    <PenTool className="w-3 h-3" />
                                    Firmar
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => {
                                      setSelectedDocument(doc);
                                      setCurrentView('view');
                                    }}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-medium transition-colors"
                                    title="Ver documento"
                                  >
                                    <Eye className="w-3 h-3" />
                                    Ver
                                  </button>
                                  <button
                                    onClick={() => {
                                      try {
                                        generateDocumentPDF(doc);
                                      } catch (error) {
                                        showNotification('error', 'Error al descargar PDF');
                                      }
                                    }}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded text-xs font-medium transition-colors"
                                    title="Descargar PDF"
                                  >
                                    <Download className="w-3 h-3" />
                                    PDF
                                  </button>
                                  <button
                                    onClick={() => {
                                      const patientEmail = queryPatients.data?.find(p => p.id === doc.id_patient)?.email;
                                      if (!patientEmail) {
                                        showNotification('error', 'Email del paciente no disponible');
                                        return;
                                      }
                                      setSendingEmailDocId(doc.id);
                                      sendDocumentEmailMutation.mutate(
                                        {
                                          documentId: doc.id,
                                          patientEmail: patientEmail,
                                        },
                                        {
                                          onSuccess: () => {
                                            showNotification('success', 'Documento enviado por correo');
                                            setSendingEmailDocId(null);
                                          },
                                          onError: () => {
                                            showNotification('error', 'Error al enviar documento');
                                            setSendingEmailDocId(null);
                                          },
                                        }
                                      );
                                    }}
                                    disabled={sendingEmailDocId === doc.id}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-500 hover:bg-purple-600 text-white rounded text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Enviar por correo"
                                  >
                                    {sendingEmailDocId === doc.id ? (
                                      <Loader className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <Mail className="w-3 h-3" />
                                    )}
                                    Email
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Vista Mobile (cards) */}
              <div className="md:hidden space-y-4">
                {filteredDocuments.map((doc) => (
                  <div key={doc.id} className="bg-white rounded-lg shadow-sm border border-cyan-200 p-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-slate-900 text-sm">{doc.title}</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className="text-gray-500">Paciente</p>
                          <p className="text-slate-700 font-medium">{doc.patient_name}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">RUT</p>
                          <p className="text-slate-700 font-medium">{doc.patient_rut}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Fecha</p>
                          <p className="text-slate-700 font-medium">
                            {new Date(doc.createdAt || '').toLocaleDateString('es-CL')}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Estado</p>
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            doc.status === 'firmado'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {doc.status === 'firmado' ? '✓ Firmado' : '⏱ Pendiente'}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
                        {doc.status === 'pendiente' ? (
                          <button
                            onClick={() => {
                              setSelectedDocument(doc);
                              setCurrentView('sign');
                            }}
                            className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded text-xs font-medium transition-colors"
                            title="Firmar documento"
                          >
                            <PenTool className="w-3 h-3" />
                            Firmar
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setSelectedDocument(doc);
                                setCurrentView('view');
                              }}
                              className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-medium transition-colors"
                              title="Ver documento"
                            >
                              <Eye className="w-3 h-3" />
                              Ver
                            </button>
                            <button
                              onClick={() => {
                                try {
                                  generateDocumentPDF(doc);
                                } catch (error) {
                                  showNotification('error', 'Error al descargar PDF');
                                }
                              }}
                              className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded text-xs font-medium transition-colors"
                              title="Descargar PDF"
                            >
                              <Download className="w-3 h-3" />
                              PDF
                            </button>
                            <button
                              onClick={() => {
                                const patientEmail = queryPatients.data?.find(p => p.id === doc.id_patient)?.email;
                                if (!patientEmail) {
                                  showNotification('error', 'Email del paciente no disponible');
                                  return;
                                }
                                setSendingEmailDocId(doc.id);
                                sendDocumentEmailMutation.mutate(
                                  {
                                    documentId: doc.id,
                                    patientEmail: patientEmail,
                                  },
                                  {
                                    onSuccess: () => {
                                      showNotification('success', 'Documento enviado por correo');
                                      setSendingEmailDocId(null);
                                    },
                                    onError: () => {
                                      showNotification('error', 'Error al enviar documento');
                                      setSendingEmailDocId(null);
                                    },
                                  }
                                );
                              }}
                              disabled={sendingEmailDocId === doc.id}
                              className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Enviar por correo"
                            >
                              {sendingEmailDocId === doc.id ? (
                                <Loader className="w-3 h-3 animate-spin" />
                              ) : (
                                <Mail className="w-3 h-3" />
                              )}
                              Email
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No hay documentos disponibles</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Vista: Generar documento
  if (currentView === 'generate') {
    return (
      <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
        {notification && (
          <Notification
            type={notification.type}
            message={notification.message}
            onClose={() => setNotification(null)}
          />
        )}

        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => setCurrentView('list')}
            className="flex items-center text-cyan-600 hover:text-cyan-700 transition-colors text-sm sm:text-base mb-6"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 mr-1 rotate-180" />
            Volver a documentos
          </button>

          <div className="bg-white rounded-xl shadow-sm border border-cyan-200 p-4 sm:p-6 space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">Generar Documento</h2>
              <p className="text-sm sm:text-base text-slate-600">Selecciona un paciente y tipo de documento</p>
            </div>

            {/* Selector de paciente */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Paciente *
              </label>
              <select
                value={selectedPatientId || ''}
                onChange={(e) => setSelectedPatientId(Number(e.target.value))}
                disabled={isLoadingPatients}
                className="w-full px-4 py-2.5 border border-cyan-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
              >
                <option value="">Selecciona un paciente...</option>
                {queryPatients.data?.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.nombres} {patient.apellidos} - {patient.rut}
                  </option>
                ))}
              </select>
            </div>

            {/* Selector de tipo de documento */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Tipo de Documento *
              </label>
              <div className="space-y-2">
                {documentTypesList.map((doc) => (
                  <label key={doc.id} className="flex items-start p-3 border border-cyan-200 rounded-lg hover:bg-cyan-50 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="documentType"
                      value={doc.id}
                      checked={selectedDocumentType === doc.id}
                      onChange={(e) => setSelectedDocumentType(e.target.value)}
                      className="mt-1 w-4 h-4 text-cyan-500 border-cyan-300 focus:ring-cyan-500 flex-shrink-0"
                    />
                    <div className="ml-3 min-w-0">
                      <p className="font-medium text-slate-700 text-sm">{doc.name}</p>
                      <p className="text-xs text-slate-500">{doc.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Campos de Padre/Tutor (solo para documentos de autorización) */}
            {(selectedDocumentType === 'permiso-padres' || selectedDocumentType === 'permiso-padres-estetica') && (
              <div className="border-l-4 border-blue-400 bg-blue-50 p-4 rounded space-y-4">
                <h3 className="text-sm font-semibold text-blue-900">Datos Requeridos</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Edad del Paciente *
                    </label>
                    <input
                      type="number"
                      value={patientAge}
                      onChange={(e) => setPatientAge(e.target.value)}
                      placeholder="Ej: 16"
                      className="w-full px-4 py-2.5 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Relación del Padre/Tutor *
                    </label>
                    <select
                      value={parentRelation}
                      onChange={(e) => setParentRelation(e.target.value)}
                      className="w-full px-4 py-2.5 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      <option value="Padre">Padre</option>
                      <option value="Madre">Madre</option>
                      <option value="Tutor">Tutor</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nombre del Padre/Madre/Tutor *
                  </label>
                  <input
                    type="text"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    placeholder="Ej: Juan García Pérez"
                    className="w-full px-4 py-2.5 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      RUT del Padre/Madre/Tutor *
                    </label>
                    <input
                      type="text"
                      value={parentRut}
                      onChange={(e) => setParentRut(e.target.value)}
                      placeholder="Ej: 12.345.678-9"
                      className="w-full px-4 py-2.5 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Teléfono del Padre/Madre/Tutor
                    </label>
                    <input
                      type="tel"
                      value={parentPhone}
                      onChange={(e) => setParentPhone(e.target.value)}
                      placeholder="Ej: +56 9 1234 5678"
                      className="w-full px-4 py-2.5 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Campo de Fecha de Firma (para todos los documentos) */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Fecha del Documento *
              </label>
              <input
                type="date"
                value={signedDate.split('/').reverse().join('-')}
                onChange={(e) => {
                  const date = new Date(e.target.value);
                  setSignedDate(date.toLocaleDateString('es-CL'));
                }}
                className="w-full px-4 py-2.5 border border-cyan-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Botones */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
              <button
                onClick={() => setCurrentView('list')}
                className="w-full sm:w-auto px-6 py-2.5 text-slate-600 hover:text-slate-800 transition-colors text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleGenerateDocument}
                disabled={!selectedPatientId || !selectedDocumentType || isLoadingCreate}
                className="w-full sm:w-auto bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center justify-center gap-2"
              >
                {isLoadingCreate && <Loader className="w-4 h-4 animate-spin" />}
                Generar Documento
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vista: Firmar documento
  if (currentView === 'sign' && selectedDocument) {
    return (
      <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
        {notification && (
          <Notification
            type={notification.type}
            message={notification.message}
            onClose={() => setNotification(null)}
          />
        )}

        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
          <button
            onClick={() => setCurrentView('list')}
            className="flex items-center text-cyan-600 hover:text-cyan-700 transition-colors text-sm sm:text-base"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 mr-1 rotate-180" />
            Volver a documentos
          </button>

          {/* Documento preview */}
          <div className="bg-white rounded-xl shadow-sm border border-cyan-200 p-4 sm:p-8">
            <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
              {selectedDocument.content}
            </div>
          </div>

          {/* Firma */}
          <div className="bg-white rounded-xl shadow-sm border border-cyan-200 p-4 sm:p-6 space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Firma del Documento</h3>
            <SignatureCanvas signatureRef={signatureRef} onSignatureChange={setSignature} />
          </div>

          {/* Opciones */}
          <div className="bg-white rounded-xl shadow-sm border border-cyan-200 p-4 sm:p-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={shouldSendEmail}
                onChange={(e) => setShouldSendEmail(e.target.checked)}
                className="w-4 h-4 text-cyan-500 border-cyan-300 rounded focus:ring-cyan-500"
              />
              <span className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Enviar documento firmado por correo electrónico
              </span>
            </label>
          </div>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <button
              onClick={() => setCurrentView('list')}
              className="w-full sm:w-auto px-6 py-2.5 text-slate-600 hover:text-slate-800 transition-colors text-sm font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleSignDocument}
              disabled={!signature || isLoadingSign}
              className="w-full sm:w-auto bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center justify-center gap-2"
            >
              {isLoadingSign && <Loader className="w-4 h-4 animate-spin" />}
              <Check className="w-4 h-4" />
              Firmar y Guardar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Vista: Ver documento firmado
  if (currentView === 'view' && selectedDocument) {
    return (
      <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
        {notification && (
          <Notification
            type={notification.type}
            message={notification.message}
            onClose={() => setNotification(null)}
          />
        )}

        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
          <button
            onClick={() => setCurrentView('list')}
            className="flex items-center text-cyan-600 hover:text-cyan-700 transition-colors text-sm sm:text-base"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 mr-1 rotate-180" />
            Volver a documentos
          </button>

          {/* Documento preview */}
          <div className="bg-white rounded-xl shadow-sm border border-cyan-200 p-4 sm:p-8">
            <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm leading-relaxed text-gray-700 mb-8">
              {selectedDocument.content}
            </div>

            {/* Signature display */}
            {selectedDocument.signature_data && (
              <div className="border-t-2 border-gray-200 pt-8">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Firma del Documento</h3>
                <img
                  src={selectedDocument.signature_data}
                  alt="Firma del paciente"
                  className="w-40 h-24 border-2 border-cyan-300 rounded-lg bg-white"
                />
                {selectedDocument.signed_date && (
                  <p className="text-sm text-gray-600 mt-4">
                    Firmado el: {new Date(selectedDocument.signed_date).toLocaleDateString('es-CL')} a las {new Date(selectedDocument.signed_date).toLocaleTimeString('es-CL')}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <button
              onClick={() => {
                setCurrentView('list');
                setSelectedDocument(null);
              }}
              className="w-full sm:w-auto px-6 py-2.5 text-slate-600 hover:text-slate-800 transition-colors text-sm font-medium"
            >
              Cerrar
            </button>
            <button
              onClick={() => {
                try {
                  generateDocumentPDF(selectedDocument);
                  showNotification('success', 'PDF descargado correctamente');
                } catch (error) {
                  showNotification('error', 'Error al descargar el PDF');
                }
              }}
              className="w-full sm:w-auto bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2.5 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Descargar PDF
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default DocumentsPage;
