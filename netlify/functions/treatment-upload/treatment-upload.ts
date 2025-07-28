// netlify/functions/treatment-upload/treatment-upload.ts
import type { HandlerEvent, Handler } from "@netlify/functions";
import { validateJWT } from "../../middlewares";
import { HEADERS, fromBodyToObject } from "../../config/utils";
import { TreatmentUploadService } from "../../services/treatment-upload.service";

const handler: Handler = async (event: HandlerEvent) => {
  const { httpMethod } = event;
  const body = event.body ? fromBodyToObject(event.body) : {};

  // Manejar preflight CORS
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: HEADERS.json,
    };
  }

  // Validar autenticación
  const user = await validateJWT(event.headers.authorization!);
  if (user.statusCode !== 200) return user;

  const userData = JSON.parse(user.body);
  const userId = userData.id;

  if (httpMethod === "POST") {
    try {
      const { image, treatmentId, imageType } = body;

      // Validaciones
      if (!image) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "No se proporcionó ninguna imagen",
          }),
          headers: HEADERS.json,
        };
      }

      if (!treatmentId) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "ID del tratamiento es requerido",
          }),
          headers: HEADERS.json,
        };
      }

      if (!imageType || !['before', 'after'].includes(imageType)) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "Tipo de imagen inválido. Debe ser 'before' o 'after'",
          }),
          headers: HEADERS.json,
        };
      }

      // Procesar imagen base64
      let base64Data: string;
      try {
        base64Data = TreatmentUploadService.processBase64Image(image);
      } catch (error: any) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: error.message,
          }),
          headers: HEADERS.json,
        };
      }

      // Validar tamaño aproximado (base64 es ~33% más grande que el archivo original)
      const sizeInBytes = (base64Data.length * 3) / 4;
      const maxSizeInBytes = 10 * 1024 * 1024; // 10MB

      if (sizeInBytes > maxSizeInBytes) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "La imagen es demasiado grande. Máximo 10MB permitido.",
          }),
          headers: HEADERS.json,
        };
      }

      // Subir imagen a Cloudinary
      const uploadResult = await TreatmentUploadService.uploadTreatmentImage(
        base64Data,
        parseInt(treatmentId),
        imageType as 'before' | 'after',
        'treatment-images'
      );

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Imagen de tratamiento subida correctamente",
          imageUrl: uploadResult.url,
          imageInfo: {
            width: uploadResult.width,
            height: uploadResult.height,
            publicId: uploadResult.publicId,
          }
        }),
        headers: HEADERS.json,
      };

    } catch (error: any) {
      console.error('Error uploading treatment image:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: error.message || "Error interno del servidor al subir la imagen",
        }),
        headers: HEADERS.json,
      };
    }
  }

  // DELETE: Eliminar imagen de tratamiento
  if (httpMethod === "DELETE") {
    try {
      const { imageUrl } = body;

      if (!imageUrl) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "URL de la imagen es requerida",
          }),
          headers: HEADERS.json,
        };
      }

      // Extraer public_id de la URL de Cloudinary
      const publicId = TreatmentUploadService.extractPublicIdFromUrl(imageUrl);
      
      if (publicId) {
        await TreatmentUploadService.deleteTreatmentImage(publicId);
      }

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Imagen de tratamiento eliminada correctamente",
        }),
        headers: HEADERS.json,
      };

    } catch (error: any) {
      console.error('Error deleting treatment image:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: error.message || "Error interno del servidor al eliminar la imagen",
        }),
        headers: HEADERS.json,
      };
    }
  }

  return {
    statusCode: 405,
    body: JSON.stringify({
      message: "Method Not Allowed",
    }),
    headers: HEADERS.json,
  };
};

export { handler };