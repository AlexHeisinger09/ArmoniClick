// src/presentation/pages/patient/tabs/treatments/modals/TreatmentDetailModal.tsx - ACTUALIZADO
import React from 'react';
import { Package, Camera, Edit, Trash2, X, CheckCircle, AlertCircle } from 'lucide-react';
import { TreatmentDetailModalProps } from '../shared/types';

const TreatmentDetailModal: React.FC<TreatmentDetailModalProps> = ({
  isOpen,
  treatment,
  onClose,
  onEdit,
  onComplete,
  onDelete,
  canComplete = false
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

  const getStatusInfo = (status?: string) => {
    switch (status) {
      case 'completed':
        return {
          icon: <CheckCircle className="w-5 h-5 text-green-600" />,
          label: 'Completado',
          color: 'text-green-600 bg-green-50 border-green-200'
        };
      case 'pending':
      default:
        return {
          icon: <AlertCircle className="w-5 h-5 text-orange-600" />,
          label: 'Pendiente',
          color: 'text-orange-600 bg-orange-50 border-orange-200'
        };
    }
  };

  const statusInfo = getStatusInfo(treatment.status);

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md sm:max-w-2xl">
            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 px-4 sm:px-6 py-3 sm:py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="text-base sm:text-lg font-semibold text-white">
                    Detalles del Tratamiento
                  </h3>
                  <div className="mt-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium border ${statusInfo.color}`}>
                      {statusInfo.icon}
                      <span className="ml-2">{statusInfo.label}</span>
                    </span>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 sm:p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors flex-shrink-0 ml-2"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </button>
              </div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-4 sm:p-6 space-y-4">
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

          {/* ✅ NUEVO: Información del presupuesto asociado */}
          {treatment.budget_item_id && (
            <div className="bg-purple-50 p-3 rounded-md">
              <h4 className="font-semibold text-purple-800 mb-2">Información del Tratamiento</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                {treatment.budget_item_pieza && (
                  <div>
                    <span className="text-gray-600">Pieza/Zona:</span>
                    <p className="font-medium">{treatment.budget_item_pieza}</p>
                  </div>
                )}
                {treatment.budget_item_valor && (
                  <div>
                    <span className="text-gray-600">Valor presupuestado:</span>
                    <p className="font-medium text-green-600">
                      ${parseFloat(treatment.budget_item_valor).toLocaleString('es-CL')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

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

            {/* Footer con información y botones */}
            <div className="border-t border-slate-200 px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0 bg-slate-50">
              <div className="text-xs sm:text-sm text-slate-600 mb-3">
                <p>Creado: {formatDate(treatment.created_at)}</p>
                {treatment.updated_at && (
                  <p>Actualizado: {formatDate(treatment.updated_at)}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export { TreatmentDetailModal };