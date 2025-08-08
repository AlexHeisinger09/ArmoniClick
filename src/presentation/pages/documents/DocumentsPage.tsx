import React, { useState, useRef, useCallback } from 'react';
import { 
  FileText, 
  Users, 
  Download, 
  Save, 
  RotateCcw, 
  Send,
  Plus,
  ChevronRight,
  Calendar,
  User,
  Stethoscope,
  Shield,
  PenTool,
  Check,
  AlertCircle,
  X
} from 'lucide-react';

// Interfaces
interface Patient {
  id: number;
  nombres: string;
  apellidos: string;
  rut: string;
}

interface DocumentType {
  id: string;
  name: string;
  description: string;
}

interface Document {
  id: number;
  patient: Patient;
  type: string;
  date: string;
  status: 'firmado' | 'pendiente';
  signature: string | null;
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

interface SignatureCanvasRef {
  clear: () => void;
  getSignatureData: () => string;
}

interface GenerateDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (patient: Patient, docType: DocumentType) => void;
  patients: Patient[];
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

// Modal para generar documento
const GenerateDocumentModal: React.FC<GenerateDocumentModalProps> = ({ 
  isOpen, 
  onClose, 
  onGenerate, 
  patients 
}) => {
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedDocument, setSelectedDocument] = useState('consentimiento-odontologico');

  const documentTypes: DocumentType[] = [
    {
      id: 'consentimiento-odontologico',
      name: 'Consentimiento Informado Odontológico',
      description: 'Para tratamientos dentales generales'
    },
    {
      id: 'consentimiento-cirugia',
      name: 'Consentimiento para Cirugía Oral',
      description: 'Para procedimientos quirúrgicos'
    },
    {
      id: 'anamnesis',
      name: 'Ficha de Anamnesis',
      description: 'Historia clínica del paciente'
    },
    {
      id: 'declaracion-salud',
      name: 'Declaración de Salud',
      description: 'Estado de salud general del paciente'
    }
  ];

