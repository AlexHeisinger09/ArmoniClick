// netlify/functions/ai-analysis/ai-analysis.ts
import type { HandlerEvent, Handler } from "@netlify/functions";

import {
  GeneratePatientSummary,
  AskPatientQuestion,
} from "./use-cases";

import { fromBodyToObject, HEADERS } from "../../config/utils";
import { validateJWT } from "../../middlewares";
import { db } from "../../data/db";
import { setTenantContext } from "../../config/tenant-context";

const handler: Handler = async (event: HandlerEvent) => {
  const { httpMethod, path } = event;
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
  const doctorId = userData.id;

  // ✅ NUEVO: Setear contexto de tenant para Row-Level Security
  await setTenantContext(db, doctorId);

  // Extraer patientId de la URL
  const pathParts = path.split('/');
  const aiAnalysisIndex = pathParts.findIndex(part => part === 'ai-analysis');
  const patientId = pathParts[aiAnalysisIndex + 1] ? parseInt(pathParts[aiAnalysisIndex + 1]) : null;

  // Extraer acción (summary o question)
  const action = pathParts[aiAnalysisIndex + 2]; // Ejemplo: /ai-analysis/123/summary

  try {
    // POST /ai-analysis/:patientId/summary - Generar resumen clínico
    if (httpMethod === "POST" && patientId && action === "summary") {
      if (isNaN(patientId)) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: "ID de paciente inválido" }),
          headers: HEADERS.json,
        };
      }

      return new GeneratePatientSummary()
        .execute(patientId, doctorId)
        .then((res) => res)
        .catch((error) => {
          console.error("Error en GeneratePatientSummary:", error);
          return {
            statusCode: 500,
            body: JSON.stringify({ message: "Error interno del servidor" }),
            headers: HEADERS.json,
          };
        });
    }

    // POST /ai-analysis/:patientId/question - Hacer pregunta sobre el paciente
    if (httpMethod === "POST" && patientId && action === "question") {
      if (isNaN(patientId)) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: "ID de paciente inválido" }),
          headers: HEADERS.json,
        };
      }

      const { question } = body;
      if (!question) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: "La pregunta es requerida" }),
          headers: HEADERS.json,
        };
      }

      return new AskPatientQuestion()
        .execute(patientId, doctorId, question)
        .then((res) => res)
        .catch((error) => {
          console.error("Error en AskPatientQuestion:", error);
          return {
            statusCode: 500,
            body: JSON.stringify({ message: "Error interno del servidor" }),
            headers: HEADERS.json,
          };
        });
    }

    // Ruta no encontrada
    return {
      statusCode: 404,
      body: JSON.stringify({
        message: "Ruta no encontrada. Use /ai-analysis/:patientId/summary o /ai-analysis/:patientId/question"
      }),
      headers: HEADERS.json,
    };

  } catch (error) {
    console.error("Error general en ai-analysis handler:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error interno del servidor",
        error: error instanceof Error ? error.message : "Error desconocido"
      }),
      headers: HEADERS.json,
    };
  }
};

export { handler };
