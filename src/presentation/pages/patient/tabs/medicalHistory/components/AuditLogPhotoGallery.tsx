import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface Photo {
  url: string;
  alt?: string;
}

interface AuditLogPhotoGalleryProps {
  photos: Photo[];
  title?: string;
}

const AuditLogPhotoGallery: React.FC<AuditLogPhotoGalleryProps> = ({
  photos,
  title = 'Fotos',
}) => {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  if (photos.length === 0) {
    return null;
  }

  const currentPhoto = selectedPhotoIndex !== null ? photos[selectedPhotoIndex] : null;

  const handlePrevious = () => {
    if (selectedPhotoIndex === null) return;
    const newIndex = selectedPhotoIndex === 0 ? photos.length - 1 : selectedPhotoIndex - 1;
    setSelectedPhotoIndex(newIndex);
  };

  const handleNext = () => {
    if (selectedPhotoIndex === null) return;
    const newIndex = selectedPhotoIndex === photos.length - 1 ? 0 : selectedPhotoIndex + 1;
    setSelectedPhotoIndex(newIndex);
  };

  return (
    <div className="mt-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-semibold text-gray-600">{title}</span>
        <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
          {photos.length}
        </span>
      </div>

      {/* Thumbnails Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {photos.map((photo, index) => (
          <button
            key={index}
            onClick={() => setSelectedPhotoIndex(index)}
            className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-cyan-500 transition-all cursor-pointer hover:scale-105"
          >
            <img
              src={photo.url}
              alt={photo.alt || `Foto ${index + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f0f0f0" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="16"%3EImagen no disponible%3C/text%3E%3C/svg%3E';
              }}
            />
          </button>
        ))}
      </div>

      {/* Modal de foto ampliada */}
      {currentPhoto !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-2xl max-h-[90vh] flex flex-col">
            {/* Botón cerrar */}
            <button
              onClick={() => setSelectedPhotoIndex(null)}
              className="absolute top-4 right-4 p-2 bg-white rounded-full hover:bg-gray-200 transition-colors z-10"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>

            {/* Imagen ampliada */}
            <div className="flex-1 flex items-center justify-center bg-black rounded-lg overflow-hidden">
              <img
                src={currentPhoto.url}
                alt={currentPhoto.alt || 'Foto ampliada'}
                className="max-w-full max-h-[70vh] object-contain"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23333" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="16"%3EImagen no disponible%3C/text%3E%3C/svg%3E';
                }}
              />
            </div>

            {/* Controles de navegación */}
            {photos.length > 1 && (
              <div className="flex items-center justify-between gap-4 mt-4 bg-white p-3 rounded-lg">
                <button
                  onClick={handlePrevious}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-700" />
                </button>

                <span className="text-sm font-medium text-gray-700">
                  {selectedPhotoIndex !== null && selectedPhotoIndex + 1} / {photos.length}
                </span>

                <button
                  onClick={handleNext}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-gray-700" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export { AuditLogPhotoGallery };
