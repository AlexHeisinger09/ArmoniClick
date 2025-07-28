// src/presentation/pages/patient/tabs/treatments/modals/TreatmentDetailModal.tsx
import React from 'react';
import { Package, Camera, Edit, Trash2, X } from 'lucide-react';
import { TreatmentDetailModalProps } from '../shared/types';

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
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Detalles del Tratamiento</h2>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="max-h-[80vh] overflow-y-auto p-4 space-y-4">
          {/* Servicio */}
          <div className="bg-cyan-50 p-3 rounded-md">
            <h3 className="text-base font-semibold text-cyan-800 mb-2">{treatment.nombre_servicio}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
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

          {/* Producto */}
          {(treatment.producto || treatment.lote_producto || treatment.dilucion || treatment.fecha_venc_producto) && (
            <div className="bg-green-50 p-3 rounded-md">
              <h4 className="font-semibold text-green-800 mb-2 flex items-center">
                <Package className="w-4 h-4 mr-1" />
                Producto
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
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
                        <span className="ml-2 px-1.5 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">
                          ⚠️ Vencido
                        </span>
                      )}
                    </p>
                  </div>
                )}
                {treatment.dilucion && (
                  <div className="md:col-span-2">
                    <span className="text-gray-600">Dilución:</span>
                    <p className="font-medium">{treatment.dilucion}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Fotos */}
          {(treatment.foto1 || treatment.foto2) && (
            <div className="bg-purple-50 p-3 rounded-md">
              <h4 className="font-semibold text-purple-800 mb-2 flex items-center">
                <Camera className="w-4 h-4 mr-1" />
                Fotografías
              </h4>
              <div className="flex space-x-4">
                {treatment.foto1 && (
                  <div className="text-center">
                    <img
                      src={treatment.foto1}
                      alt="Antes"
                      className="w-48 h-48 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => window.open(treatment.foto1, '_blank')}
                    />
                    <p className="text-xs text-gray-600 mt-1 font-medium">Antes</p>
                  </div>
                )}
                {treatment.foto2 && (
                  <div className="text-center">
                    <img
                      src={treatment.foto2}
                      alt="Después"
                      className="w-48 h-48 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => window.open(treatment.foto2, '_blank')}
                    />
                    <p className="text-xs text-gray-600 mt-1 font-medium">Después</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Descripción */}
          {treatment.descripcion && (
            <div className="bg-gray-50 p-3 rounded-md">
              <h4 className="font-semibold text-gray-800 mb-1">Observaciones</h4>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{treatment.descripcion}</p>
            </div>
          )}
        </div>
      </div>
    </div>

  );
};

export { TreatmentDetailModal };