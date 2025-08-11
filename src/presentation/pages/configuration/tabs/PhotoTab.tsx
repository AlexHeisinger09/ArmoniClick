// src/presentation/pages/configuration/tabs/PhotoTab.tsx
import { useState, useRef, useEffect } from "react";
import { Camera, PenTool, Upload, Trash2, X } from "lucide-react";
import { useLoginMutation, useProfile } from "@/presentation/hooks";
import { useUploadProfileImage } from "@/presentation/hooks/user/useUploadProfileImage";
import { useUploadSignature } from "@/presentation/hooks/user/useUploadSignature";

interface PhotoTabProps {
  showMessage: (message: string, type: 'success' | 'error') => void;
}

// Componente para el Canvas de Firma con soporte táctil mejorado
const SignatureCanvas: React.FC<{
  onSave: (dataUrl: string) => void;
  onCancel: () => void;
}> = ({ onSave, onCancel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPosition, setLastPosition] = useState<{ x: number; y: number } | null>(null);

  // Prevenir scroll en el body cuando el modal está abierto
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  // Función para obtener coordenadas de mouse o touch
  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    
    if ('touches' in e) {
      // Evento táctil
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
    } else {
      // Evento de mouse
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  // Configurar contexto del canvas
  const setupCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#000000';
    
    return ctx;
  };

  // Iniciar dibujo
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const coords = getCoordinates(e);
    const ctx = setupCanvas();
    if (!ctx) return;

    setIsDrawing(true);
    setLastPosition(coords);
    
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
  };

  // Dibujar línea
  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isDrawing || !lastPosition) return;

    const coords = getCoordinates(e);
    const ctx = setupCanvas();
    if (!ctx) return;

    // Dibujar línea suave entre la última posición y la actual
    ctx.beginPath();
    ctx.moveTo(lastPosition.x, lastPosition.y);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
    
    setLastPosition(coords);
  };

  // Terminar dibujo
  const stopDrawing = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    setIsDrawing(false);
    setLastPosition(null);
  };

  // Limpiar canvas
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Guardar firma
  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
  };

  // Prevenir eventos de fondo en el modal
  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
      style={{ touchAction: 'none' }}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-auto"
        onClick={handleModalClick}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Crear Firma Digital</h3>
            <p className="text-sm text-gray-500 mt-1">Dibuja tu firma en el área de abajo</p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Instrucciones */}
          <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <PenTool className="w-5 h-5 text-cyan-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-cyan-800">Instrucciones:</p>
                <ul className="text-sm text-cyan-700 mt-1 space-y-1">
                  <li>• Usa tu dedo o stylus para dibujar</li>
                  <li>• Mantén presionado mientras dibujas</li>
                  <li>• Puedes limpiar y empezar de nuevo</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Canvas Container */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="bg-white border-2 border-gray-300 rounded-lg overflow-hidden">
              <canvas
                ref={canvasRef}
                width={400}
                height={150}
                className="w-full touch-none"
                style={{ 
                  touchAction: 'none',
                  maxWidth: '100%',
                  height: 'auto'
                }}
                // Eventos de mouse
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                // Eventos táctiles
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                onTouchCancel={stopDrawing}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={clearCanvas}
              className="flex items-center justify-center px-4 py-3 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Limpiar
            </button>
            
            <div className="flex gap-3 flex-1">
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={saveSignature}
                className="flex-1 px-4 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors font-medium"
              >
                Guardar Firma
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PhotoTab: React.FC<PhotoTabProps> = ({ showMessage }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showSignatureCanvas, setShowSignatureCanvas] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const signatureFileInputRef = useRef<HTMLInputElement>(null);

  // Hooks para datos del usuario
  const { token } = useLoginMutation();
  const { queryProfile } = useProfile(token || '');

  // Hook para upload de imagen de perfil
  const {
    uploadImageMutation,
    deleteImageMutation,
    isLoadingUpload: isLoadingProfileUpload,
    uploadProgress: profileUploadProgress
  } = useUploadProfileImage();

  // Hook para upload de firma
  const {
    uploadSignatureMutation,
    uploadSignatureFileMutation,
    deleteSignatureMutation,
    isLoadingUpload: isLoadingSignatureUpload,
    uploadProgress: signatureUploadProgress
  } = useUploadSignature();

  const userData = queryProfile.data;

  // Funciones para manejo de imágenes de perfil
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

  // Funciones para manejo de firma
  const validateSignatureFile = (file: File): string | null => {
    // Validar tipo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return 'Solo se permiten archivos JPG, PNG y WebP para la firma';
    }

    // Validar tamaño (2MB máximo para firmas)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      return 'La firma debe ser menor a 2MB';
    }

    return null;
  };

  const handleSignatureFileSelect = async (file: File) => {
    const validationError = validateSignatureFile(file);
    if (validationError) {
      showMessage(validationError, 'error');
      return;
    }

    try {
      // 🎯 PROCESAR LA FIRMA AUTOMÁTICAMENTE (GRATIS)
      showMessage('Procesando firma para remover fondo...', 'success');
      
      // Importar dinámicamente el procesador
      const { SignatureProcessor } = await import('@/presentation/pages/configuration/utils/signatureProcessor');
      const processedFile = await SignatureProcessor.processSignature(file);
      
      showMessage('Subiendo firma procesada...', 'success');
      
      // Subir firma procesada
      uploadSignatureFileMutation.mutate(processedFile, {
        onSuccess: () => {
          showMessage('¡Firma actualizada con fondo transparente!', 'success');
        },
        onError: (error: any) => {
          showMessage(error.message || 'Error al subir la firma', 'error');
        }
      });

    } catch (error) {
      console.error('Error procesando la firma:', error);
      showMessage('Error al procesar. Subiendo imagen original...', 'error');
      
      // Si falla el procesamiento, subir la imagen original como fallback
      uploadSignatureFileMutation.mutate(file, {
        onSuccess: () => {
          showMessage('Firma actualizada (sin procesamiento)', 'success');
        },
        onError: (error: any) => {
          showMessage(error.message || 'Error al subir la firma', 'error');
        }
      });
    }
  };

  const handleSignatureFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleSignatureFileSelect(file);
    }
    // Resetear el input
    event.target.value = '';
  };

  const handleSignatureCanvasSave = (dataUrl: string) => {
    uploadSignatureMutation.mutate(dataUrl, {
      onSuccess: () => {
        showMessage('Firma creada correctamente', 'success');
        setShowSignatureCanvas(false);
      },
      onError: (error: any) => {
        showMessage(error.message || 'Error al crear la firma', 'error');
        setShowSignatureCanvas(false);
      }
    });
  };

  const handleDeleteSignature = () => {
    deleteSignatureMutation.mutate(undefined, {
      onSuccess: () => {
        showMessage('Firma eliminada correctamente', 'success');
      },
      onError: (error: any) => {
        showMessage(error.message || 'Error al eliminar la firma', 'error');
      }
    });
  };

  // Funciones para drag & drop (solo para foto de perfil)
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
    <div className="space-y-8">
      {/* Sección de Foto de Perfil */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <Camera className="w-5 h-5 mr-2 text-cyan-500" />
          Foto de Perfil
        </h3>

        <div className="flex items-start space-x-6">
          {/* Imagen con ícono de cámara clickeable */}
          <div className="relative cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 group-hover:border-cyan-300 transition-all duration-200">
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
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cyan-100 to-cyan-200 text-cyan-700 font-semibold text-lg">
                  {userData?.name?.[0]?.toUpperCase() || ''}{userData?.lastName?.[0]?.toUpperCase() || ''}
                </div>
              )}
            </div>

            {/* Ícono de cámara clickeable */}
            <div className="absolute bottom-0 right-0 bg-cyan-500 group-hover:bg-cyan-600 rounded-full p-2 border-2 border-white transition-all duration-200 shadow-lg">
              <Camera className="w-4 h-4 text-white" />
            </div>
          </div>

          {/* Contenido de texto */}
          <div className="flex-1 space-y-3">
            <div>
              <h4 className="text-base font-medium text-gray-900 mb-1">
                Cambiar foto de perfil
              </h4>
              <p className="text-sm text-gray-500 leading-relaxed">
                Haz clic en la imagen para subir una nueva foto. Nuestra aplicación detecta y centra automáticamente tu rostro para obtener la mejor foto de perfil.
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Tamaño máximo: 5MB • Formatos: JPG, PNG, WebP
              </p>
            </div>

            {/* Progreso de upload para foto de perfil */}
            {isLoadingProfileUpload && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subiendo imagen...</span>
                  <span>{profileUploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-cyan-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${profileUploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Botón para eliminar imagen si existe */}
            {userData?.img && !isLoadingProfileUpload && (
              <button
                onClick={handleDeleteImage}
                className="flex items-center px-3 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar foto
              </button>
            )}
          </div>
        </div>

        {/* Input file oculto para foto de perfil */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handlePhotoUpload}
          className="hidden"
          disabled={isLoadingProfileUpload}
        />
      </div>

      {/* Sección de Firma Digital */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <PenTool className="w-5 h-5 mr-2 text-cyan-500" />
          Firma Digital
        </h3>

        <div className="flex items-start space-x-6">
          {/* Área de firma */}
          <div className="w-48 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
            {userData?.signature ? (
              <img
                src={userData.signature}
                alt="Firma digital"
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <div className="text-center">
                <PenTool className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                <p className="text-xs text-gray-500">Sin firma</p>
              </div>
            )}
          </div>

          {/* Contenido de texto y controles */}
          <div className="flex-1 space-y-4">
            <div>
              <h4 className="text-base font-medium text-gray-900 mb-1">
                Administrar firma digital
              </h4>
              <p className="text-sm text-gray-500">
                Puedes crear una firma dibujándola directamente o subir una imagen existente.
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Tamaño máximo: 2MB • Formatos: JPG, PNG, WebP
              </p>
            </div>

            {/* Progreso de upload para firma */}
            {isLoadingSignatureUpload && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subiendo firma...</span>
                  <span>{signatureUploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-cyan-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${signatureUploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Botones de acción para firma */}
            {!isLoadingSignatureUpload && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setShowSignatureCanvas(true)}
                  className="flex items-center px-3 py-2 text-sm bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
                >
                  <PenTool className="w-4 h-4 mr-2" />
                  Crear Firma
                </button>

                <button
                  onClick={() => signatureFileInputRef.current?.click()}
                  className="flex items-center px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Subir Imagen
                </button>

                {userData?.signature && (
                  <button
                    onClick={handleDeleteSignature}
                    className="flex items-center px-3 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Eliminar
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Input file oculto para firma */}
        <input
          ref={signatureFileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleSignatureFileUpload}
          className="hidden"
          disabled={isLoadingSignatureUpload}
        />
      </div>

      {/* Modal de Canvas para crear firma */}
      {showSignatureCanvas && (
        <SignatureCanvas
          onSave={handleSignatureCanvasSave}
          onCancel={() => setShowSignatureCanvas(false)}
        />
      )}
    </div>
  );
};

export { PhotoTab };