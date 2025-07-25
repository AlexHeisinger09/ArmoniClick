// netlify/functions/upload/upload.ts
import type { HandlerEvent, Handler } from "@netlify/functions";
import { validateJWT } from "../../middlewares";
import { HEADERS, fromBodyToObject } from "../../config/utils";
import { UploadService } from "../../services/upload.service";
import { UserService } from "../../services";
import { usersTable } from "../../data/schemas/user.schema";

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
      const { image, imageType } = body;

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

      // Validar formato de imagen base64
      let base64Data: string;
      if (image.startsWith('data:image/')) {
        // Extraer solo la parte base64 (después de la coma)
        const base64Index = image.indexOf(',');
        if (base64Index === -1) {
          return {
            statusCode: 400,
            body: JSON.stringify({
              message: "Formato de imagen inválido",
            }),
            headers: HEADERS.json,
          };
        }
        base64Data = image.substring(base64Index + 1);
      } else {
        base64Data = image;
      }

      // Validar tamaño (aproximadamente)
      const sizeInBytes = (base64Data.length * 3) / 4;
      const maxSizeInBytes = 5 * 1024 * 1024; // 5MB

      if (sizeInBytes > maxSizeInBytes) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "La imagen es demasiado grande. Máximo 5MB permitido.",
          }),
          headers: HEADERS.json,
        };
      }

      // Subir imagen a Cloudinary
      const uploadResult = await UploadService.uploadProfileImage(
        base64Data,
        userId,
        'profile-pictures'
      );

      // Actualizar la URL de la imagen en la base de datos
      const userService = new UserService();
      
      // Si el usuario ya tenía una imagen, eliminarla de Cloudinary
      if (userData.img && userData.img.includes('cloudinary.com')) {
        try {
          // Extraer public_id de la URL de Cloudinary
          const urlParts = userData.img.split('/');
          const filename = urlParts[urlParts.length - 1];
          const publicId = `profile-pictures/${filename.split('.')[0]}`;
          await UploadService.deleteImage(publicId);
        } catch (error) {
          console.warn('No se pudo eliminar la imagen anterior:', error);
        }
      }

      await userService.update(
        { 
          img: uploadResult.url,
          updatedAt: new Date(),
        },
        usersTable.id,
        userId
      );

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Imagen de perfil actualizada correctamente",
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
      console.error('Error uploading profile image:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: error.message || "Error interno del servidor al subir la imagen",
        }),
        headers: HEADERS.json,
      };
    }
  }

  // DELETE: Eliminar imagen de perfil
  if (httpMethod === "DELETE") {
    try {
      const userService = new UserService();

      // Si el usuario tiene una imagen, eliminarla de Cloudinary
      if (userData.img && userData.img.includes('cloudinary.com')) {
        try {
          // Extraer public_id de la URL de Cloudinary
          const urlParts = userData.img.split('/');
          const filename = urlParts[urlParts.length - 1];
          const publicId = `profile-pictures/${filename.split('.')[0]}`;
          await UploadService.deleteImage(publicId);
        } catch (error) {
          console.warn('No se pudo eliminar la imagen de Cloudinary:', error);
        }
      }

      // Eliminar la URL de la imagen en la base de datos
      await userService.update(
        { 
          img: null,
          updatedAt: new Date(),
        },
        usersTable.id,
        userId
      );

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Imagen de perfil eliminada correctamente",
        }),
        headers: HEADERS.json,
      };

    } catch (error: any) {
      console.error('Error deleting profile image:', error);
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