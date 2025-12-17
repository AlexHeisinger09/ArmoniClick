// src/presentation/pages/patient/tabs/treatments/modals/AddBudgetItemModal.tsx
import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useServices } from '@/presentation/hooks/services/useServices';

interface AddBudgetItemModalProps {
  isOpen: boolean;
  budgetId: number;
  onClose: () => void;
  onSubmit: (data: { pieza?: string; accion: string; valor: number }) => Promise<void>;
  isLoading?: boolean;
}

const AddBudgetItemModal: React.FC<AddBudgetItemModalProps> = ({
  isOpen,
  budgetId,
  onClose,
  onSubmit,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<{
    pieza: string;
    accion: string;
    valor: number;
  }>({
    pieza: '',
    accion: '',
    valor: 0,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const { services, isLoading: isLoadingServices } = useServices();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'valor') {
      const numericValue = parseFloat(value) || 0;
      setFormData(prev => ({ ...prev, [name]: numericValue }));
    } else if (name === 'accion') {
      // Auto-asignar valor del servicio seleccionado
      const selectedService = services.find(s => s.nombre === value);
      setFormData(prev => ({
        ...prev,
        [name]: value,
        valor: selectedService ? parseFloat(selectedService.valor) : prev.valor
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.accion) errors.accion = 'El servicio es requerido';
    if (!formData.valor || formData.valor <= 0) errors.valor = 'El valor debe ser mayor a 0';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    await onSubmit({
      pieza: formData.pieza || undefined,
      accion: formData.accion,
      valor: formData.valor,
    });

    handleClose();
  };

  const handleClose = () => {
    setFormData({ pieza: '', accion: '', valor: 0 });
    setFormErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={handleClose}
      />
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md">
            {/* Header */}
            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Agregar Tratamiento
                  </h3>
                  <p className="text-sm text-white text-opacity-90 mt-0.5">
                    Presupuesto #{budgetId}
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  disabled={isLoading}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Form content */}
            <div className="p-6 space-y-4">
              {/* Pieza/Zona */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Pieza/Zona (Opcional)
                </label>
                <input
                  type="text"
                  name="pieza"
                  value={formData.pieza}
                  onChange={handleInputChange}
                  placeholder="Ej: 1.1, 1.2 o Frente, Pómulos"
                  className="w-full px-3 py-2 border border-cyan-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-700"
                />
              </div>

              {/* Servicio */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Servicio *
                </label>
                {isLoadingServices ? (
                  <div className="w-full px-3 py-2 border border-cyan-200 rounded-xl bg-white">
                    <span className="text-slate-400 text-sm">Cargando servicios...</span>
                  </div>
                ) : (
                  <select
                    name="accion"
                    value={formData.accion}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-700 ${
                      formErrors.accion ? 'border-red-300' : 'border-cyan-200'
                    }`}
                  >
                    <option value="">Seleccionar servicio...</option>
                    {services.map((service) => (
                      <option key={service.id} value={service.nombre}>
                        {service.nombre}
                      </option>
                    ))}
                  </select>
                )}
                {formErrors.accion && (
                  <p className="text-red-600 text-xs mt-1">{formErrors.accion}</p>
                )}
              </div>

              {/* Valor */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Valor *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">
                    $
                  </span>
                  <input
                    type="number"
                    name="valor"
                    value={formData.valor || ''}
                    onChange={handleInputChange}
                    placeholder="Se asigna automáticamente"
                    min="0"
                    step="1000"
                    className={`w-full pl-8 pr-3 py-2 border rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-700 ${
                      formErrors.valor ? 'border-red-300' : 'border-cyan-200'
                    }`}
                  />
                </div>
                {formErrors.valor && (
                  <p className="text-red-600 text-xs mt-1">{formErrors.valor}</p>
                )}
                <p className="text-xs text-slate-500 mt-1">
                  💡 Se asigna automáticamente al seleccionar un servicio
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 px-6 py-4 bg-slate-50">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 rounded-lg transition-colors border border-slate-200"
                  disabled={isLoading}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-cyan-500 hover:bg-cyan-600 rounded-lg transition-colors shadow-sm flex items-center justify-center"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      <span>Agregar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export { AddBudgetItemModal };
