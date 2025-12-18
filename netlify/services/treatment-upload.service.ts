// netlify/services/treatment-upload.service.ts
import { v2 as cloudinary } from 'cloudinary';
import { envs } from '../config/envs';

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: envs.CLOUDINARY_CLOUD_NAME,
  api_key: envs.CLOUDINARY_API_KEY,
  api_secret: envs.CLOUDINARY_API_SECRET,
});

export interface TreatmentUploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
}

export class TreatmentUploadService {
  /**
   * Sube una imagen de tratamiento a Cloudinary
   * @param base64Data - Datos de la imagen en base64
   * @param treatmentId - ID del tratamiento
   * @param imageType - Tipo de imagen ('before' | 'after')
   * @param folder - Carpeta en Cloudinary
   * @returns Promise con la información de la imagen subida
   */
  static async uploadTreatmentImage(
    base64Data: string,
    treatmentId: number,
    imageType: 'before' | 'after',
    folder = 'treatment-images'
  ): Promise<TreatmentUploadResult> {
    try {
      // Generar un public_id único para el tratamiento
      const publicId = `${folder}/treatment_${treatmentId}_${imageType}_${Date.now()}`;

      // ✅ Subir imagen con transformaciones inteligentes de Cloudinary
      // - auto_crop: Recorta automáticamente detectando la región importante
      // - g_auto: Gravity auto detecta el punto focal (caras, objetos importantes)
      const uploadResponse = await cloudinary.uploader.upload(
        `data:image/jpeg;base64,${base64Data}`,
        {
          public_id: publicId,
          folder: folder,
          // Transformación eager para generar thumbnail inmediatamente
          eager: [
            {
              width: 800,
              height: 600,
              crop: 'fill', // Rellena completamente el área
              gravity: 'auto', // Detección automática del punto focal
              quality: 'auto:good',
              format: 'jpg'
            },
            {
              width: 400,
              height: 300,
              crop: 'fill',
              gravity: 'auto', // Thumbnail con detección inteligente
              quality: 'auto:eco',
              format: 'jpg'
            }
          ],
          overwrite: true,
          invalidate: true,
        }
      );

      return {
        url: uploadResponse.secure_url,
        publicId: uploadResponse.public_id,
        width: uploadResponse.width,
        height: uploadResponse.height,
      };
    } catch (error) {
      console.error('Error uploading treatment image to Cloudinary:', error);
      throw new Error('Error al subir la imagen del tratamiento');
    }
  }

  /**
   * Elimina una imagen de Cloudinary
   * @param publicId - ID público de la imagen a eliminar
   * @returns Promise<boolean>
   */
  static async deleteTreatmentImage(publicId: string): Promise<boolean> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result.result === 'ok';
    } catch (error) {
      console.error('Error deleting treatment image from Cloudinary:', error);
      return false;
    }
  }

  /**
   * Extrae el public_id de una URL de Cloudinary
   * @param url - URL de Cloudinary
   * @returns string - Public ID o null si no es una URL válida
   */
  static extractPublicIdFromUrl(url: string): string | null {
    try {
      if (!url.includes('cloudinary.com')) return null;
      
      const urlParts = url.split('/');
      const versionIndex = urlParts.findIndex(part => part.startsWith('v'));
      
      if (versionIndex > -1 && versionIndex < urlParts.length - 1) {
        // Si hay versión, el public_id está después
        const pathAfterVersion = urlParts.slice(versionIndex + 1).join('/');
        return pathAfterVersion.split('.')[0]; // Remover extensión
      } else {
        // Si no hay versión, buscar después de la carpeta upload
        const uploadIndex = urlParts.findIndex(part => part === 'upload');
        if (uploadIndex > -1 && uploadIndex < urlParts.length - 1) {
          const pathAfterUpload = urlParts.slice(uploadIndex + 1).join('/');
          return pathAfterUpload.split('.')[0]; // Remover extensión
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error extracting public ID from URL:', error);
      return null;
    }
  }

  /**
   * Procesa una imagen base64 para upload
   * @param base64Image - Imagen en formato base64 (puede incluir el data: prefix)
   * @returns string - Solo la parte base64 sin el prefix
   */
  static processBase64Image(base64Image: string): string {
    if (base64Image.startsWith('data:image/')) {
      const base64Index = base64Image.indexOf(',');
      if (base64Index === -1) {
        throw new Error('Formato de imagen inválido');
      }
      return base64Image.substring(base64Index + 1);
    }
    return base64Image;
  }

  /**
   * Valida el tamaño y tipo de archivo
   * @param file - Archivo a validar
   * @returns string | null - Error message o null si es válido
   */
  static validateImageFile(file: File): string | null {
    // Validar tipo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return 'Solo se permiten archivos JPG, PNG y WebP';
    }

    // Validar tamaño (10MB máximo para tratamientos)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return 'El archivo debe ser menor a 10MB';
    }

    return null;
  }
}