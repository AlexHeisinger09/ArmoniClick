// src/presentation/pages/patient/tabs/treatments/modals/EditTreatmentModal.tsx
import React, { useState, useEffect } from 'react';
import { 
  Save, 
  ChevronRight, 
  Stethoscope, 
  X, 
  Calendar, 
  Clock, 
  Package, 
  Camera,
  Upload,
  Trash2
} from 'lucide-react';
import { Treatment, UpdateTreatmentData } from "@/core/use-cases/treatments";
import { useUploadImages } from '@/presentation/hooks/upload';
import { SERVICIOS_COMUNES } from '../shared/types';

interface EditTreatmentModalProps {
  isOpen: boolean;
  treatment: Treatment | null;
  onClose: () => void;
  onSubmit: (treatmentId: number, formData: UpdateTreatmentData) => void;
  isLoading?: boolean;
}

const EditTreatmentModal: React.FC<EditTreatmentModalProps> = ({
  isOpen,
  treatment,
  onClose,
  onSubmit,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<UpdateTreatmentData>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [uploadingImages, setUploadingImages] = useState<{foto1: boolean, foto2: boolean}>({
    foto1: false,
    foto2: false
  });

  const { uploadImage } = useUploadImages();

  // Cargar datos del tratamiento cuando se abre el modal
  useEffect(() => {
    if (isOpen && treatment) {
      setFormData({
        fecha_control: treatment.fecha_control,
        hora_control: treatment.hora_control,
        fecha_proximo_control: treatment.fecha_proximo_control || '',
        hora_proximo_control: treatment.hora_proximo_control || '',
        nombre_servicio: treatment.nombre_servicio,
        producto: treatment.producto || '',
        lote_producto: treatment.lote_producto || '',
        fecha_venc_producto: treatment.fecha_venc_producto || '',
        dilucion: treatment.dilucion || '',
        foto1: treatment.foto1 || '',
        foto2: treatment.foto2 || '',
        descripcion: treatment.descripcion || '',
      });
    }
  }, [isOpen, treatment]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, imageField: 'foto1' | 'foto2') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImages(prev => ({ ...prev, [imageField]: true }));
    
    try {
      const imageUrl = await uploadImage(file);
      setFormData(prev => ({
        ...prev,
        [imageField]: imageUrl
      }));
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error al subir la imagen. Por favor intenta de nuevo.');
    } finally {
      setUploadingImages(prev => ({ ...prev, [imageField]: false }));
    }
  };

  const removeImage = (imageField: 'foto1' | 'foto2') => {
    setFormData(prev => ({
      ...prev,
      [imageField]: ''
    }));
  };

  const validateStep1 = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.fecha_control) errors.fecha_control = 'Fecha de control es requerida';
    if (!formData.hora_control) errors.hora_control = 'Hora de control es requerida';
    if (!formData.nombre_servicio) errors.nombre_servicio = 'Nombre del servicio es requerido';

    // Validar que la fecha de control no sea futura
    if (formData.fecha_control) {
      const controlDate = new Date(formData.fecha_control);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (controlDate > today) {
        errors.fecha_control = 'La fecha de control no puede ser futura';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const errors: Record<string, string> = {};
    
    // Validar fecha próximo control si se proporciona
    if (formData.fecha_proximo_control && formData.fecha_control) {
      const proximoControlDate = new Date(formData.fecha_proximo_control);
      const controlDate = new Date(formData.fecha_control);
      
      if (proximoControlDate <= controlDate) {
        errors.fecha_proximo_control = 'La fecha próximo control debe ser posterior a la fecha de control';
      }
    }

    // Validar fecha de vencimiento si se proporciona
    if (formData.fecha_venc_producto) {
      const vencDate = new Date(formData.fecha_venc_producto);
      const today = new Date();
      
      if (vencDate < today) {
        errors.fecha_venc_producto = 'La fecha de vencimiento no debería ser anterior a hoy';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handleSubmit = () => {
    if (treatment && validateStep1() && validateStep2()) {
      onSubmit(treatment.id_tratamiento, formData);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormErrors({});
    setCurrentStep(1);
    setFormData({});
    onClose();
  };

  if (!isOpen || !treatment) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50">
          <div className="flex items-center space-x-3">
            <div className="bg-orange-100 p-2 rounded-full">
              <Stethoscope className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-700">
                Editar Tratamiento
              </h3>
              <p className="text-sm text-slate-500">
                Paso {currentStep} de 3 - {
                  currentStep === 1 ? 'Información del Control' :
                  currentStep === 2 ? 'Producto y Próximo Control' : 'Fotos y Observaciones'
                }
              </p>
            </div>
          </div>
          <button 
            onClick={handleClose} 
            className="text-slate-500 hover:text-slate-700 transition-colors p-2 hover:bg-slate-100 rounded-full"
            disabled={isLoading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress indicator */}
        <div className="px-4 sm:px-6 py-4 bg-slate-50">
          <div className="flex items-center space-x-2">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep ? 'bg-orange-500 text-white' : 'bg-slate-200 text-slate-500'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`w-8 sm:w-16 h-1 mx-2 ${
                    step < currentStep ? 'bg-orange-500' : 'bg-slate-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form content */}
        <div className="p-4 sm:p-6 max-h-[60vh] overflow-y-auto">
          {currentStep === 1 && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-slate-700 mb-4 pb-2 border-b border-orange-200 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Información del Control
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha del Control *</label>
                  <input
                    type="date"
                    name="fecha_control"
                    value={formData.fecha_control || ''}
                    onChange={handleInputChange}
                    max={new Date().toISOString().split('T')[0]}
                    className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-slate-700 ${
                      formErrors.fecha_control ? 'border-red-300' : 'border-orange-200'
                    }`}
                  />
                  {formErrors.fecha_control && <p className="text-red-600 text-xs mt-1">{formErrors.fecha_control}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Hora del Control *</label>
                  <input
                    type="time"
                    name="hora_control"
                    value={formData.hora_control || ''}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-slate-700 ${
                      formErrors.hora_control ? 'border-red-300' : 'border-orange-200'
                    }`}
                  />
                  {formErrors.hora_control && <p className="text-red-600 text-xs mt-1">{formErrors.hora_control}</p>}
                </div>

                <div className="sm:col-span-2 lg:col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del Servicio *</label>
                  <select
                    name="nombre_servicio"
                    value={formData.nombre_servicio || ''}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-slate-700 ${
                      formErrors.nombre_servicio ? 'border-red-300' : 'border-orange-200'
                    }`}
                  >
                    <option value="">Seleccionar servicio...</option>
                    {SERVICIOS_COMUNES.map((servicio) => (
                      <option key={servicio} value={servicio}>{servicio}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={formData.nombre_servicio || ''}
                    onChange={handleInputChange}
                    name="nombre_servicio"
                    placeholder="O escriba un tratamiento personalizado"
                    className="w-full px-3 py-1 mt-2 border border-orange-100 rounded-lg text-sm text-slate-600 focus:ring-1 focus:ring-orange-400"
                  />
                  {formErrors.nombre_servicio && <p className="text-red-600 text-xs mt-1">{formErrors.nombre_servicio}</p>}
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              {/* Próximo Control */}
              <div>
                <h4 className="text-lg font-semibold text-slate-700 mb-4 pb-2 border-b border-orange-200 flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Próximo Control (Opcional)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Fecha del Próximo Control</label>
                    <input
                      type="date"
                      name="fecha_proximo_control"
                      value={formData.fecha_proximo_control || ''}
                      onChange={handleInputChange}
                      min={formData.fecha_control}
                      className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-slate-700 ${
                        formErrors.fecha_proximo_control ? 'border-red-300' : 'border-orange-200'
                      }`}
                    />
                    {formErrors.fecha_proximo_control && <p className="text-red-600 text-xs mt-1">{formErrors.fecha_proximo_control}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Hora del Próximo Control</label>
                    <input
                      type="time"
                      name="hora_proximo_control"
                      value={formData.hora_proximo_control || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-slate-700"
                    />
                  </div>
                </div>
              </div>

              {/* Información del Producto */}
              <div>
                <h4 className="text-lg font-semibold text-slate-700 mb-4 pb-2 border-b border-orange-200 flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Información del Producto
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Producto Utilizado</label>
                    <input
                      type="text"
                      name="producto"
                      value={formData.producto || ''}
                      onChange={handleInputChange}
                      placeholder="Ej: Botox Allergan"
                      className="w-full px-3 py-2 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Lote del Producto</label>
                    <input
                      type="text"
                      name="lote_producto"
                      value={formData.lote_producto || ''}
                      onChange={handleInputChange}
                      placeholder="Número de lote"
                      className="w-full px-3 py-2 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de Vencimiento</label>
                    <input
                      type="date"
                      name="fecha_venc_producto"
                      value={formData.fecha_venc_producto || ''}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-slate-700 ${
                        formErrors.fecha_venc_producto ? 'border-red-300' : 'border-orange-200'
                      }`}
                    />
                    {formErrors.fecha_venc_producto && <p className="text-red-600 text-xs mt-1">{formErrors.fecha_venc_producto}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Dilución/Concentración</label>
                    <input
                      type="text"
                      name="dilucion"
                      value={formData.dilucion || ''}
                      onChange={handleInputChange}
                      placeholder="Ej: 100 UI en 2.5ml de solución salina"
                      className="w-full px-3 py-2 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-slate-700"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              {/* Fotografías */}
              <div>
                <h4 className="text-lg font-semibold text-slate-700 mb-4 pb-2 border-b border-orange-200 flex items-center">
                  <Camera className="w-5 h-5 mr-2" />
                  Fotografías (Antes y Después)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Foto 1 */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Foto 1 (Antes)</label>
                    {formData.foto1 ? (
                      <div className="relative">
                        <img
                          src={formData.foto1}
                          alt="Foto 1 preview"
                          className="w-full h-48 object-cover rounded-xl border border-orange-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage('foto1')}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-orange-200 rounded-xl p-6 text-center hover:border-orange-300 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'foto1')}
                          className="hidden"
                          id="foto1-input"
                          disabled={uploadingImages.foto1}
                        />
                        <label
                          htmlFor="foto1-input"
                          className="cursor-pointer flex flex-col items-center"
                        >
                          {uploadingImages.foto1 ? (
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mb-2"></div>
                          ) : (
                            <Upload className="w-8 h-8 text-orange-400 mb-2" />
                          )}
                          <span className="text-sm text-slate-600">
                            {uploadingImages.foto1 ? 'Subiendo...' : 'Subir imagen'}
                          </span>
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Foto 2 */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Foto 2 (Después)</label>
                    {formData.foto2 ? (
                      <div className="relative">
                        <img
                          src={formData.foto2}
                          alt="Foto 2 preview"
                          className="w-full h-48 object-cover rounded-xl border border-orange-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage('foto2')}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-orange-200 rounded-xl p-6 text-center hover:border-orange-300 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'foto2')}
                          className="hidden"
                          id="foto2-input"
                          disabled={uploadingImages.foto2}
                        />
                        <label
                          htmlFor="foto2-input"
                          className="cursor-pointer flex flex-col items-center"
                        >
                          {uploadingImages.foto2 ? (
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mb-2"></div>
                          ) : (
                            <Upload className="w-8 h-8 text-orange-400 mb-2" />
                          )}
                          <span className="text-sm text-slate-600">
                            {uploadingImages.foto2 ? 'Subiendo...' : 'Subir imagen'}
                          </span>
                        </label>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  * Tamaño máximo: 5MB por imagen. Formatos aceptados: JPG, PNG, GIF
                </p>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Observaciones/Descripción</label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion || ''}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Detalles del tratamiento, observaciones, efectos secundarios, reacciones del paciente, etc."
                  className="w-full px-3 py-2 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-slate-700 resize-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-center p-4 sm:p-6 border-t border-orange-200 bg-slate-50 space-y-3 sm:space-y-0">
          <div className="text-sm text-slate-500">* Campos obligatorios</div>
          <div className="flex space-x-3 w-full sm:w-auto">
            {currentStep > 1 && (
              <button
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="flex-1 sm:flex-none bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-lg text-sm px-6 py-2.5 transition-colors"
                disabled={isLoading}
              >
                Anterior
              </button>
            )}
            <button
              onClick={handleClose}
              className="flex-1 sm:flex-none bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-lg text-sm px-6 py-2.5 transition-colors"
              disabled={isLoading}
            >
              Cancelar
            </button>
            {currentStep < 3 ? (
              <button
                onClick={handleNext}
                className="flex-1 sm:flex-none flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg text-sm px-6 py-2.5 transition-colors shadow-sm"
                disabled={isLoading}
              >
                Siguiente
                <ChevronRight className="w-4 h-4 ml-2" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="flex-1 sm:flex-none flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg text-sm px-6 py-2.5 transition-colors shadow-sm"
                disabled={isLoading || uploadingImages.foto1 || uploadingImages.foto2}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Guardar Cambios
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export { EditTreatmentModal };