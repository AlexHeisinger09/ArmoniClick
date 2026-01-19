// src/presentation/pages/patient/tabs/consents/PatientConsents.tsx
import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  FileText,
  Download,
  Plus,
  PenTool,
  Eye,
  Trash2,
  Mail,
  Loader,
  AlertCircle,
  X,
  ChevronRight,
  Check,
  RotateCcw
} from 'lucide-react';
import { Patient } from '@/core/use-cases/patients';
import { useDocuments } from '@/presentation/hooks/documents/useDocuments';
import { useProfile } from '@/presentation/hooks';
import { useLoginMutation } from '@/presentation/hooks';
import { Document } from '@/core/use-cases/documents/types';
import { generateDocumentPDF } from '@/presentation/pages/documents/utils/pdfGenerator';
import { documentTemplates } from '@/presentation/pages/documents/templates';

interface PatientConsentsProps {
  patient: Patient;
}

interface SignatureCanvasRef {
  clear: () => void;
  getSignatureData: () => string;
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
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in event && event.touches && event.touches[0]) {
      return {
        x: (event.touches[0].clientX - rect.left) * scaleX,
        y: (event.touches[0].clientY - rect.top) * scaleY
      };
    }

    if ('clientX' in event) {
      return {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY
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
    ctx.lineWidth = 3;
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
    <div className="border-2 border-dashed border-cyan-300 rounded-xl p-3 sm:p-4 bg-cyan-50 max-w-2xl mx-auto">
      <div className="text-center mb-2 sm:mb-3">
        <PenTool className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-600 mx-auto mb-1 sm:mb-2" />
        <p className="text-xs sm:text-sm font-medium text-cyan-800">Firma aquí</p>
        <p className="text-xs text-cyan-600">Usa tu dedo o mouse para firmar</p>
      </div>

      <div className="w-full bg-white rounded-lg border-2 border-cyan-200 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={600}
          height={200}
          className="w-full h-32 sm:h-40 bg-white cursor-crosshair block touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          style={{ touchAction: 'none' }}
        />
      </div>

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

const PatientConsents: React.FC<PatientConsentsProps> = ({ patient }) => {
  const [currentView, setCurrentView] = useState<'list' | 'generate' | 'preview' | 'sign' | 'view'>('list');
  const [sendingEmailDocId, setSendingEmailDocId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [selectedDocumentType, setSelectedDocumentType] = useState('consentimiento-estetica');
  const [signature, setSignature] = useState('');
  const [shouldSendEmail, setShouldSendEmail] = useState(false);
  const [parentName, setParentName] = useState('');
  const [parentRut, setParentRut] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentRelation, setParentRelation] = useState('Padre');
  const [patientAge, setPatientAge] = useState('');
  const [signedDate, setSignedDate] = useState(new Date().toLocaleDateString('es-CL'));
  const [editedContent, setEditedContent] = useState('');
  const [isEditingContent, setIsEditingContent] = useState(false);
  const signatureRef = useRef<SignatureCanvasRef | null>(null);

  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const { token } = useLoginMutation();
  const { queryProfile } = useProfile(token || '');

  const {
    queryDocuments,
    createDocumentMutation,
    updateDocumentMutation,
    signDocumentMutation,
    sendDocumentEmailMutation,
    deleteDocumentMutation,
    isLoadingCreate,
    isLoadingSign,
  } = useDocuments(patient.id);

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Filtrar documentos del paciente actual
  const patientDocuments = useMemo(() => {
    return (queryDocuments.data || []).filter(doc => doc.id_patient === patient.id);
  }, [queryDocuments.data, patient.id]);

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

  const interpolateTemplate = (
    content: string,
    patientName: string,
    patientRut: string,
    doctorName: string = 'Dr./Dra.',
    doctorRut: string = '',
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
    if (parentName) result = result.replace(/{{PARENT_NAME}}/g, parentName);
    if (parentRut) result = result.replace(/{{PARENT_RUT}}/g, parentRut);
    if (parentPhone) result = result.replace(/{{PARENT_PHONE}}/g, parentPhone);
    if (parentRelation) result = result.replace(/{{PARENT_RELATION}}/g, parentRelation);
    if (patientAge) result = result.replace(/{{PATIENT_AGE}}/g, patientAge);
    return result;
  };

  const handlePreviewDocument = () => {
    if (!selectedDocumentType) {
      showNotification('error', 'Selecciona un tipo de documento');
      return;
    }

    if ((selectedDocumentType === 'permiso-padres' || selectedDocumentType === 'permiso-padres-estetica') && (!parentName || !parentRut)) {
      showNotification('error', 'Debes ingresar el nombre y RUT del padre/madre/tutor');
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
    const doctorName = queryProfile.data ? `${queryProfile.data.name} ${queryProfile.data.lastName || ''}`.trim() : 'Dr./Dra.';
    const doctorRut = queryProfile.data?.rut || '';

    const interpolatedContent = interpolateTemplate(
      template.content,
      patientFullName,
      patient.rut,
      doctorName,
      doctorRut,
      parentName || undefined,
      parentRut || undefined,
      parentPhone || undefined,
      parentRelation || undefined,
      patientAge || undefined,
      signedDate || undefined
    );

    // Guardar contenido interpolado y tipo de documento para crear después
    setEditedContent(interpolatedContent);
    setCurrentView('preview');
  };

  const handleCreateDocument = async () => {
    const docType = documentTypesList.find(d => d.id === selectedDocumentType);
    if (!docType) {
      showNotification('error', 'Tipo de documento no encontrado');
      return;
    }

    const patientFullName = `${patient.nombres} ${patient.apellidos}`;

    try {
      const createdDoc = await createDocumentMutation.mutateAsync({
        id_patient: patient.id,
        document_type: selectedDocumentType,
        title: docType.name,
        content: editedContent, // Usar el contenido editado
        patient_name: patientFullName,
        patient_rut: patient.rut,
      });

      showNotification('success', 'Documento generado correctamente');
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
      // Primero actualizar el contenido si fue editado
      if (editedContent && editedContent !== selectedDocument.content) {
        await updateDocumentMutation.mutateAsync({
          documentId: selectedDocument.id,
          content: editedContent,
          title: selectedDocument.title,
        });

        // Actualizar el documento seleccionado con el nuevo contenido
        selectedDocument.content = editedContent;
      }

      await signDocumentMutation.mutateAsync({
        documentId: selectedDocument.id,
        signatureData: signature,
        sendEmail: shouldSendEmail,
        patientEmail: shouldSendEmail ? patient.email : undefined,
      });

      try {
        await generateDocumentPDF({
          ...selectedDocument,
          content: editedContent || selectedDocument.content,
          signature_data: signature
        });
        showNotification('success', 'PDF descargado correctamente');
      } catch (pdfError) {
        console.error('Error al generar PDF:', pdfError);
      }

      showNotification('success', 'Documento firmado correctamente' + (shouldSendEmail ? ' y enviado por correo' : ''));

      setTimeout(() => {
        queryDocuments.refetch?.();
        setCurrentView('list');
        setSelectedDocument(null);
        setSignature('');
        setEditedContent('');
        setIsEditingContent(false);
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

  const handleDeleteDocument = async () => {
    if (!documentToDelete) return;

    try {
      await deleteDocumentMutation.mutateAsync(documentToDelete.id);
      showNotification('success', 'Documento eliminado correctamente');
      queryDocuments.refetch?.();
      setShowDeleteConfirm(false);
      setDocumentToDelete(null);
    } catch (error) {
      showNotification('error', 'Error al eliminar el documento');
    }
  };

  const handleSendEmail = (doc: Document) => {
    if (!patient.email) {
      showNotification('error', 'El paciente no tiene email registrado');
      return;
    }

    setSendingEmailDocId(doc.id);
    sendDocumentEmailMutation.mutate(
      {
        documentId: doc.id,
        patientEmail: patient.email,
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
  };

  // Vista: Generar documento
  if (currentView === 'generate') {
    return (
      <div className="space-y-4">
        {notification && (
          <div className={`fixed top-4 right-4 z-50 max-w-md w-full mx-4 p-4 rounded-xl border shadow-lg ${
            notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
            notification.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
            'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            <div className="flex items-start">
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium">{notification.message}</p>
              </div>
              <button onClick={() => setNotification(null)} className="ml-4 flex-shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <button
          onClick={() => setCurrentView('list')}
          className="flex items-center text-cyan-600 hover:text-cyan-700 transition-colors text-sm"
        >
          <ChevronRight className="w-4 h-4 mr-1 rotate-180" />
          Volver a consentimientos
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Generar Consentimiento</h2>
            <p className="text-sm text-slate-600">Paciente: {patient.nombres} {patient.apellidos}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Tipo de Documento *
            </label>
            <div className="space-y-2">
              {documentTypesList.map((doc) => (
                <label key={doc.id} className="flex items-start p-3 border border-slate-200 rounded-lg hover:bg-cyan-50 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="documentType"
                    value={doc.id}
                    checked={selectedDocumentType === doc.id}
                    onChange={(e) => setSelectedDocumentType(e.target.value)}
                    className="mt-1 w-4 h-4 text-cyan-500 border-cyan-300 focus:ring-cyan-500"
                  />
                  <div className="ml-3">
                    <p className="font-medium text-slate-700 text-sm">{doc.name}</p>
                    <p className="text-xs text-slate-500">{doc.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {(selectedDocumentType === 'permiso-padres' || selectedDocumentType === 'permiso-padres-estetica') && (
            <div className="border-l-4 border-blue-400 bg-blue-50 p-4 rounded space-y-4">
              <h3 className="text-sm font-semibold text-blue-900">Datos del Padre/Tutor</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Edad del Paciente *</label>
                  <input
                    type="number"
                    value={patientAge}
                    onChange={(e) => setPatientAge(e.target.value)}
                    placeholder="Ej: 16"
                    className="w-full px-4 py-2.5 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Relación *</label>
                  <select
                    value={parentRelation}
                    onChange={(e) => setParentRelation(e.target.value)}
                    className="w-full px-4 py-2.5 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="Padre">Padre</option>
                    <option value="Madre">Madre</option>
                    <option value="Tutor">Tutor</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Nombre Completo *</label>
                <input
                  type="text"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  placeholder="Ej: Juan García Pérez"
                  className="w-full px-4 py-2.5 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">RUT *</label>
                  <input
                    type="text"
                    value={parentRut}
                    onChange={(e) => setParentRut(e.target.value)}
                    placeholder="Ej: 12.345.678-9"
                    className="w-full px-4 py-2.5 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Teléfono</label>
                  <input
                    type="tel"
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    placeholder="Ej: +56 9 1234 5678"
                    className="w-full px-4 py-2.5 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Fecha del Documento *</label>
            <input
              type="date"
              value={(() => {
                // Convertir de formato chileno dd/mm/yyyy a ISO yyyy-mm-dd
                const parts = signedDate.split('/');
                if (parts.length === 3) {
                  const [day, month, year] = parts;
                  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                }
                return new Date().toISOString().split('T')[0];
              })()}
              onChange={(e) => {
                // Convertir de ISO yyyy-mm-dd a formato chileno dd/mm/yyyy
                const [year, month, day] = e.target.value.split('-');
                setSignedDate(`${day}/${month}/${year}`);
              }}
              className="w-full sm:w-64 px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 text-sm cursor-pointer"
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
            <button
              onClick={() => setCurrentView('list')}
              className="w-full sm:w-auto px-6 py-2.5 text-slate-600 hover:text-slate-800 transition-colors text-sm font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handlePreviewDocument}
              disabled={!selectedDocumentType}
              className="w-full sm:w-auto bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50 text-sm font-medium flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Vista Previa
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Vista: Vista previa antes de crear documento
  if (currentView === 'preview') {
    const docType = documentTypesList.find(d => d.id === selectedDocumentType);

    return (
      <div className="space-y-4">
        {notification && (
          <div className={`fixed top-4 right-4 z-50 max-w-md w-full mx-4 p-4 rounded-xl border shadow-lg ${
            notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
            notification.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
            'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            <div className="flex items-start">
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium">{notification.message}</p>
              </div>
              <button onClick={() => setNotification(null)} className="ml-4 flex-shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <button
          onClick={() => {
            setCurrentView('generate');
            setEditedContent('');
            setIsEditingContent(false);
          }}
          className="flex items-center text-cyan-600 hover:text-cyan-700 transition-colors text-sm"
        >
          <ChevronRight className="w-4 h-4 mr-1 rotate-180" />
          Volver a configuración
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Vista Previa del Documento</h2>
            <p className="text-sm text-slate-600">{docType?.name}</p>
            <p className="text-xs text-cyan-600 mt-2">Puedes editar el contenido antes de crear el documento</p>
          </div>

          <textarea
            value={editedContent}
            onChange={(e) => {
              setEditedContent(e.target.value);
              setIsEditingContent(true);
            }}
            className="w-full min-h-[500px] p-4 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm leading-relaxed text-gray-700 font-sans resize-y"
            placeholder="Contenido del documento..."
          />

          {isEditingContent && (
            <p className="mt-2 text-xs text-cyan-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Has editado el contenido. Los cambios se guardarán al crear el documento.
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3">
          <button
            onClick={() => {
              setCurrentView('generate');
              setEditedContent('');
              setIsEditingContent(false);
            }}
            className="w-full sm:w-auto px-6 py-2.5 text-slate-600 hover:text-slate-800 transition-colors text-sm font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleCreateDocument}
            disabled={!editedContent || isLoadingCreate}
            className="w-full sm:w-auto bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50 text-sm font-medium flex items-center justify-center gap-2"
          >
            {isLoadingCreate && <Loader className="w-4 h-4 animate-spin" />}
            <Check className="w-4 h-4" />
            Crear y Continuar a Firma
          </button>
        </div>
      </div>
    );
  }

  // Vista: Firmar documento
  if (currentView === 'sign' && selectedDocument) {
    return (
      <div className="space-y-4">
        {notification && (
          <div className={`fixed top-4 right-4 z-50 max-w-md w-full mx-4 p-4 rounded-xl border shadow-lg ${
            notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
            notification.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
            'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            <div className="flex items-start">
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium">{notification.message}</p>
              </div>
              <button onClick={() => setNotification(null)} className="ml-4 flex-shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <button
          onClick={() => setCurrentView('list')}
          className="flex items-center text-cyan-600 hover:text-cyan-700 transition-colors text-sm"
        >
          <ChevronRight className="w-4 h-4 mr-1 rotate-180" />
          Volver a consentimientos
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-8">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Contenido del Documento</h3>
            <p className="text-xs text-slate-500">Puedes editar el contenido antes de firmar</p>
          </div>
          <textarea
            value={editedContent || selectedDocument.content}
            onChange={(e) => {
              setEditedContent(e.target.value);
              setIsEditingContent(true);
            }}
            className="w-full min-h-[400px] p-4 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm leading-relaxed text-gray-700 font-sans resize-y"
            placeholder="Contenido del documento..."
          />
          {isEditingContent && (
            <p className="mt-2 text-xs text-cyan-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Has editado el contenido. Los cambios se guardarán al firmar.
            </p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">Firma del Documento</h3>
          <SignatureCanvas signatureRef={signatureRef} onSignatureChange={setSignature} />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
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
            className="w-full sm:w-auto bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50 text-sm font-medium flex items-center justify-center gap-2"
          >
            {isLoadingSign && <Loader className="w-4 h-4 animate-spin" />}
            <Check className="w-4 h-4" />
            Firmar y Guardar
          </button>
        </div>
      </div>
    );
  }

  // Vista: Ver documento firmado
  if (currentView === 'view' && selectedDocument) {
    return (
      <div className="space-y-4">
        {notification && (
          <div className={`fixed top-4 right-4 z-50 max-w-md w-full mx-4 p-4 rounded-xl border shadow-lg ${
            notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
            notification.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
            'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            <div className="flex items-start">
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium">{notification.message}</p>
              </div>
              <button onClick={() => setNotification(null)} className="ml-4 flex-shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <button
          onClick={() => setCurrentView('list')}
          className="flex items-center text-cyan-600 hover:text-cyan-700 transition-colors text-sm"
        >
          <ChevronRight className="w-4 h-4 mr-1 rotate-180" />
          Volver a consentimientos
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-8">
          <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm leading-relaxed text-gray-700 mb-8">
            {selectedDocument.content}
          </div>

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
    );
  }

  // Vista: Lista de documentos (por defecto)
  return (
    <div className="space-y-4">
      {notification && (
        <div className={`fixed top-4 right-4 z-50 max-w-md w-full mx-4 p-4 rounded-xl border shadow-lg ${
          notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
          notification.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
          'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
          <div className="flex items-start">
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium">{notification.message}</p>
            </div>
            <button onClick={() => setNotification(null)} className="ml-4 flex-shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && documentToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900">Confirmar eliminación</h3>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm text-slate-600 mb-2">
                ¿Estás seguro de que deseas eliminar este documento?
              </p>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <p className="text-sm font-medium text-slate-900">{documentToDelete.title}</p>
                <p className="text-xs text-slate-600 mt-1">Estado: {documentToDelete.status}</p>
              </div>
              <p className="text-sm text-red-600 mt-3 font-medium">
                Esta acción no se puede deshacer.
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDocumentToDelete(null);
                }}
                disabled={deleteDocumentMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteDocument}
                disabled={deleteDocumentMutation.isPending}
                className="px-4 py-2 text-sm font-medium bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {deleteDocumentMutation.isPending && <Loader className="w-4 h-4 animate-spin" />}
                {deleteDocumentMutation.isPending ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">Consentimientos Informados</h3>
          <p className="text-sm text-slate-600 mt-1">
            Documentos generados para {patient.nombres} {patient.apellidos}
          </p>
        </div>
        <button
          onClick={() => setCurrentView('generate')}
          className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Generar Consentimiento
        </button>
      </div>

      {/* Lista de documentos */}
      {queryDocuments.isLoading ? (
        <div className="flex justify-center py-12">
          <Loader className="w-8 h-8 text-cyan-500 animate-spin" />
        </div>
      ) : patientDocuments.length > 0 ? (
        <>
          {/* Vista Desktop */}
          <div className="hidden md:block bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Documento</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {patientDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-900 font-medium">{doc.title}</td>
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
                      <div className="flex items-center gap-2">
                        {doc.status === 'pendiente' ? (
                          <>
                            <button
                              onClick={() => {
                                setSelectedDocument(doc);
                                setCurrentView('sign');
                              }}
                              className="p-1.5 text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50 rounded transition-colors"
                              title="Firmar documento"
                            >
                              <PenTool className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setDocumentToDelete(doc);
                                setShowDeleteConfirm(true);
                              }}
                              className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                              title="Eliminar documento"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setSelectedDocument(doc);
                                setCurrentView('view');
                              }}
                              className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                              title="Ver documento"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                try {
                                  generateDocumentPDF(doc);
                                  showNotification('success', 'PDF descargado');
                                } catch (error) {
                                  showNotification('error', 'Error al descargar PDF');
                                }
                              }}
                              className="p-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition-colors"
                              title="Descargar PDF"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleSendEmail(doc)}
                              disabled={sendingEmailDocId === doc.id}
                              className="p-1.5 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded transition-colors disabled:opacity-50"
                              title="Enviar por correo"
                            >
                              {sendingEmailDocId === doc.id ? (
                                <Loader className="w-4 h-4 animate-spin" />
                              ) : (
                                <Mail className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => {
                                setDocumentToDelete(doc);
                                setShowDeleteConfirm(true);
                              }}
                              className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                              title="Eliminar documento"
                            >
                              <Trash2 className="w-4 h-4" />
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

          {/* Vista Mobile */}
          <div className="md:hidden space-y-3">
            {patientDocuments.map((doc) => (
              <div key={doc.id} className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm">{doc.title}</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-slate-500">Fecha</p>
                      <p className="text-slate-700 font-medium">
                        {new Date(doc.createdAt || '').toLocaleDateString('es-CL')}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Estado</p>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        doc.status === 'firmado'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {doc.status === 'firmado' ? '✓ Firmado' : '⏱ Pendiente'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200">
                    {doc.status === 'pendiente' ? (
                      <>
                        <button
                          onClick={() => {
                            setSelectedDocument(doc);
                            setCurrentView('sign');
                          }}
                          className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 text-cyan-600 hover:bg-cyan-50 rounded text-xs font-medium"
                        >
                          <PenTool className="w-4 h-4" />
                          Firmar
                        </button>
                        <button
                          onClick={() => {
                            setDocumentToDelete(doc);
                            setShowDeleteConfirm(true);
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setSelectedDocument(doc);
                            setCurrentView('view');
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            try {
                              generateDocumentPDF(doc);
                              showNotification('success', 'PDF descargado');
                            } catch (error) {
                              showNotification('error', 'Error al descargar PDF');
                            }
                          }}
                          className="p-2 text-green-600 hover:bg-green-50 rounded"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleSendEmail(doc)}
                          disabled={sendingEmailDocId === doc.id}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded disabled:opacity-50"
                        >
                          {sendingEmailDocId === doc.id ? (
                            <Loader className="w-5 h-5 animate-spin" />
                          ) : (
                            <Mail className="w-5 h-5" />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setDocumentToDelete(doc);
                            setShowDeleteConfirm(true);
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-5 h-5" />
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
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
          <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 mb-4">No hay consentimientos generados</p>
          <button
            onClick={() => setCurrentView('generate')}
            className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-lg transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Generar Primer Consentimiento
          </button>
        </div>
      )}
    </div>
  );
};

export { PatientConsents };
