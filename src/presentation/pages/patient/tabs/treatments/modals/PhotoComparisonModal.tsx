// src/presentation/pages/patient/tabs/treatments/modals/PhotoComparisonModal.tsx
import React from 'react';
import { X, Calendar, Image as ImageIcon } from 'lucide-react';
import { Treatment } from '@/core/use-cases/treatments';

interface PhotoComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: Treatment[];
  serviceName: string;
}

const PhotoComparisonModal: React.FC<PhotoComparisonModalProps> = ({
  isOpen,
  onClose,
  sessions,
  serviceName,
}) => {
  if (!isOpen) return null;

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("es-CL");
  };

  // Filtrar solo sesiones que tienen fotos
  const sessionsWithPhotos = sessions.filter(s => s.foto1 || s.foto2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ImageIcon className="w-6 h-6" />
              Comparación de Fotos
            </h2>
            <p className="text-cyan-100 text-sm mt-1">
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {sessionsWithPhotos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <ImageIcon className="w-16 h-16 mb-4 text-slate-300" />
              <p className="text-lg font-medium">No hay fotos registradas</p>
              <p className="text-sm mt-1">Las sesiones aún no tienen fotos adjuntas</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sessionsWithPhotos.map((session, index) => (
                <div key={session.id_tratamiento} className="bg-slate-50 rounded-lg border border-slate-200 p-4">
                  {/* Header de sesión */}
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-200">
                    <span className="text-xs font-semibold text-slate-700 bg-slate-200 px-2 py-1 rounded">
                      Sesión {index + 1}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-slate-600">
                      <Calendar className="w-3 h-3" />
                      {formatDate(session.fecha_control)}
                    </div>
                  </div>

                  {/* Fotos */}
                  <div className="space-y-3">
                    {session.foto1 && (
                      <div>
                        <p className="text-xs font-medium text-slate-700 mb-1">Foto 1</p>
                        <img
                          src={session.foto1}
                          alt={`Sesión ${index + 1} - Foto 1`}
                          className="w-full h-48 object-cover rounded-lg border border-slate-300 cursor-pointer hover:scale-105 transition-transform"
                          onClick={() => window.open(session.foto1, '_blank')}
                        />
                      </div>
                    )}

                    {session.foto2 && (
                      <div>
                        <p className="text-xs font-medium text-slate-700 mb-1">Foto 2</p>
                        <img
                          src={session.foto2}
                          alt={`Sesión ${index + 1} - Foto 2`}
                          className="w-full h-48 object-cover rounded-lg border border-slate-300 cursor-pointer hover:scale-105 transition-transform"
                          onClick={() => window.open(session.foto2, '_blank')}
                        />
                      </div>
                    )}
                  </div>

                  {/* Descripción si existe */}
                  {session.descripcion && (
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <p className="text-xs text-slate-600 line-clamp-2">
                        {session.descripcion}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t bg-slate-50 px-6 py-4 flex items-center justify-between">
          <p className="text-sm text-slate-600">
            <span className="font-medium">{sessionsWithPhotos.length}</span> {sessionsWithPhotos.length === 1 ? 'sesión' : 'sesiones'} con fotos
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export { PhotoComparisonModal };
