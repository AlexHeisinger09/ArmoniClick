// src/presentation/pages/patient/tabs/treatments/modals/AddSessionModal.tsx
import React, { useState } from 'react';
import { X, Calendar, Clock, FileText, Package, Droplet, Calendar as CalendarIcon, Image } from 'lucide-react';
import { AddSessionData } from '@/core/use-cases/treatments';

interface AddSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (sessionData: AddSessionData) => Promise<void>;
  budgetItemId: number;
  serviceName: string;
  isLoading?: boolean;
}

const AddSessionModal: React.FC<AddSessionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  budgetItemId,
  serviceName,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<Partial<AddSessionData>>({
    budget_item_id: budgetItemId,
    fecha_control: new Date().toISOString().split('T')[0],
    hora_control: new Date().toTimeString().slice(0, 5),
    descripcion: '',
    producto: '',
    lote_producto: '',
    fecha_venc_producto: '',
    dilucion: '',
    foto1: '',
    foto2: '',
    fecha_proximo_control: '',
    hora_proximo_control: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof AddSessionData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error al cambiar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fecha_control) {
      newErrors.fecha_control = 'La fecha es requerida';
    }

    if (!formData.hora_control) {
      newErrors.hora_control = 'La hora es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      await onSubmit(formData as AddSessionData);
      // Resetear form
      setFormData({
        budget_item_id: budgetItemId,
        fecha_control: new Date().toISOString().split('T')[0],
        hora_control: new Date().toTimeString().slice(0, 5),
        descripcion: '',
        producto: '',
        lote_producto: '',
        fecha_venc_producto: '',
        dilucion: '',
        foto1: '',
        foto2: '',
        fecha_proximo_control: '',
        hora_proximo_control: '',
      });
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Error al agregar sesión:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FileText className="w-6 h-6" />
              Nueva Sesión / Evolución
            </h2>
            <p className="text-purple-100 text-sm mt-1">
              {serviceName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {/* Fecha y Hora de Control */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  Fecha de Control *
                </label>
                <input
                  type="date"
                  value={formData.fecha_control}
                  onChange={(e) => handleChange('fecha_control', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                    errors.fecha_control ? 'border-red-500' : 'border-slate-300'
                  }`}
                  required
                />
                {errors.fecha_control && (
                  <p className="text-red-500 text-xs mt-1">{errors.fecha_control}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-600" />
                  Hora de Control *
                </label>
                <input
                  type="time"
                  value={formData.hora_control}
                  onChange={(e) => handleChange('hora_control', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                    errors.hora_control ? 'border-red-500' : 'border-slate-300'
                  }`}
                  required
                />
                {errors.hora_control && (
                  <p className="text-red-500 text-xs mt-1">{errors.hora_control}</p>
                )}
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-600" />
                Descripción de la Sesión
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => handleChange('descripcion', e.target.value)}
                placeholder="Describe lo realizado en esta sesión..."
                rows={3}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
              />
            </div>

            {/* Producto y Lote */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <Package className="w-4 h-4 text-purple-600" />
                  Producto Utilizado
                </label>
                <input
                  type="text"
                  value={formData.producto}
                  onChange={(e) => handleChange('producto', e.target.value)}
                  placeholder="Nombre del producto"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Lote del Producto
                </label>
                <input
                  type="text"
                  value={formData.lote_producto}
                  onChange={(e) => handleChange('lote_producto', e.target.value)}
                  placeholder="Lote"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Fecha de Vencimiento y Dilución */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-purple-600" />
                  Fecha de Vencimiento
                </label>
                <input
                  type="date"
                  value={formData.fecha_venc_producto}
                  onChange={(e) => handleChange('fecha_venc_producto', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <Droplet className="w-4 h-4 text-purple-600" />
                  Dilución
                </label>
                <input
                  type="text"
                  value={formData.dilucion}
                  onChange={(e) => handleChange('dilucion', e.target.value)}
                  placeholder="ej: 1:1"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Próxima Fecha y Hora */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Próximo Control (Opcional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Fecha Próximo Control
                  </label>
                  <input
                    type="date"
                    value={formData.fecha_proximo_control}
                    onChange={(e) => handleChange('fecha_proximo_control', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Hora Próximo Control
                  </label>
                  <input
                    type="time"
                    value={formData.hora_proximo_control}
                    onChange={(e) => handleChange('hora_proximo_control', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Nota sobre fotos */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
              <Image className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Agregar Fotos</p>
                <p className="text-blue-700">
                  Puedes agregar fotos después de crear la sesión editándola desde la lista.
                </p>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="border-t bg-slate-50 px-6 py-4 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors font-medium disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Guardando...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                Registrar Sesión
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export { AddSessionModal };
