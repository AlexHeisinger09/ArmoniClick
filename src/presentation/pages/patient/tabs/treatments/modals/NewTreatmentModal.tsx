// src/presentation/pages/patient/tabs/treatments/modals/NewTreatmentModal.tsx
import React, { useState } from 'react';
import { Calendar, Clock, Package, Camera, X } from 'lucide-react';
import { CreateTreatmentData } from "@/core/use-cases/treatments";
import { NewTreatmentModalProps, SERVICIOS_COMUNES } from '../shared/types';

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              Nuevo Tratamiento - Paciente ID: {patientId}
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
                  {SERVICIOS_COMUNES.map((servicio) => (
                    <option key={servicio} value={servicio}>
                      {servicio}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={formData.nombre_servicio}
                  onChange={handleChange}
                  name="nombre_servicio"
                  placeholder="O escriba un tratamiento personalizado"
                  className="w-full px-3 py-1 mt-2 border border-gray-100 rounded-lg text-sm text-gray-600 focus:ring-1 focus:ring-green-400"
                />
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

export { NewTreatmentModal };