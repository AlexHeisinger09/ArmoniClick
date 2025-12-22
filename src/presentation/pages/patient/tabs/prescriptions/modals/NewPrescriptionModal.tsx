// src/presentation/pages/patient/tabs/prescriptions/modals/NewPrescriptionModal.tsx
import React, { useState } from 'react';
import { X, FileText, Loader2 } from 'lucide-react';

interface NewPrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (medications: string) => Promise<void>;
  isSaving: boolean;
}

export const NewPrescriptionModal: React.FC<NewPrescriptionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  isSaving
}) => {
  const [medications, setMedications] = useState('');

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!medications.trim()) {
      return;
    }

    await onSave(medications);
    setMedications('');
    onClose();
  };

  const handleClose = () => {
    setMedications('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-cyan-100 p-2 rounded-lg">
              <FileText className="w-6 h-6 text-cyan-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-700">Nueva Receta Médica</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isSaving}
            className="text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Indicaciones Médicas *
            </label>
            <textarea
              value={medications}
              onChange={(e) => setMedications(e.target.value)}
              placeholder="Ejemplo:&#10;&#10;Amoxicilina con ácido clavulánico 875/125 mg&#10;1 comprimido cada 12 hrs x 7 días&#10;&#10;Ibuprofeno 400 mg&#10;1 comprimido cada 8 hrs si hay dolor"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
              rows={12}
              disabled={isSaving}
            />
            <p className="mt-2 text-sm text-slate-500">
              Escribe las medicaciones y sus indicaciones. Cada línea será parte de la receta.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleClose}
            disabled={isSaving}
            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !medications.trim()}
            className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generando...</span>
              </>
            ) : (
              <span>Generar Receta</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
