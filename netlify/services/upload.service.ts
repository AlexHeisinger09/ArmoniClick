// netlify/services/upload.service.ts
import { v2 as cloudinary } from 'cloudinary';
import { envs } from '../config/envs';

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: envs.CLOUDINARY_CLOUD_NAME,
  api_key: envs.CLOUDINARY_API_KEY,
  api_secret: envs.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
}

export class UploadService {
  /**
   * Sube una imagen a Cloudinary desde un buffer base64
   * @param base64Data - Datos de la imagen en base64
   * @param folder - Carpeta en Cloudinary donde guardar la imagen
   * @param publicId - ID público personalizado (opcional)
   * @returns Promise con la información de la imagen subida
   */
  static async uploadProfileImage(
    base64Data: string,
    userId: number,
    folder = 'profile-pictures'
  ): Promise<UploadResult> {
    try {
      // Generar un public_id único para el usuario
      const publicId = `${folder}/user_${userId}_${Date.now()}`;

      const uploadResponse = await cloudinary.uploader.upload(
        `data:image/jpeg;base64,${base64Data}`,
        {
          public_id: publicId,
          folder: folder,
          transformation: [
            {
              width: 400,
              height: 400,
              crop: 'fill',
              gravity: 'face',
              quality: 'auto',
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
      console.error('Error uploading to Cloudinary:', error);
      throw new Error('Error al subir la imagen');
    }
  }

  /**
   * ✅ VERSIÓN SIMPLE: Para plan gratuito de Cloudinary
   * @param base64Data - Datos de la firma en base64
   * @param userId - ID del usuario
   * @param folder - Carpeta en Cloudinary donde guardar la firma
   * @returns Promise con la información de la firma subida
   */
  static async uploadSignature(
    base64Data: string,
    userId: number,
    folder = 'signatures'
  ): Promise<UploadResult> {
    try {
      // Generar un public_id único para la firma del usuario
      const publicId = `${folder}/user_${userId}_signature_${Date.now()}`;

      const uploadResponse = await cloudinary.uploader.upload(
        `data:image/png;base64,${base64Data}`,
        {
          public_id: publicId,
          folder: folder,
          transformation: [
            {
              // Solo transformaciones básicas disponibles en plan gratuito
              width: 300,
              height: 150,
              crop: 'fit',
              quality: 'auto',
              format: 'png'
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
      console.error('Error uploading signature to Cloudinary:', error);
      throw new Error('Error al subir la firma');
    }
  }

  /**
   * Sube un logo a Cloudinary desde base64
   * @param base64Data - Datos del logo en base64
   * @param userId - ID del usuario
   * @param folder - Carpeta en Cloudinary donde guardar el logo
   * @returns Promise con la información del logo subido
   */
  static async uploadLogo(
    base64Data: string,
    userId: number,
    folder = 'logos'
  ): Promise<UploadResult> {
    try {
      // Generar un public_id único para el logo del usuario
      const publicId = `${folder}/user_${userId}_logo_${Date.now()}`;

      const uploadResponse = await cloudinary.uploader.upload(
        `data:image/png;base64,${base64Data}`,
        {
          public_id: publicId,
          folder: folder,
          transformation: [
            {
              width: 500,
              height: 500,
              crop: 'fit',
              quality: 'auto',
              format: 'png'
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
      console.error('Error uploading logo to Cloudinary:', error);
      throw new Error('Error al subir el logo');
    }
  }

  /**
   * Elimina una imagen de Cloudinary
   * @param publicId - ID público de la imagen a eliminar
   * @returns Promise<boolean>
   */
  static async deleteImage(publicId: string): Promise<boolean> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result.result === 'ok';
    } catch (error) {
      console.error('Error deleting from Cloudinary:', error);
      return false;
    }
  }

  /**
   * Obtiene información de una imagen
   * @param publicId - ID público de la imagen
   * @returns Promise con información de la imagen
   */
  static async getImageInfo(publicId: string) {
    try {
      const result = await cloudinary.api.resource(publicId);
      return result;
    } catch (error) {
      console.error('Error getting image info:', error);
      return null;
    }
  }

  /**
   * Sube un PDF a Cloudinary
   * @param pdfBuffer - Buffer del PDF
   * @param fileName - Nombre del archivo
   * @param folder - Carpeta en Cloudinary donde guardar el PDF
   * @returns Promise con la información del PDF subido
   */
  static async uploadPDF(
    pdfBuffer: Buffer,
    fileName: string,
    folder = 'prescriptions'
  ): Promise<UploadResult> {
    try {
      const publicId = `${folder}/${fileName}_${Date.now()}`;

      // Convertir buffer a base64
      const base64Data = pdfBuffer.toString('base64');

      const uploadResponse = await cloudinary.uploader.upload(
        `data:application/pdf;base64,${base64Data}`,
        {
          public_id: publicId,
          folder: folder,
          resource_type: 'raw', // Para archivos no-imagen
          overwrite: true,
          invalidate: true,
        }
      );

      return {
        url: uploadResponse.secure_url,
        publicId: uploadResponse.public_id,
        width: 0,
        height: 0,
      };
    } catch (error) {
      console.error('Error uploading PDF to Cloudinary:', error);
      throw new Error('Error al subir el PDF');
    }
  }
}