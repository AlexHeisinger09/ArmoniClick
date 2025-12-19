// src/presentation/pages/patient/tabs/treatments/modals/PhotoComparisonModal.tsx
import React, { useState, useMemo } from 'react';
import { X, Calendar, Image as ImageIcon, ChevronLeft, ChevronRight, Check, Maximize2, Minimize2 } from 'lucide-react';
import { Treatment } from '@/core/use-cases/treatments';
import { formatDate } from '@/presentation/utils/dateHelpers';

interface PhotoComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: Treatment[];
  serviceName: string;
}

interface PhotoItem {
  url: string;
  sessionIndex: number;
  sessionDate: string;
  photoLabel: string;
  description?: string;
}

const PhotoComparisonModal: React.FC<PhotoComparisonModalProps> = ({
  isOpen,
  onClose,
  sessions,
  serviceName,
}) => {
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'gallery' | 'viewer' | 'compare'>('gallery');

  // Crear array de todas las fotos con metadata
  const allPhotos: PhotoItem[] = useMemo(() => {
    const photos: PhotoItem[] = [];
    sessions.forEach((session, index) => {
      if (session.foto1) {
        photos.push({
          url: session.foto1,
          sessionIndex: index + 1,
          sessionDate: formatDate(session.fecha_control),
          photoLabel: 'Foto 1',
          description: session.descripcion,
        });
      }
      if (session.foto2) {
        photos.push({
          url: session.foto2,
          sessionIndex: index + 1,
          sessionDate: formatDate(session.fecha_control),
          photoLabel: 'Foto 2',
          description: session.descripcion,
        });
      }
    });
    return photos;
  }, [sessions]);

  // Filtrar solo sesiones que tienen fotos
  const sessionsWithPhotos = useMemo(() => sessions.filter(s => s.foto1 || s.foto2), [sessions]);

  // Resetear estado al cerrar
  const handleClose = () => {
    setSelectedPhotos([]);
    setCurrentPhotoIndex(0);
    setViewMode('gallery');
    onClose();
  };

  const handlePhotoClick = (photoUrl: string) => {
    if (viewMode === 'gallery') {
      const index = allPhotos.findIndex(p => p.url === photoUrl);
      setCurrentPhotoIndex(index);
      setViewMode('viewer');
    }
  };

  const handleSelectPhoto = (photoUrl: string) => {
    if (selectedPhotos.includes(photoUrl)) {
      setSelectedPhotos(selectedPhotos.filter(p => p !== photoUrl));
    } else {
      if (selectedPhotos.length < 2) {
        setSelectedPhotos([...selectedPhotos, photoUrl]);
      } else {
        // Reemplazar la primera foto seleccionada
        setSelectedPhotos([selectedPhotos[1], photoUrl]);
      }
    }
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentPhotoIndex((prev) => (prev > 0 ? prev - 1 : allPhotos.length - 1));
    } else {
      setCurrentPhotoIndex((prev) => (prev < allPhotos.length - 1 ? prev + 1 : 0));
    }
  };

  const handleCompareMode = () => {
    if (selectedPhotos.length === 2) {
      setViewMode('compare');
    }
  };

  // Manejar teclas de navegación
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        if (viewMode !== 'gallery') {
          setViewMode('gallery');
        } else {
          handleClose();
        }
      }

      // Navegación con flechas solo en modo visor
      if (viewMode === 'viewer') {
        if (e.key === 'ArrowLeft') {
          handleNavigate('prev');
        } else if (e.key === 'ArrowRight') {
          handleNavigate('next');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, viewMode, allPhotos.length]);

  if (!isOpen) return null;

  const currentPhoto = allPhotos[currentPhotoIndex];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          if (viewMode !== 'gallery') {
            setViewMode('gallery');
          } else {
            handleClose();
          }
        }
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ImageIcon className="w-6 h-6" />
              {viewMode === 'gallery' && 'Galería de Fotos'}
              {viewMode === 'viewer' && 'Visualizador de Fotos'}
              {viewMode === 'compare' && 'Comparación de Fotos'}
            </h2>
            <p className="text-cyan-100 text-sm mt-1">
              {serviceName} {viewMode !== 'gallery' && <span className="text-xs opacity-75">(ESC para volver)</span>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {viewMode !== 'gallery' && (
              <button
                onClick={() => setViewMode('gallery')}
                className="text-white hover:bg-white/20 rounded-lg px-3 py-1.5 transition-colors text-sm font-medium"
              >
                ← Galería
              </button>
            )}
            <button
              onClick={handleClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {sessionsWithPhotos.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12 text-slate-500">
              <ImageIcon className="w-16 h-16 mb-4 text-slate-300" />
              <p className="text-lg font-medium">No hay fotos registradas</p>
              <p className="text-sm mt-1">Las sesiones aún no tienen fotos adjuntas</p>
            </div>
          ) : (
            <>
              {/* Vista de Galería */}
              {viewMode === 'gallery' && (
                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {allPhotos.map((photo, index) => (
                      <div
                        key={index}
                        className={`relative group rounded-lg overflow-hidden border-2 transition-all ${
                          selectedPhotos.includes(photo.url)
                            ? 'border-cyan-500 shadow-lg shadow-cyan-500/50'
                            : 'border-slate-200 hover:border-cyan-300'
                        }`}
                      >
                        {/* Imagen */}
                        <div
                          className="aspect-square relative cursor-pointer"
                          onClick={() => handlePhotoClick(photo.url)}
                        >
                          <img
                            src={photo.url}
                            alt={`${photo.sessionIndex} - ${photo.photoLabel}`}
                            className="w-full h-full object-cover"
                          />

                          {/* Overlay hover */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <Maximize2 className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>

                          {/* Badge de selección */}
                          {selectedPhotos.includes(photo.url) && (
                            <div className="absolute top-2 right-2 bg-cyan-500 text-white rounded-full p-1.5 z-10">
                              <Check className="w-4 h-4" />
                            </div>
                          )}

                          {/* Badge de número de selección */}
                          {selectedPhotos.includes(photo.url) && (
                            <div className="absolute top-2 left-2 bg-cyan-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold z-10">
                              {selectedPhotos.indexOf(photo.url) + 1}
                            </div>
                          )}
                        </div>

                        {/* Info y botón de selección */}
                        <div className="p-2 bg-slate-50 flex items-center justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-700 truncate">
                              Sesión {photo.sessionIndex}
                            </p>
                            <p className="text-xs text-slate-600 truncate">{photo.sessionDate}</p>
                            <p className="text-xs text-slate-500">{photo.photoLabel}</p>
                          </div>

                          {/* Botón de seleccionar */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectPhoto(photo.url);
                            }}
                            className={`flex-shrink-0 p-1.5 rounded-lg transition-all ${
                              selectedPhotos.includes(photo.url)
                                ? 'bg-cyan-500 text-white hover:bg-cyan-600'
                                : 'bg-slate-200 text-slate-600 hover:bg-cyan-100 hover:text-cyan-700'
                            }`}
                            title={selectedPhotos.includes(photo.url) ? 'Deseleccionar' : 'Seleccionar para comparar'}
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Instrucciones */}
                  <div className="mt-6 p-4 bg-cyan-50 border border-cyan-200 rounded-lg">
                    <p className="text-sm text-cyan-900 font-medium mb-2">
                      💡 Instrucciones:
                    </p>
                    <ul className="text-sm text-cyan-800 space-y-1">
                      <li>• <strong>Click en la imagen</strong> para verla en pantalla completa</li>
                      <li>• <strong>Click en el botón ✓</strong> para seleccionar hasta 2 fotos para comparar</li>
                      <li>• Selecciona 2 fotos y usa el botón <strong>"Comparar"</strong> para verlas lado a lado</li>
                      <li>• Presiona <strong>ESC</strong> o click fuera del modal para volver/cerrar</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Vista de Visor Individual */}
              {viewMode === 'viewer' && currentPhoto && (
                <div className="flex flex-col h-full">
                  <div
                    className="flex-1 flex items-center justify-center bg-slate-900 p-8 relative"
                    onClick={(e) => {
                      if (e.target === e.currentTarget) {
                        setViewMode('gallery');
                      }
                    }}
                  >
                    {/* Navegación */}
                    <button
                      onClick={() => handleNavigate('prev')}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition-colors z-10"
                      title="Anterior (←)"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>

                    <button
                      onClick={() => handleNavigate('next')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition-colors z-10"
                      title="Siguiente (→)"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>

                    {/* Imagen principal */}
                    <img
                      src={currentPhoto.url}
                      alt={`Sesión ${currentPhoto.sessionIndex}`}
                      className="max-h-full max-w-full object-contain rounded-lg shadow-2xl cursor-pointer"
                      onClick={() => setViewMode('gallery')}
                    />

                    {/* Contador */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm font-medium">
                      {currentPhotoIndex + 1} / {allPhotos.length}
                    </div>

                    {/* Botón volver a galería */}
                    <button
                      onClick={() => setViewMode('gallery')}
                      className="absolute top-4 left-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="hidden sm:inline">Galería</span>
                    </button>

                    {/* Botón seleccionar */}
                    <button
                      onClick={() => handleSelectPhoto(currentPhoto.url)}
                      className={`absolute top-4 right-4 px-4 py-2 rounded-lg font-medium transition-colors ${
                        selectedPhotos.includes(currentPhoto.url)
                          ? 'bg-cyan-500 hover:bg-cyan-600 text-white'
                          : 'bg-white/10 hover:bg-white/20 text-white'
                      }`}
                    >
                      {selectedPhotos.includes(currentPhoto.url) ? (
                        <>
                          <Check className="w-4 h-4 inline mr-1" />
                          Seleccionada
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 inline mr-1" />
                          Seleccionar
                        </>
                      )}
                    </button>
                  </div>

                  {/* Info de la foto */}
                  <div className="bg-slate-800 text-white p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">
                          Sesión {currentPhoto.sessionIndex} - {currentPhoto.photoLabel}
                        </p>
                        <p className="text-sm text-slate-300">{currentPhoto.sessionDate}</p>
                        {currentPhoto.description && (
                          <p className="text-sm text-slate-400 mt-2">{currentPhoto.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Vista de Comparación */}
              {viewMode === 'compare' && selectedPhotos.length === 2 && (
                <div className="h-full flex flex-col">
                  <div className="flex-1 flex flex-col md:flex-row gap-4 p-6 bg-slate-50">
                    {selectedPhotos.map((photoUrl, index) => {
                      const photo = allPhotos.find(p => p.url === photoUrl);
                      if (!photo) return null;

                      return (
                        <div key={index} className="flex-1 flex flex-col bg-white rounded-lg overflow-hidden shadow-lg">
                          <div className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-2">
                            <p className="font-semibold">Foto {index + 1}</p>
                            <p className="text-sm text-cyan-100">
                              Sesión {photo.sessionIndex} - {photo.sessionDate}
                            </p>
                          </div>
                          <div className="flex-1 flex items-center justify-center p-4 bg-slate-900">
                            <img
                              src={photo.url}
                              alt={`Comparación ${index + 1}`}
                              className="max-h-full max-w-full object-contain rounded"
                            />
                          </div>
                          <div className="p-3 bg-slate-100 text-sm">
                            <p className="font-medium text-slate-700">{photo.photoLabel}</p>
                            {photo.description && (
                              <p className="text-slate-600 text-xs mt-1 line-clamp-2">{photo.description}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Botones de comparación */}
                  <div className="bg-white border-t p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-slate-600">
                        Comparando 2 fotografías seleccionadas
                      </p>
                      <button
                        onClick={() => {
                          setSelectedPhotos([]);
                          setViewMode('gallery');
                        }}
                        className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors font-medium"
                      >
                        Nueva Comparación
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t bg-slate-50 px-6 py-4 flex-shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <p className="text-sm text-slate-600">
              <span className="font-medium">{allPhotos.length}</span> {allPhotos.length === 1 ? 'foto' : 'fotos'} en {sessionsWithPhotos.length} {sessionsWithPhotos.length === 1 ? 'sesión' : 'sesiones'}
            </p>
            {selectedPhotos.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-cyan-600 font-medium">
                  {selectedPhotos.length} foto{selectedPhotos.length !== 1 ? 's' : ''} seleccionada{selectedPhotos.length !== 1 ? 's' : ''}
                </span>
                {selectedPhotos.length === 2 && viewMode !== 'compare' && (
                  <button
                    onClick={handleCompareMode}
                    className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    Comparar
                  </button>
                )}
                <button
                  onClick={() => {
                    setSelectedPhotos([]);
                    if (viewMode === 'compare') {
                      setViewMode('gallery');
                    }
                  }}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors text-sm"
                >
                  Limpiar selección
                </button>
              </div>
            )}
          </div>
          <button
            onClick={handleClose}
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
