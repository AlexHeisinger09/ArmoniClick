// netlify/functions/upload-logo/upload-logo.ts
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

  // POST: Subir logo del doctor
  if (httpMethod === "POST") {
    try {
      const { logo, logoType } = body;

      // Validaciones
      if (!logo) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "No se proporcionó ningún logo",
          }),
          headers: HEADERS.json,
        };
      }

      // Validar formato de imagen base64
      let base64Data: string;
      if (logo.startsWith('data:image/')) {
        // Extraer solo la parte base64 (después de la coma)
        const base64Index = logo.indexOf(',');
        if (base64Index === -1) {
          return {
            statusCode: 400,
            body: JSON.stringify({
              message: "Formato de logo inválido",
            }),
            headers: HEADERS.json,
          };
        }
        base64Data = logo.substring(base64Index + 1);
      } else {
        base64Data = logo;
      }

      // Validar tamaño (aproximadamente)
      const sizeInBytes = (base64Data.length * 3) / 4;
      const maxSizeInBytes = 5 * 1024 * 1024; // 5MB para logos

      if (sizeInBytes > maxSizeInBytes) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "El logo es demasiado grande. Máximo 5MB permitido.",
          }),
          headers: HEADERS.json,
        };
      }

      // Subir logo a Cloudinary
      const uploadResult = await UploadService.uploadLogo(
        base64Data,
        userId,
        'logos'
      );

      // Actualizar la URL del logo en la base de datos
      const userService = new UserService();

      // Si el usuario ya tenía un logo, eliminarla de Cloudinary
      if (userData.logo && userData.logo.includes('cloudinary.com')) {
        try {
          // Extraer public_id de la URL de Cloudinary
          const urlParts = userData.logo.split('/');
          const filename = urlParts[urlParts.length - 1];
          const publicId = `logos/${filename.split('.')[0]}`;
          await UploadService.deleteImage(publicId);
        } catch (error) {
          console.warn('No se pudo eliminar el logo anterior:', error);
        }
      }

      await userService.update(
        {
          logo: uploadResult.url,
          updatedAt: new Date(),
        },
        usersTable.id,
        userId
      );

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Logo actualizado correctamente",
          logoUrl: uploadResult.url,
          logoInfo: {
            width: uploadResult.width,
            height: uploadResult.height,
            publicId: uploadResult.publicId,
          }
        }),
        headers: HEADERS.json,
      };

    } catch (error: any) {
      console.error('Error uploading logo:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: error.message || "Error interno del servidor al subir el logo",
        }),
        headers: HEADERS.json,
      };
    }
  }

  // DELETE: Eliminar logo
  if (httpMethod === "DELETE") {
    try {
      const userService = new UserService();

      // Si el usuario tiene un logo, eliminarlo de Cloudinary
      if (userData.logo && userData.logo.includes('cloudinary.com')) {
        try {
          // Extraer public_id de la URL de Cloudinary
          const urlParts = userData.logo.split('/');
          const filename = urlParts[urlParts.length - 1];
          const publicId = `logos/${filename.split('.')[0]}`;
          await UploadService.deleteImage(publicId);
        } catch (error) {
          console.warn('No se pudo eliminar el logo de Cloudinary:', error);
        }
      }

      // Eliminar la URL del logo en la base de datos
      await userService.update(
        {
          logo: null,
          updatedAt: new Date(),
        },
        usersTable.id,
        userId
      );

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Logo eliminado correctamente",
        }),
        headers: HEADERS.json,
      };

    } catch (error: any) {
      console.error('Error deleting logo:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: error.message || "Error interno del servidor al eliminar el logo",
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
