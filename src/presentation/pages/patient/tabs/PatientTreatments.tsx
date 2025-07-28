// src/presentation/pages/patient/tabs/PatientTreatments.tsx - COMPLETO
import React, { useState } from 'react';
import { Plus, Calendar, Clock, Package, Eye, Edit, Trash2, Camera, AlertTriangle, CheckCircle, X, Info } from 'lucide-react';
import { Patient } from "@/core/use-cases/patients";
import { Treatment, CreateTreatmentData } from "@/core/use-cases/treatments";
import { 
  useTreatments, 
  useCreateTreatment, 
  useUpdateTreatment, 
  useDeleteTreatment 
} from "@/presentation/hooks/treatments/useTreatments";

interface PatientTreatmentsProps {
  patient: Patient;
}

// Componente para mostrar notificaciones
interface NotificationProps {
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ type, title, message, onClose }) => {
  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />;
      default:
        return <Info className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-md w-full mx-auto`}>
      <div className={`p-4 rounded-lg border shadow-lg ${getStyles()}`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className="text-sm font-medium">
              {title}
            </p>
            <p className="mt-1 text-sm">
              {message}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={onClose}
              className="inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Modal para crear nuevo tratamiento
interface NewTreatmentModalProps {
  isOpen: boolean;
  patientId: number;
  onClose: () => void;
  onSubmit: (treatmentData: CreateTreatmentData) => void;
  isLoading?: boolean;
}

const NewTreatmentModal: React.FC<NewTreatmentModalProps> = ({
  isOpen,
  patientId,
  onClose,
  onSubmit,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<CreateTreatmentData>({
    id_paciente: patientId,
    fecha_control: new Date().toISOString().split('T')[0],
    hora_control: new Date().toTimeString().slice(0, 5),
    fecha_proximo_control: '',
    hora_proximo_control: '',
    nombre_servicio: '',
    producto: '',
    lote_producto: '',
    fecha_venc_producto: '',
    dilucion: '',
    foto1: '',
    foto2: '',
    descripcion: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Limpiar campos vacíos antes de enviar
    const cleanData = Object.entries(formData).reduce((acc, [key, value]) => {
      if (value !== '' && value !== undefined) {
        acc[key as keyof CreateTreatmentData] = value;
      }
      return acc;
    }, {} as Partial<CreateTreatmentData>);

    onSubmit(cleanData as CreateTreatmentData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, imageField: 'foto1' | 'foto2') => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen es demasiado grande. Máximo 5MB.');
        return;
      }

      // Validar tipo
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecciona una imagen válida.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setFormData(prev => ({
          ...prev,
          [imageField]: result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (imageField: 'foto1' | 'foto2') => {
    setFormData(prev => ({
      ...prev,
      [imageField]: ''
    }));
  };

  if (!isOpen) return null;

  // Lista de servicios comunes (en el futuro se cargarán de la base de datos)
  const serviciosComunes = [
    'Botox',
    'Ácido Hialurónico',
    'Peeling Químico',
    'Plasma Rico en Plaquetas (PRP)',
    'Mesoterapia',
    'Radiofrecuencia',
    'Láser CO2',
    'Microdermoabrasión',
    'Hidrafacial',
    'Lifting no quirúrgico',
    'Rellenos dérmicos',
    'Bioestimulación',
    'Hilos tensores',
    'Criolipólisis',
    'Carboxiterapia',
    'Otro'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              Nuevo Tratamiento - {patientId}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isLoading}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información del Control */}
          <div className="bg-cyan-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-cyan-800 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Información del Control
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha del Control *
                </label>
                <input
                  type="date"
                  name="fecha_control"
                  value={formData.fecha_control}
                  onChange={handleChange}
                  required
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hora del Control *
                </label>
                <input
                  type="time"
                  name="hora_control"
                  value={formData.hora_control}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Próximo Control */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Próximo Control (Opcional)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha del Próximo Control
                </label>
                <input
                  type="date"
                  name="fecha_proximo_control"
                  value={formData.fecha_proximo_control}
                  onChange={handleChange}
                  min={formData.fecha_control}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hora del Próximo Control
                </label>
                <input
                  type="time"
                  name="hora_proximo_control"
                  value={formData.hora_proximo_control}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Servicio y Producto */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Servicio y Producto
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Servicio *
                </label>
                <select
                  name="nombre_servicio"
                  value={formData.nombre_servicio}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Seleccionar servicio...</option>
                  {serviciosComunes.map((servicio) => (
                    <option key={servicio} value={servicio}>
                      {servicio}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Producto Utilizado
                </label>
                <input
                  type="text"
                  name="producto"
                  value={formData.producto}
                  onChange={handleChange}
                  placeholder="Ej: Botox Allergan"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lote del Producto
                </label>
                <input
                  type="text"
                  name="lote_producto"
                  value={formData.lote_producto}
                  onChange={handleChange}
                  placeholder="Número de lote"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Vencimiento
                </label>
                <input
                  type="date"
                  name="fecha_venc_producto"
                  value={formData.fecha_venc_producto}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dilución/Concentración
                </label>
                <input
                  type="text"
                  name="dilucion"
                  value={formData.dilucion}
                  onChange={handleChange}
                  placeholder="Ej: 100 UI en 2.5ml de solución salina"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Fotos */}
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center">
              <Camera className="w-5 h-5 mr-2" />
              Fotografías (Antes y Después)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Foto 1 (Antes)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'foto1')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                {formData.foto1 && (
                  <div className="mt-2 relative">
                    <img
                      src={formData.foto1}
                      alt="Foto 1 preview"
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage('foto1')}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Foto 2 (Después)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'foto2')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                {formData.foto2 && (
                  <div className="mt-2 relative">
                    <img
                      src={formData.foto2}
                      alt="Foto 2 preview"
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage('foto2')}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              * Tamaño máximo: 5MB por imagen. Formatos aceptados: JPG, PNG, GIF
            </p>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observaciones/Descripción
            </label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows={4}
              placeholder="Detalles del tratamiento, observaciones, efectos secundarios, reacciones del paciente, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.nombre_servicio}
              className="px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors disabled:opacity-50 flex items-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </>
              ) : (
                'Guardar Tratamiento'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal para ver detalles del tratamiento
interface TreatmentDetailModalProps {
  isOpen: boolean;
  treatment: Treatment | null;
  onClose: () => void;
  onEdit: (treatment: Treatment) => void;
  onDelete: (treatmentId: number) => void;
}

const TreatmentDetailModal: React.FC<TreatmentDetailModalProps> = ({
  isOpen,
  treatment,
  onClose,
  onEdit,
  onDelete
}) => {
  if (!isOpen || !treatment) return null;

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("es-CL");
  };

  const formatTime = (timeString: string): string => {
    return timeString.slice(0, 5);
  };

  const isProductExpired = (expirationDate?: string): boolean => {
    if (!expirationDate) return false;
    return new Date(expirationDate) < new Date();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              Detalles del Tratamiento
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onEdit(treatment)}
                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                title="Editar tratamiento"
              >
                <Edit className="w-5 h-5" />
              </button>
              <button
                onClick={() => onDelete(treatment.id_tratamiento)}
                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                title="Eliminar tratamiento"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Información del servicio */}
          <div className="bg-cyan-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-cyan-800 mb-3">
              {treatment.nombre_servicio}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Fecha del control:</span>
                <p className="font-medium">{formatDate(treatment.fecha_control)} a las {formatTime(treatment.hora_control)}</p>
              </div>
              {treatment.fecha_proximo_control && (
                <div>
                  <span className="text-gray-600">Próximo control:</span>
                  <p className="font-medium">
                    {formatDate(treatment.fecha_proximo_control)}
                    {treatment.hora_proximo_control && ` a las ${formatTime(treatment.hora_proximo_control)}`}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Información del producto */}
          {(treatment.producto || treatment.lote_producto || treatment.dilucion || treatment.fecha_venc_producto) && (
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Información del Producto
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {treatment.producto && (
                  <div>
                    <span className="text-gray-600">Producto:</span>
                    <p className="font-medium">{treatment.producto}</p>
                  </div>
                )}
                {treatment.lote_producto && (
                  <div>
                    <span className="text-gray-600">Lote:</span>
                    <p className="font-medium">{treatment.lote_producto}</p>
                  </div>
                )}
                {treatment.fecha_venc_producto && (
                  <div>
                    <span className="text-gray-600">Vencimiento:</span>
                    <p className={`font-medium ${isProductExpired(treatment.fecha_venc_producto) ? 'text-red-600' : 'text-green-600'}`}>
                      {formatDate(treatment.fecha_venc_producto)}
                      {isProductExpired(treatment.fecha_venc_producto) && (
                        <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                          ⚠️ Vencido
                        </span>
                      )}
                    </p>
                  </div>
                )}
                {treatment.dilucion && (
                  <div className="md:col-span-2">
                    <span className="text-gray-600">Dilución/Concentración:</span>
                    <p className="font-medium">{treatment.dilucion}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Fotos */}
          {(treatment.foto1 || treatment.foto2) && (
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-semibold text-purple-800 mb-3 flex items-center">
                <Camera className="w-5 h-5 mr-2" />
                Fotografías
              </h4>
              <div className="flex space-x-4">
                {treatment.foto1 && (
                  <div className="text-center">
                    <img
                      src={treatment.foto1}
                      alt="Antes del tratamiento"
                      className="w-48 h-48 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => window.open(treatment.foto1, '_blank')}
                    />
                    <p className="text-sm text-gray-600 mt-2 font-medium">Antes</p>
                  </div>
                )}
                {treatment.foto2 && (
                  <div className="text-center">
                    <img
                      src={treatment.foto2}
                      alt="Después del tratamiento"
                      className="w-48 h-48 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => window.open(treatment.foto2, '_blank')}
                    />
                    <p className="text-sm text-gray-600 mt-2 font-medium">Después</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Descripción */}
          {treatment.descripcion && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">Observaciones</h4>
              <p className="text-gray-700 whitespace-pre-wrap">{treatment.descripcion}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente principal
const PatientTreatments: React.FC<PatientTreatmentsProps> = ({ patient }) => {
  const [showNewTreatmentModal, setShowNewTreatmentModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    title: string;
    message: string;
  } | null>(null);

  // Hooks para tratamientos
  const { queryTreatments } = useTreatments(patient.id);
  const { createTreatmentMutation, isLoadingCreate } = useCreateTreatment();
  const { deleteTreatmentMutation, isLoadingDelete } = useDeleteTreatment();

  const treatments = queryTreatments.data?.treatments || [];
  const loading = queryTreatments.isLoading;

  // Función para mostrar notificación
  const showNotification = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    setNotification({ type, title, message });
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  // Función para procesar errores de API
  const processApiError = (error: any): string => {
    if (!error.response) {
      return `Error de conexión: ${error.message || 'No se pudo conectar al servidor'}`;
    }

    const status = error.response?.status;
    const data = error.response?.data;

    let errorMessage = `Error ${status}`;

    if (data) {
      if (typeof data === 'string') {
        errorMessage += `: ${data}`;
      } else if (data.message) {
        errorMessage += `: ${data.message}`;
      } else {
        errorMessage += `: ${JSON.stringify(data)}`;
      }
    }

    return errorMessage;
  };

  // Manejar creación de tratamiento
  const handleCreateTreatment = async (treatmentData: CreateTreatmentData) => {
    try {
      await createTreatmentMutation.mutateAsync({
        patientId: patient.id,
        treatmentData
      });
      
      setShowNewTreatmentModal(false);
      showNotification('success', 'Éxito', 'Tratamiento creado correctamente');
    } catch (error: any) {
      const errorMessage = processApiError(error);
      showNotification('error', 'Error al crear tratamiento', errorMessage);
    }
  };

  // Manejar eliminación de tratamiento
  const handleDeleteTreatment = async (treatmentId: number) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este tratamiento? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await deleteTreatmentMutation.mutateAsync(treatmentId);
      setShowDetailModal(false);
      setSelectedTreatment(null);
      showNotification('success', 'Éxito', 'Tratamiento eliminado correctamente');
    } catch (error: any) {
      const errorMessage = processApiError(error);
      showNotification('error', 'Error al eliminar tratamiento', errorMessage);
    }
  };

  // Función para abrir modal de detalles
  const handleViewTreatment = (treatment: Treatment) => {
    setSelectedTreatment(treatment);
    setShowDetailModal(true);
  };

  // Función para editar tratamiento (placeholder)
  const handleEditTreatment = (treatment: Treatment) => {
    // TODO: Implementar modal de edición
    showNotification('info', 'Funcionalidad en desarrollo', 'La edición de tratamientos estará disponible próximamente');
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("es-CL");
  };

  const formatTime = (timeString: string): string => {
    return timeString.slice(0, 5);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-cyan-200 p-6">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-6">
            <div className="h-6 bg-gray-200 rounded w-48"></div>
            <div className="h-10 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-cyan-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-700">
            Tratamientos del Paciente
          </h3>
          <button 
            onClick={() => setShowNewTreatmentModal(true)}
            className="flex items-center bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg text-sm px-4 py-2 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Tratamiento
          </button>
        </div>

        <div className="space-y-4">
          {treatments.map((treatment) => (
            <div 
              key={treatment.id_tratamiento} 
              className="border border-cyan-200 rounded-lg p-4 hover:bg-cyan-50 transition-colors cursor-pointer"
              onClick={() => handleViewTreatment(treatment)}
            >
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-medium text-slate-700 text-lg">
                  {treatment.nombre_servicio}
                </h4>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewTreatment(treatment);
                    }}
                    className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                    title="Ver detalles"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditTreatment(treatment);
                    }}
                    className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTreatment(treatment.id_tratamiento);
                    }}
                    className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                    title="Eliminar"
                    disabled={isLoadingDelete}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {treatment.descripcion && (
                <p className="text-slate-500 mb-3 text-sm">
                  {treatment.descripcion.length > 100 
                    ? `${treatment.descripcion.substring(0, 100)}...` 
                    : treatment.descripcion
                  }
                </p>
              )}
              
              <div className="flex items-center text-sm text-slate-500">
                <Calendar className="w-4 h-4 mr-2" />
                Control: {formatDate(treatment.fecha_control)} a las {formatTime(treatment.hora_control)}
                {treatment.fecha_proximo_control && (
                  <span className="ml-4 flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Próximo: {formatDate(treatment.fecha_proximo_control)}
                    {treatment.hora_proximo_control && ` a las ${formatTime(treatment.hora_proximo_control)}`}
                  </span>
                )}
              </div>

              {(treatment.foto1 || treatment.foto2) && (
                <div className="flex items-center mt-2 text-sm text-purple-600">
                  <Camera className="w-4 h-4 mr-1" />
                  Incluye fotografías
                </div>
              )}
            </div>
          ))}

          {treatments.length === 0 && (
            <div className="text-center py-8">
              <div className="mb-4">
                <Package className="w-16 h-16 mx-auto text-gray-300" />
              </div>
              <p className="text-slate-500 mb-4">No hay tratamientos registrados para este paciente</p>
              <button 
                onClick={() => setShowNewTreatmentModal(true)}
                className="flex items-center mx-auto bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg text-sm px-4 py-2 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Primer Tratamiento
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal para nuevo tratamiento */}
      <NewTreatmentModal
        isOpen={showNewTreatmentModal}
        patientId={patient.id}
        onClose={() => setShowNewTreatmentModal(false)}
        onSubmit={handleCreateTreatment}
        isLoading={isLoadingCreate}
      />

      {/* Modal para ver detalles del tratamiento */}
      <TreatmentDetailModal
        isOpen={showDetailModal}
        treatment={selectedTreatment}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedTreatment(null);
        }}
        onEdit={handleEditTreatment}
        onDelete={handleDeleteTreatment}
      />

      {/* Notificaciones */}
      {notification && (
        <Notification
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
    </>
  );
};

export { PatientTreatments };