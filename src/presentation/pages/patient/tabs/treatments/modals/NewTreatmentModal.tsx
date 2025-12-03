// src/presentation/pages/patient/tabs/treatments/modals/NewTreatmentModal.tsx - SIMPLIFICADO
import React, { useState, useEffect } from 'react';
import {
  Plus,
  ChevronRight,
  Stethoscope,
  X,
  Calendar,
  Clock,
  Package,
  Camera,
  Upload,
  Trash2,
  FileText
} from 'lucide-react';
import { CreateTreatmentData, BudgetSummary } from "@/core/use-cases/treatments";
import { NewTreatmentModalProps } from '../shared/types';
import { useTreatmentUpload } from '@/presentation/hooks/treatments/useTreatmentUpload';
import { useServices } from '@/presentation/hooks/services/useServices';

const NewTreatmentModal: React.FC<NewTreatmentModalProps> = ({
  isOpen,
  patientId,
  selectedBudgetId,
  budgets = [],
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
    // ✅ NUEVOS CAMPOS para crear budget_item automáticamente
    pieza: '', // Pieza dental o zona
    valor: 0, // Valor del tratamiento
  });

  // Estados para presupuesto seleccionado
  const [selectedBudget, setSelectedBudget] = useState<number | undefined>(selectedBudgetId || undefined);

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [uploadingImages, setUploadingImages] = useState<{foto1: boolean, foto2: boolean}>({
    foto1: false,
    foto2: false
  });

  const { uploadImageFromFile, validateImageFile } = useTreatmentUpload();

  // ✅ OBTENER SERVICIOS DE LA BASE DE DATOS
  const { services, isLoading: isLoadingServices } = useServices();

  // Actualizar presupuesto seleccionado
  useEffect(() => {
    if (selectedBudgetId && selectedBudgetId !== selectedBudget) {
      setSelectedBudget(selectedBudgetId);
    }
  }, [selectedBudgetId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Manejar campo de valor (formato numérico)
    if (name === 'valor') {
      const numericValue = parseFloat(value) || 0;
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
      }));
    } else if (name === 'selectedBudget') {
      setSelectedBudget(value ? parseInt(value) : undefined);
    } else if (name === 'nombre_servicio') {
      // ✅ Cuando selecciona un servicio, asignar automáticamente su valor
      const selectedService = services.find(s => s.nombre === value);
      setFormData(prev => ({
        ...prev,
        [name]: value,
        valor: selectedService ? parseFloat(selectedService.valor) : prev.valor
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

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

    const validationError = validateImageFile(file);
    if (validationError) {
      alert(validationError);
      return;
    }

    setUploadingImages(prev => ({ ...prev, [imageField]: true }));
    
    try {
      const response = await uploadImageFromFile(file, 0, 'before');
      setFormData(prev => ({
        ...prev,
        [imageField]: response.imageUrl
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
    
    // ✅ VALIDAR CAMPOS DE PRESUPUESTO si hay presupuesto seleccionado
    if (selectedBudget) {
      if (!formData.valor || formData.valor <= 0) errors.valor = 'El valor debe ser mayor a 0';
    }

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
    
    if (formData.fecha_proximo_control && formData.fecha_control) {
      const proximoControlDate = new Date(formData.fecha_proximo_control);
      const controlDate = new Date(formData.fecha_control);
      
      if (proximoControlDate <= controlDate) {
        errors.fecha_proximo_control = 'La fecha próximo control debe ser posterior a la fecha de control';
      }
    }

    if (formData.fecha_venc_producto) {
      const vencDate = new Date(formData.fecha_venc_producto);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

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
    if (validateStep1() && validateStep2()) {
      // Limpiar campos vacíos y preparar datos
      const cleanData = Object.entries(formData).reduce((acc, [key, value]) => {
        if (value !== '' && value !== undefined && value !== 0) {
          acc[key as keyof CreateTreatmentData] = value;
        }
        return acc;
      }, {} as Partial<CreateTreatmentData>);

      // ✅ AGREGAR INFORMACIÓN DEL PRESUPUESTO SELECCIONADO
      const finalData = {
        ...cleanData,
        // Pasar información adicional para crear el budget_item
        selectedBudgetId: selectedBudget,
        pieza: formData.pieza || undefined,
        valor: selectedBudget && (formData.valor ?? 0) > 0 ? (formData.valor ?? 0) : undefined,
      } as CreateTreatmentData & { 
        selectedBudgetId?: number; 
        pieza?: string; 
        valor?: number; 
      };

      onSubmit(finalData);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormErrors({});
    setCurrentStep(1);
    setSelectedBudget(selectedBudgetId || undefined);
    setFormData({
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
      pieza: '',
      valor: 0,
    });
    onClose();
  };

  const formatCurrency = (amount: string | number): string => {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return numericAmount.toLocaleString('es-CL');
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md sm:max-w-2xl">
            {/* Header - Estándar */}
            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 px-4 sm:px-6 py-3 sm:py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="text-base sm:text-lg font-semibold text-white">
                    Nuevo Tratamiento
                  </h3>
                  <p className="text-xs sm:text-sm text-white text-opacity-90 mt-0.5">
                    Paso {currentStep} de 3 - {
                      currentStep === 1 ? 'Información del Control' :
                      currentStep === 2 ? 'Producto y Próximo Control' : 'Fotos y Observaciones'
                    }
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  disabled={isLoading}
                  className="p-1.5 sm:p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors flex-shrink-0 ml-2"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Progress indicator */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 bg-slate-50 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center flex-1 sm:flex-none">
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${
                      step <= currentStep ? 'bg-cyan-500 text-white' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {step}
                    </div>
                    {step < 3 && (
                      <div className={`flex-1 h-0.5 mx-1 sm:mx-2 ${
                        step < currentStep ? 'bg-cyan-500' : 'bg-slate-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Form content */}
            <div className="p-4 sm:p-6 max-h-[60vh] overflow-y-auto space-y-4">
          {currentStep === 1 && (
            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-slate-700 mb-4 pb-2 border-b border-cyan-200 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Información del Control
              </h4>

              {/* ✅ SELECTOR SIMPLIFICADO DE PRESUPUESTO */}
              {budgets.length > 0 && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h5 className="font-medium text-blue-800 mb-3 flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Vincular a Presupuesto (Opcional)
                  </h5>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-blue-700 mb-2">Presupuesto</label>
                        <select
                          name="selectedBudget"
                          value={selectedBudget || ''}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-700"
                        >
                          <option value="">Tratamiento independiente</option>
                          {budgets.filter(b => b.status === 'activo').map((budget) => (
                            <option key={budget.id} value={budget.id}>
                              Presupuesto #{budget.id} - {budget.budget_type === 'odontologico' ? 'Odontológico' : 'Estética'}
                              - ${formatCurrency(budget.total_amount)}
                            </option>
                          ))}
                        </select>

                        {/* ✅ MENSAJE INFORMATIVO si no hay presupuestos activos */}
                        {budgets.filter(b => b.status === 'activo').length === 0 && budgets.length > 0 && (
                          <p className="text-sm text-amber-600 mt-2 bg-amber-50 p-2 rounded border border-amber-200">
                            ⚠️ Solo los presupuestos activos pueden recibir nuevos tratamientos.
                            {budgets.length > 0 && (
                              <span className="block mt-1">
                                Tienes {budgets.length} presupuesto{budgets.length > 1 ? 's' : ''} en otros estados.
                              </span>
                            )}
                          </p>
                        )}
                      </div>

                      {/* ✅ PIEZA/ZONA si hay presupuesto seleccionado */}
                      {selectedBudget && (
                        <div>
                          <label className="block text-sm font-medium text-blue-700 mb-2">
                            Pieza/Zona *
                          </label>
                          <input
                            type="text"
                            name="pieza"
                            value={formData.pieza || ''}
                            onChange={handleInputChange}
                            placeholder="Ej: 1.1, 1.2 o Frente, Pómulos"
                            className="w-full px-3 py-2 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-700"
                          />
                        </div>
                      )}
                    </div>

                    {/* ✅ NOMBRE DEL SERVICIO Y VALOR si hay presupuesto seleccionado */}
                    {selectedBudget && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-blue-700 mb-2">Nombre del Servicio *</label>
                          {isLoadingServices ? (
                            <div className="w-full px-3 py-2 border border-blue-200 rounded-xl bg-white">
                              <span className="text-slate-400 text-sm">Cargando...</span>
                            </div>
                          ) : (
                            <select
                              name="nombre_servicio"
                              value={formData.nombre_servicio}
                              onChange={handleInputChange}
                              className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-700 ${
                                formErrors.nombre_servicio ? 'border-red-300' : 'border-blue-200'
                              }`}
                            >
                              <option value="">Seleccionar servicio...</option>
                              {services.map((service) => (
                                <option key={service.id} value={service.nombre}>{service.nombre}</option>
                              ))}
                            </select>
                          )}
                          {formErrors.nombre_servicio && <p className="text-red-600 text-xs mt-1">{formErrors.nombre_servicio}</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-blue-700 mb-2">Valor del Tratamiento *</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">$</span>
                            <input
                              type="number"
                              name="valor"
                              value={formData.valor || ''}
                              onChange={handleInputChange}
                              placeholder="Auto"
                              min="0"
                              step="1000"
                              className={`w-full pl-8 pr-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-700 ${
                                formErrors.valor ? 'border-red-300' : 'border-blue-200'
                              }`}
                            />
                          </div>
                          {formErrors.valor && <p className="text-red-600 text-xs mt-1">{formErrors.valor}</p>}
                        </div>
                      </div>
                    )}

                    {selectedBudget && (
                      <div className="p-3 bg-white rounded-lg border border-blue-200">
                        <div className="text-sm text-blue-600 font-medium">
                          ✓ Se creará un nuevo item en el presupuesto #{selectedBudget}
                        </div>
                        <div className="mt-1 text-xs text-blue-500">
                          El tratamiento quedará vinculado automáticamente al presupuesto
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha del Control *</label>
                  <input
                    type="date"
                    name="fecha_control"
                    value={formData.fecha_control}
                    onChange={handleInputChange}
                    max={new Date().toISOString().split('T')[0]}
                    className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-700 ${
                      formErrors.fecha_control ? 'border-red-300' : 'border-cyan-200'
                    }`}
                  />
                  {formErrors.fecha_control && <p className="text-red-600 text-xs mt-1">{formErrors.fecha_control}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Hora del Control *</label>
                  <input
                    type="time"
                    name="hora_control"
                    value={formData.hora_control}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-700 ${
                      formErrors.hora_control ? 'border-red-300' : 'border-cyan-200'
                    }`}
                  />
                  {formErrors.hora_control && <p className="text-red-600 text-xs mt-1">{formErrors.hora_control}</p>}
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              {/* Próximo Control */}
              <div>
                <h4 className="text-lg font-semibold text-slate-700 mb-4 pb-2 border-b border-cyan-200 flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Próximo Control (Opcional)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Fecha del Próximo Control</label>
                    <input
                      type="date"
                      name="fecha_proximo_control"
                      value={formData.fecha_proximo_control}
                      onChange={handleInputChange}
                      min={formData.fecha_control}
                      className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-700 ${
                        formErrors.fecha_proximo_control ? 'border-red-300' : 'border-cyan-200'
                      }`}
                    />
                    {formErrors.fecha_proximo_control && <p className="text-red-600 text-xs mt-1">{formErrors.fecha_proximo_control}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Hora del Próximo Control</label>
                    <input
                      type="time"
                      name="hora_proximo_control"
                      value={formData.hora_proximo_control}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-700"
                    />
                  </div>
                </div>
              </div>

              {/* Información del Producto */}
              <div>
                <h4 className="text-lg font-semibold text-slate-700 mb-4 pb-2 border-b border-cyan-200 flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Información del Producto
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Producto Utilizado</label>
                    <input
                      type="text"
                      name="producto"
                      value={formData.producto}
                      onChange={handleInputChange}
                      placeholder="Ej: Botox Allergan"
                      className="w-full px-3 py-2 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Lote del Producto</label>
                    <input
                      type="text"
                      name="lote_producto"
                      value={formData.lote_producto}
                      onChange={handleInputChange}
                      placeholder="Número de lote"
                      className="w-full px-3 py-2 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de Vencimiento</label>
                    <input
                      type="date"
                      name="fecha_venc_producto"
                      value={formData.fecha_venc_producto}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-700 ${
                        formErrors.fecha_venc_producto ? 'border-red-300' : 'border-cyan-200'
                      }`}
                    />
                    {formErrors.fecha_venc_producto && <p className="text-red-600 text-xs mt-1">{formErrors.fecha_venc_producto}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Dilución/Concentración</label>
                    <input
                      type="text"
                      name="dilucion"
                      value={formData.dilucion}
                      onChange={handleInputChange}
                      placeholder="Ej: 100 UI en 2.5ml de solución salina"
                      className="w-full px-3 py-2 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-700"
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
                <h4 className="text-lg font-semibold text-slate-700 mb-4 pb-2 border-b border-cyan-200 flex items-center">
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
                          className="w-full h-48 object-cover rounded-xl border border-cyan-200"
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
                      <div className="border-2 border-dashed border-cyan-200 rounded-xl p-6 text-center hover:border-cyan-300 transition-colors">
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
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mb-2"></div>
                          ) : (
                            <Upload className="w-8 h-8 text-cyan-400 mb-2" />
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
                          className="w-full h-48 object-cover rounded-xl border border-cyan-200"
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
                      <div className="border-2 border-dashed border-cyan-200 rounded-xl p-6 text-center hover:border-cyan-300 transition-colors">
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
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mb-2"></div>
                          ) : (
                            <Upload className="w-8 h-8 text-cyan-400 mb-2" />
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
                  * Tamaño máximo: 10MB por imagen. Formatos aceptados: JPG, PNG, WebP
                </p>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Observaciones/Descripción</label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Detalles del tratamiento, observaciones, efectos secundarios, reacciones del paciente, etc."
                  className="w-full px-3 py-2 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-700 resize-none"
                />
              </div>
            </div>
            )}
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0 bg-slate-50">
              <div className="flex gap-2 sm:gap-3 flex-col-reverse sm:flex-row">
                {currentStep > 1 && (
                  <button
                    onClick={() => setCurrentStep(prev => prev - 1)}
                    className="flex-1 px-4 py-2 sm:py-2.5 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 rounded-lg transition-colors border border-slate-200"
                    disabled={isLoading}
                  >
                    Anterior
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 sm:py-2.5 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 rounded-lg transition-colors border border-slate-200"
                  disabled={isLoading}
                >
                  Cancelar
                </button>
                {currentStep < 3 ? (
                  <button
                    onClick={handleNext}
                    className="flex-1 px-4 py-2 sm:py-2.5 text-sm font-medium text-white bg-cyan-500 hover:bg-cyan-600 rounded-lg transition-colors shadow-sm flex items-center justify-center"
                    disabled={isLoading}
                  >
                    <span>Siguiente</span>
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    className="flex-1 px-4 py-2 sm:py-2.5 text-sm font-medium text-white bg-cyan-500 hover:bg-cyan-600 rounded-lg transition-colors shadow-sm flex items-center justify-center"
                    disabled={isLoading || uploadingImages.foto1 || uploadingImages.foto2}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        <span>Guardando...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        <span>Crear Tratamiento</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export { NewTreatmentModal };