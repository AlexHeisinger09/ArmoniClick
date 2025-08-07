// src/presentation/pages/configuration/tabs/PhotoTab.tsx
import { useState, useRef } from "react";
import { Camera } from "lucide-react";
import { useLoginMutation, useProfile } from "@/presentation/hooks";
import { useUploadProfileImage } from "@/presentation/hooks/user/useUploadProfileImage";

interface PhotoTabProps {
  showMessage: (message: string, type: 'success' | 'error') => void;
}

const PhotoTab: React.FC<PhotoTabProps> = ({ showMessage }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hooks para datos del usuario
  const { token } = useLoginMutation();
  const { queryProfile } = useProfile(token || '');

  // Hook para upload de imagen
  const {
    uploadImageMutation,
    deleteImageMutation,
    isLoadingUpload,
    uploadProgress
  } = useUploadProfileImage();

  const userData = queryProfile.data;

  // Funciones para manejo de imágenes
  const validateImageFile = (file: File): string | null => {
    // Validar tipo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return 'Solo se permiten archivos JPG, PNG y WebP';
    }

    // Validar tamaño (5MB máximo)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return 'El archivo debe ser menor a 5MB';
    }

    return null;
  };

  const handleImageSelect = (file: File) => {
    const validationError = validateImageFile(file);
    if (validationError) {
      showMessage(validationError, 'error');
      return;
    }

    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Subir imagen
    uploadImageMutation.mutate(file, {
      onSuccess: () => {
        showMessage('Foto de perfil actualizada correctamente', 'success');
        setImagePreview(null);
      },
      onError: (error: any) => {
        showMessage(error.message || 'Error al subir la imagen', 'error');
        setImagePreview(null);
      }
    });
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageSelect(file);
    }
    // Resetear el input
    event.target.value = '';
  };

  const handleDeleteImage = () => {
    deleteImageMutation.mutate(undefined, {
      onSuccess: () => {
        showMessage('Foto de perfil eliminada correctamente', 'success');
        setImagePreview(null);
      },
      onError: (error: any) => {
        showMessage(error.message || 'Error al eliminar la imagen', 'error');
      }
    });
  };

  // Funciones para drag & drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleImageSelect(files[0]);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-8">
      <h3 className="text-xl font-semibold text-gray-900 mb-8">Foto de Perfil</h3>

      <div className="flex items-start space-x-6">
        {/* Imagen con ícono de cámara clickeable */}
        <div className="relative cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          <div className="w-28 h-28 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 hover:border-cyan-300 transition-colors">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Vista previa"
                className="w-full h-full object-cover"
              />
            ) : userData?.img ? (
              <img
                src={userData.img}
                alt="Foto de perfil"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500 font-medium text-xl">
                {userData?.name?.[0]?.toUpperCase() || ''}{userData?.lastName?.[0]?.toUpperCase() || ''}
              </div>
            )}
          </div>

          {/* Ícono de cámara clickeable */}
          <div className="absolute bottom-0 right-0 bg-cyan-500 hover:bg-cyan-600 rounded-full p-2 border-2 border-white transition-colors">
            <Camera className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Contenido de texto */}
        <div className="flex-1 space-y-4">
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              Cambiar foto de perfil
            </h4>
            <p className="text-sm text-gray-500 leading-relaxed">
              Nuestra aplicación detecta y centra automáticamente tu rostro para obtener la mejor foto de perfil. Tamaño máximo: 5MB. Formatos aceptados: JPG, PNG.
            </p>
          </div>

          {/* Progreso de upload */}
          {isLoadingUpload && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subiendo imagen...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-cyan-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input file oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handlePhotoUpload}
        className="hidden"
        disabled={isLoadingUpload}
      />
    </div>
  );
};

export { PhotoTab };