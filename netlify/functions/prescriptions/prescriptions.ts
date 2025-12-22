// netlify/functions/prescriptions/prescriptions.ts
import type { HandlerEvent, Handler } from "@netlify/functions";

import {
  GetPrescriptionsByPatient,
  SavePrescription,
  DeletePrescription,
} from "./use-cases";

import { SavePrescriptionDto } from "./dtos";

import { fromBodyToObject, HEADERS } from "../../config/utils";
import { validateJWT } from "../../middlewares";
import { db } from "../../data/db";
import { setTenantContext } from "../../config/tenant-context";
import { patientsTable, usersTable, prescriptionsTable } from "../../data/schemas";
import { eq, and } from "drizzle-orm";
import { v2 as cloudinary } from 'cloudinary';

const handler: Handler = async (event: HandlerEvent) => {
  const { httpMethod, path, queryStringParameters } = event;
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

  // Setear contexto de tenant para Row-Level Security
  await setTenantContext(db, userId);

  // Extraer parámetros de la URL
  const pathParts = path.split('/');
  const prescriptionsIndex = pathParts.findIndex(part => part === 'prescriptions');

  // Debug logging
  console.log('🔍 Prescription endpoint called:');
  console.log('   Method:', httpMethod);
  console.log('   Path:', path);
  console.log('   Path parts:', pathParts);

  try {
    // GET /prescriptions/patient/{patientId} - Obtener todas las recetas de un paciente
    if (httpMethod === "GET" && path.includes('/patient/')) {
      const patientId = pathParts[prescriptionsIndex + 2] ? parseInt(pathParts[prescriptionsIndex + 2]) : null;

      if (!patientId || isNaN(patientId)) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "ID de paciente inválido",
          }),
          headers: HEADERS.json,
        };
      }

      return new GetPrescriptionsByPatient()
        .execute(patientId, userId)
        .then((res) => res)
        .catch((error) => error);
    }

    // POST /prescriptions/generate-pdf/{prescriptionId} - Generar PDF
    // IMPORTANTE: Este bloque debe ir ANTES del bloque genérico de POST
    if (httpMethod === "POST" && path.includes('/generate-pdf')) {
      // Buscar el índice de 'generate-pdf' en el path
      const generatePdfIndex = pathParts.findIndex(part => part === 'generate-pdf');
      const prescriptionId = pathParts[generatePdfIndex + 1] ? parseInt(pathParts[generatePdfIndex + 1]) : null;

      if (!prescriptionId || isNaN(prescriptionId)) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "ID de receta inválido",
          }),
          headers: HEADERS.json,
        };
      }

      try {
        // El PDF viene como base64 en el body
        const { pdfBase64 } = body;

        if (!pdfBase64) {
          return {
            statusCode: 400,
            body: JSON.stringify({
              message: "PDF base64 es requerido",
            }),
            headers: HEADERS.json,
          };
        }

        // Extraer solo la parte base64 (después de la coma si existe)
        let base64Data: string;
        if (pdfBase64.includes(',')) {
          base64Data = pdfBase64.split(',')[1];
        } else {
          base64Data = pdfBase64;
        }

        // Convertir base64 a buffer
        const pdfBuffer = Buffer.from(base64Data, 'base64');

        // Importar UploadService
        const { UploadService } = await import('../../services/upload.service');

        // Subir a Cloudinary usando el servicio existente
        const uploadResult = await UploadService.uploadPDF(
          pdfBuffer,
          `receta_${prescriptionId}`,
          'prescriptions'
        );

        return {
          statusCode: 200,
          body: JSON.stringify({
            message: "PDF subido exitosamente",
            pdfUrl: uploadResult.url,
          }),
          headers: HEADERS.json,
        };
      } catch (error: any) {
        console.error('Error uploading PDF to Cloudinary:', error);
        return {
          statusCode: 500,
          body: JSON.stringify({
            message: error.message || "Error al subir PDF",
          }),
          headers: HEADERS.json,
        };
      }
    }

    // POST /prescriptions - Crear nueva receta
    if (httpMethod === "POST") {
      const [error, savePrescriptionDto] = SavePrescriptionDto.create(body);

      if (error || !savePrescriptionDto) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: error || "Datos inválidos",
          }),
          headers: HEADERS.json,
        };
      }

      return new SavePrescription()
        .execute(savePrescriptionDto, userId)
        .then((res) => res)
        .catch((error) => error);
    }

    // DELETE /prescriptions/{prescriptionId} - Eliminar receta
    if (httpMethod === "DELETE") {
      const prescriptionId = pathParts[prescriptionsIndex + 1] ? parseInt(pathParts[prescriptionsIndex + 1]) : null;

      if (!prescriptionId || isNaN(prescriptionId)) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "ID de receta inválido",
          }),
          headers: HEADERS.json,
        };
      }

      return new DeletePrescription()
        .execute(prescriptionId, userId)
        .then((res) => res)
        .catch((error) => error);
    }

    return {
      statusCode: 405,
      body: JSON.stringify({
        message: "Método no permitido",
      }),
      headers: HEADERS.json,
    };

  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: error.message || "Error interno del servidor",
      }),
      headers: HEADERS.json,
    };
  }
};

export { handler };
