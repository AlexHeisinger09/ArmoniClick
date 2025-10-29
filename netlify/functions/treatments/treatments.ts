// netlify/functions/treatments/treatments.ts - ACTUALIZADO PARA PRESUPUESTOS
import type { HandlerEvent, Handler } from "@netlify/functions";

import {
  GetTreatments,
  GetTreatmentById,
  CreateTreatment,
  UpdateTreatment,
  DeleteTreatment,
  GetBudgetsByPatient, // ✅ NUEVO
  GetTreatmentsByBudget, // ✅ NUEVO
  CompleteTreatment, // ✅ NUEVO
  GetPopularTreatments, // ✅ NUEVO
} from "./use-cases";

import {
  CreateTreatmentDto,
  UpdateTreatmentDto,
} from "./dtos";

import { fromBodyToObject, HEADERS } from "../../config/utils";
import { validateJWT } from "../../middlewares";

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
  const doctorId = userData.id;

  // Extraer parámetros de la URL
  const pathParts = path.split('/');
  
  // Buscar el índice de 'treatments' en la URL
  const treatmentsIndex = pathParts.findIndex(part => part === 'treatments');
  
  // Obtener patientId, treatmentId y budgetId de la URL
  let patientId: number | null = null;
  let treatmentId: number | null = null;
  let budgetId: number | null = null;
  
  // Casos posibles:
  // /treatments/patient/{patientId} -> Obtener tratamientos de un paciente
  // /treatments/patient/{patientId}/budgets -> Obtener presupuestos de un paciente
  // /treatments/budget/{budgetId} -> Obtener tratamientos de un presupuesto específico
  // /treatments/{treatmentId} -> Obtener, actualizar o eliminar un tratamiento específico
  // /treatments/{treatmentId}/complete -> Completar un tratamiento
  
  if (pathParts[treatmentsIndex + 1] === 'patient') {
    // URL: /treatments/patient/{patientId} o /treatments/patient/{patientId}/budgets
    patientId = pathParts[treatmentsIndex + 2] ? parseInt(pathParts[treatmentsIndex + 2]) : null;
  } else if (pathParts[treatmentsIndex + 1] === 'budget') {
    // URL: /treatments/budget/{budgetId}
    budgetId = pathParts[treatmentsIndex + 2] ? parseInt(pathParts[treatmentsIndex + 2]) : null;
  } else {
    // URL: /treatments/{treatmentId} o /treatments/{treatmentId}/complete
    treatmentId = pathParts[treatmentsIndex + 1] ? parseInt(pathParts[treatmentsIndex + 1]) : null;
  }

  try {
    // ✅ GET /treatments/popular - Obtener tratamientos populares
    if (httpMethod === "GET" && path.includes('/popular')) {
      return new GetPopularTreatments()
        .execute(doctorId)
        .then((res) => res)
        .catch((error) => error);
    }

    // ✅ GET /treatments/patient/{patientId}/budgets - Obtener presupuestos de un paciente
    if (httpMethod === "GET" && patientId && pathParts.includes('budgets')) {
      if (isNaN(patientId)) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "ID de paciente inválido",
          }),
          headers: HEADERS.json,
        };
      }

      return new GetBudgetsByPatient()
        .execute(patientId, doctorId)
        .then((res) => res)
        .catch((error) => error);
    }

    // ✅ GET /treatments/budget/{budgetId} - Obtener tratamientos de un presupuesto
    if (httpMethod === "GET" && budgetId) {
      if (isNaN(budgetId)) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "ID de presupuesto inválido",
          }),
          headers: HEADERS.json,
        };
      }

      return new GetTreatmentsByBudget()
        .execute(budgetId, doctorId)
        .then((res) => res)
        .catch((error) => error);
    }

    // GET /treatments/patient/{patientId} - Obtener todos los tratamientos de un paciente
    if (httpMethod === "GET" && patientId && !pathParts.includes('budgets')) {
      if (isNaN(patientId)) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "ID de paciente inválido",
          }),
          headers: HEADERS.json,
        };
      }

      return new GetTreatments()
        .execute(patientId, doctorId)
        .then((res) => res)
        .catch((error) => error);
    }

    // ✅ PUT /treatments/{treatmentId}/complete - Completar un tratamiento
    if (httpMethod === "PUT" && treatmentId && pathParts.includes('complete')) {
      if (isNaN(treatmentId)) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "ID de tratamiento inválido",
          }),
          headers: HEADERS.json,
        };
      }

      return new CompleteTreatment()
        .execute(treatmentId, doctorId)
        .then((res) => res)
        .catch((error) => error);
    }

    // GET /treatments/{treatmentId} - Obtener un tratamiento específico
    if (httpMethod === "GET" && treatmentId && !pathParts.includes('complete')) {
      if (isNaN(treatmentId)) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "ID de tratamiento inválido",
          }),
          headers: HEADERS.json,
        };
      }

      return new GetTreatmentById()
        .execute(treatmentId, doctorId)
        .then((res) => res)
        .catch((error) => error);
    }

    // POST /treatments/patient/{patientId} - Crear nuevo tratamiento para un paciente
    if (httpMethod === "POST" && patientId) {
      if (isNaN(patientId)) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "ID de paciente inválido",
          }),
          headers: HEADERS.json,
        };
      }

      // Agregar el patientId al body
      const treatmentData = { ...body, id_paciente: patientId };
      
      const [error, createTreatmentDto] = CreateTreatmentDto.create(treatmentData);
      
      if (error) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: error,
          }),
          headers: HEADERS.json,
        };
      }

      return new CreateTreatment()
        .execute(createTreatmentDto!, doctorId)
        .then((res) => res)
        .catch((error) => error);
    }

    // PUT /treatments/{treatmentId} - Actualizar tratamiento
    if (httpMethod === "PUT" && treatmentId && !pathParts.includes('complete')) {
      if (isNaN(treatmentId)) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "ID de tratamiento inválido",
          }),
          headers: HEADERS.json,
        };
      }

      const [error, updateTreatmentDto] = UpdateTreatmentDto.create(body);
      
      if (error) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: error,
          }),
          headers: HEADERS.json,
        };
      }

      return new UpdateTreatment()
        .execute(treatmentId, updateTreatmentDto!, doctorId)
        .then((res) => res)
        .catch((error) => error);
    }

    // DELETE /treatments/{treatmentId} - Eliminar tratamiento
    if (httpMethod === "DELETE" && treatmentId) {
      if (isNaN(treatmentId)) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "ID de tratamiento inválido",
          }),
          headers: HEADERS.json,
        };
      }

      return new DeleteTreatment()
        .execute(treatmentId, doctorId)
        .then((res) => res)
        .catch((error) => error);
    }

    // Método no permitido
    return {
      statusCode: 405,
      body: JSON.stringify({
        message: "Method Not Allowed",
      }),
      headers: HEADERS.json,
    };

  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error interno del servidor",
        error: error.message,
      }),
      headers: HEADERS.json,
    };
  }
};

export { handler };