  const handleGenerate = () => {
    if (!selectedPatient || !selectedDocument) return;
    
    const patient = patients.find(p => p.id === parseInt(selectedPatient));
    const docType = documentTypes.find(d => d.id === selectedDocument);
    
    if (patient && docType) {
      onGenerate(patient, docType);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl w-full max-w-sm sm:max-w-lg max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        {/* Header responsivo */}
        <div className="p-4 sm:p-6 border-b border-cyan-200">
          <h3 className="text-lg sm:text-xl font-semibold text-slate-700">Generar Documento</h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">Selecciona el paciente y tipo de documento</p>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Selector de paciente */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Paciente *
            </label>
            <select
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-cyan-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm sm:text-base"
            >
              <option value="">Selecciona un paciente...</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.nombres} {patient.apellidos} - {patient.rut}
                </option>
              ))}
            </select>
          </div>

          {/* Selector de tipo de documento */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 sm:mb-3">
              Tipo de Documento *
            </label>
            <div className="space-y-2">
              {documentTypes.map((doc) => (
                <label key={doc.id} className="flex items-start p-2.5 sm:p-3 border border-cyan-200 rounded-lg sm:rounded-xl hover:bg-cyan-50 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="documentType"
                    value={doc.id}
                    checked={selectedDocument === doc.id}
                    onChange={(e) => setSelectedDocument(e.target.value)}
                    className="mt-0.5 sm:mt-1 w-4 h-4 text-cyan-500 border-cyan-300 focus:ring-cyan-500 flex-shrink-0"
                  />
                  <div className="ml-2 sm:ml-3 min-w-0">
                    <p className="font-medium text-slate-700 text-sm sm:text-base">{doc.name}</p>
                    <p className="text-xs sm:text-sm text-slate-500">{doc.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer responsivo */}
        <div className="p-4 sm:p-6 border-t border-cyan-200 flex flex-col sm:flex-row justify-end gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 text-slate-600 hover:text-slate-800 transition-colors text-sm sm:text-base order-2 sm:order-1"
          >
            Cancelar
          </button>
          <button
            onClick={handleGenerate}
            disabled={!selectedPatient || !selectedDocument}
            className="w-full sm:w-auto bg-cyan-500 hover:bg-cyan-600 text-white px-4 sm:px-6 py-2.5 rounded-lg sm:rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base order-1 sm:order-2"
          >
            Generar Documento
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente principal
const DocumentsPage: React.FC = () => {
  const [currentView, setCurrentView] = useState<'list' | 'create' | 'sign'>('list');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [signature, setSignature] = useState('');
  const signatureRef = useRef<SignatureCanvasRef | null>(null);

  // Datos mock - reemplazar con datos reales
  const mockPatients: Patient[] = [
    { id: 1, nombres: 'Juan Carlos', apellidos: 'González Pérez', rut: '12345678-9' },
    { id: 2, nombres: 'María Elena', apellidos: 'Rodríguez Silva', rut: '98765432-1' },
    { id: 3, nombres: 'Pedro Antonio', apellidos: 'Martínez López', rut: '11223344-5' }
  ];

  const mockDocuments: Document[] = [
    {
      id: 1,
      patient: mockPatients[0],
      type: 'Consentimiento Informado Odontológico',
      date: '2025-01-15',
      status: 'firmado',
      signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
    },
    {
      id: 2,
      patient: mockPatients[1],
      type: 'Consentimiento para Cirugía Oral',
      date: '2025-01-14',
      status: 'pendiente',
      signature: null
    },
    {
      id: 3,
      patient: mockPatients[2],
      type: 'Ficha de Anamnesis',
      date: '2025-01-13',
      status: 'firmado',
      signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
    }
  ];

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleGenerateDocument = (patient: Patient, docType: DocumentType) => {
    // Simular generación del documento
    const newDoc: Document = {
      id: mockDocuments.length + 1,
      patient,
      type: docType.name,
      date: new Date().toISOString().split('T')[0],
      status: 'pendiente',
      signature: null
    };
    
    setSelectedDocument(newDoc);
    setCurrentView('sign');
    showNotification('success', 'Documento generado correctamente');
  };

  const handleSaveSignature = () => {
    const signatureData = signatureRef.current?.getSignatureData();
    
    if (!signatureData || signatureData === 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==') {
      showNotification('error', 'Por favor, agregue su firma antes de guardar');
      return;
    }

    // Simular guardado
    showNotification('success', 'Documento firmado y guardado correctamente');
    setCurrentView('list');
    setSelectedDocument(null);
    setSignature('');
  };

  const handleDownloadDocument = (doc: Document) => {
    showNotification('success', `Descargando ${doc.type} de ${doc.patient.nombres} ${doc.patient.apellidos}`);
  };

  const renderDocumentContent = () => {
    if (!selectedDocument) return null;

    return (
      <div className="bg-white border border-gray-300 rounded-lg p-8 shadow-sm">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">CONSENTIMIENTO INFORMADO</h2>
          <h3 className="text-lg font-semibold text-gray-700">PARA TRATAMIENTO ODONTOLÓGICO</h3>
        </div>

        <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <strong>Especialista Responsable:</strong><br />
              Dr. Andrea Delgado Salas
            </div>
            <div>
              <strong>RUT:</strong><br />
              Licenciado por:
            </div>
            <div>
              <strong>Fecha:</strong><br />
              {new Date().toLocaleDateString('es-CL')}
            </div>
            <div>
              <strong>Paciente:</strong><br />
              {selectedDocument.patient.nombres} {selectedDocument.patient.apellidos}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <p className="mb-4">
              <strong>Declaro que he cumplido todas las explicaciones que se me han facilitado en un lenguaje claro y sencillo.</strong> He sido informado realizar todas las observaciones y he sido informado aclarado todas las dudas.
            </p>

            <p className="mb-4">
              He entendido el médico tratante de las patologías que presento, sin ocultar enfermedades de la piel ni mucosas (herpes labial, alergias, problemas de cicatrización) que puedan afectar el tratamiento.
            </p>

            <p className="mb-4">
              Entiendo que si no informo con la verdad todos los datos necesarios o incumplo las indicaciones a seguir posterior al procedimiento en cuestión, se pueden ocasionar resultados no deseables y estaré exento de responsabilidad profesional del facultativo/a.
            </p>

            <p className="mb-4">
              Comprendo que a pesar de la adecuada elección de tratamiento y de su correcta realización, la duración del efecto conseguido es variable (de 3 a 8 meses) dependiendo de factores individuales de cada organismo y pueden presentarse efectos secundarios inmediatos como: hinchazón, enrojecimiento, dolor, escozor o hematomas y que en contadas ocasiones puede aparecer efectos secundarios tardíos como: infección / necrosis.
            </p>

            <p className="mb-6">
              Por lo tanto, otorgo mi consentimiento para realizar el tratamiento que se me ha ofrecido y autorizo el uso de material de imagen y video registrados antes, durante y después del procedimiento para fines exclusivos del tratamiento.
            </p>

            <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
              <p className="text-center font-medium mb-4">
                Nombre, Firma y RUT del responsable del ser menor de edad
              </p>
              <div className="border-b border-gray-400 mb-4 h-16"></div>
              <p className="text-center text-sm text-gray-600">Cerrar</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (currentView === 'sign') {
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
          {/* Header con botón volver - responsivo */}
          <div className="bg-white rounded-xl shadow-sm border border-cyan-200 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <button
                  onClick={() => setCurrentView('list')}
                  className="flex items-center text-cyan-600 hover:text-cyan-700 transition-colors text-sm sm:text-base"
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 mr-1 rotate-180 flex-shrink-0" />
                  <span className="hidden sm:inline">Volver a documentos</span>
                  <span className="sm:hidden">Volver</span>
                </button>
              </div>
              <div className="text-left sm:text-right">
                <h3 className="font-medium text-slate-700 text-base sm:text-lg">Firmar Documento</h3>
                <p className="text-sm text-slate-500 truncate">
                  {selectedDocument?.patient.nombres} {selectedDocument?.patient.apellidos}
                </p>
              </div>
            </div>
          </div>

          {/* Contenido del documento - stack en móvil */}
          <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Documento */}
            <div className="lg:col-span-2 order-2 lg:order-1">
              {renderDocumentContent()}
            </div>

            {/* Panel de firma - arriba en móvil */}
            <div className="space-y-4 sm:space-y-6 order-1 lg:order-2">
              <div className="bg-white rounded-xl shadow-sm border border-cyan-200 p-4 sm:p-6">
                <h4 className="font-medium text-slate-700 mb-3 sm:mb-4 text-sm sm:text-base">Firma Digital</h4>
                <SignatureCanvas
                  signatureRef={signatureRef}
                  onSignatureChange={setSignature}
                />
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-cyan-200 p-4 sm:p-6">
                <h4 className="font-medium text-slate-700 mb-3 sm:mb-4 text-sm sm:text-base">Información del Documento</h4>
                <div className="space-y-2 sm:space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tipo:</span>
                    <span className="font-medium text-right truncate ml-2">{selectedDocument?.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Fecha:</span>
                    <span className="font-medium">{selectedDocument?.date}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Estado:</span>
                    <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-medium">
                      Pendiente de firma
                    </span>
                  </div>
                </div>

                <div className="space-y-2 sm:space-y-3 mt-4 sm:mt-6">
                  <button
                    onClick={handleSaveSignature}
                    className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-medium py-2.5 sm:py-3 px-4 rounded-xl transition-colors flex items-center justify-center text-sm sm:text-base"
                  >
                    <Save className="w-4 h-4 mr-2 flex-shrink-0" />
                    Firmar y Guardar
                  </button>
                  
                  <button
                    onClick={() => selectedDocument && handleDownloadDocument(selectedDocument)}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2.5 sm:py-3 px-4 rounded-xl transition-colors flex items-center justify-center text-sm sm:text-base"
                  >
                    <Download className="w-4 h-4 mr-2 flex-shrink-0" />
                    Descargar PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-cyan-200 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="bg-cyan-100 p-2 sm:p-3 rounded-full flex-shrink-0">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-600" />
              </div>
              <div className="min-w-0">
                <h3 className="font-medium text-slate-700 text-base sm:text-lg truncate">Documentos Médicos</h3>
                <p className="text-xs sm:text-sm text-slate-500">Gestiona consentimientos informados y documentos legales</p>
              </div>
            </div>
            
            {/* Botón responsivo */}
            <button
              onClick={() => setShowGenerateModal(true)}
              className="w-full sm:w-auto bg-cyan-500 hover:bg-cyan-600 text-white font-medium px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-colors flex items-center justify-center shadow-sm text-sm sm:text-base"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
              <span className="truncate">Nuevo Documento</span>
            </button>
          </div>
        </div>

        {/* Lista de documentos */}
        <div className="bg-white rounded-xl shadow-sm border border-cyan-200 overflow-hidden">
          {/* Header de tabla - Desktop */}
          <div className="hidden md:block">
            <div className="bg-slate-50 border-b border-cyan-200 px-6 py-4">
              <div className="grid grid-cols-6 gap-4 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                <span>Paciente</span>
                <span>Tipo de Documento</span>
                <span>Fecha</span>
                <span>Estado</span>
                <span>Firma</span>
                <span>Acciones</span>
              </div>
            </div>

            {/* Filas de documentos */}
            <div className="divide-y divide-cyan-100">
              {mockDocuments.map((doc) => (
                <div key={doc.id} className="px-6 py-4 hover:bg-cyan-50 transition-colors">
                  <div className="grid grid-cols-6 gap-4 items-center">
                    <div>
                      <p className="font-medium text-slate-700">
                        {doc.patient.nombres} {doc.patient.apellidos}
                      </p>
                      <p className="text-sm text-slate-500">{doc.patient.rut}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-slate-700">{doc.type}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-slate-700">{doc.date}</p>
                    </div>
                    
                    <div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        doc.status === 'firmado' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {doc.status === 'firmado' ? 'Firmado' : 'Pendiente'}
                      </span>
                    </div>
                    
                    <div>
                      {doc.signature ? (
                        <div className="flex items-center text-green-600">
                          <Check className="w-4 h-4 mr-1" />
                          <span className="text-xs">Firmado</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">Sin firma</span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {doc.status === 'pendiente' && (
                        <button
                          onClick={() => {
                            setSelectedDocument(doc);
                            setCurrentView('sign');
                          }}
                          className="text-cyan-600 hover:text-cyan-700 transition-colors"
                          title="Firmar documento"
                        >
                          <PenTool className="w-4 h-4" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDownloadDocument(doc)}
                        className="text-slate-600 hover:text-slate-700 transition-colors"
                        title="Descargar PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Vista móvil */}
          <div className="md:hidden divide-y divide-cyan-100">
            {mockDocuments.map((doc) => (
              <div key={doc.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-700">
                      {doc.patient.nombres} {doc.patient.apellidos}
                    </h4>
                    <p className="text-sm text-slate-500">{doc.type}</p>
                    <p className="text-xs text-slate-500 mt-1">{doc.date}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      doc.status === 'firmado' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {doc.status === 'firmado' ? 'Firmado' : 'Pendiente'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {doc.signature ? (
                      <div className="flex items-center text-green-600">
                        <Check className="w-4 h-4 mr-1" />
                        <span className="text-xs">Con firma</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500">Sin firma</span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {doc.status === 'pendiente' && (
                      <button
                        onClick={() => {
                          setSelectedDocument(doc);
                          setCurrentView('sign');
                        }}
                        className="text-cyan-600 hover:text-cyan-700 transition-colors flex items-center"
                      >
                        <PenTool className="w-4 h-4 mr-1" />
                        <span className="text-xs">Firmar</span>
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleDownloadDocument(doc)}
                      className="text-slate-600 hover:text-slate-700 transition-colors flex items-center"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      <span className="text-xs">PDF</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal para generar documento */}
      <GenerateDocumentModal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        onGenerate={handleGenerateDocument}
        patients={mockPatients}
      />
    </div>
  );
};

export default DocumentsPage;