// netlify/functions/budgets/budgets.ts
import type { HandlerEvent, Handler } from "@netlify/functions";

import {
  GetBudgetByPatient,
  SaveBudget,
  UpdateBudgetStatus,
  DeleteBudget,
  GetBudgetStats,
} from "./use-cases";

import {
  SaveBudgetDto,
  UpdateBudgetStatusDto,
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
  const userId = userData.id;

  // Extraer parámetros de la URL
  const pathParts = path.split('/');
  const budgetsIndex = pathParts.findIndex(part => part === 'budgets');
  
  try {
    // GET /budgets/stats - Obtener estadísticas de presupuestos
    if (httpMethod === "GET" && path.includes('/stats')) {
      return new GetBudgetStats()
        .execute(userId)
        .then((res) => res)
        .catch((error) => error);
    }

    // GET /budgets/patient/{patientId} - Obtener presupuesto de un paciente
    if (httpMethod === "GET" && path.includes('/patient/')) {
      const patientId = pathParts[budgetsIndex + 2] ? parseInt(pathParts[budgetsIndex + 2]) : null;
      
      if (!patientId || isNaN(patientId)) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "ID de paciente inválido",
          }),
          headers: HEADERS.json,
        };
      }

      return new GetBudgetByPatient()
        .execute(patientId, userId)
        .then((res) => res)
        .catch((error) => error);
    }

    // POST /budgets/patient/{patientId} - Guardar/actualizar presupuesto
    if (httpMethod === "POST" && path.includes('/patient/')) {
      const patientId = pathParts[budgetsIndex + 2] ? parseInt(pathParts[budgetsIndex + 2]) : null;
      
      if (!patientId || isNaN(patientId)) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "ID de paciente inválido",
          }),
          headers: HEADERS.json,
        };
      }

      // Agregar patientId al body para validación
      const budgetData = { ...body, patientId };
      
      const [error, saveBudgetDto] = SaveBudgetDto.create(budgetData);
      
      if (error) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: error,
          }),
          headers: HEADERS.json,
        };
      }

      return new SaveBudget()
        .execute(saveBudgetDto!, userId)
        .then((res) => res)
        .catch((error) => error);
    }

    // PUT /budgets/{budgetId}/status - Actualizar estado del presupuesto
    if (httpMethod === "PUT" && path.includes('/status')) {
      const budgetId = pathParts[budgetsIndex + 1] ? parseInt(pathParts[budgetsIndex + 1]) : null;
      
      if (!budgetId || isNaN(budgetId)) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "ID de presupuesto inválido",
          }),
          headers: HEADERS.json,
        };
      }

      const [error, updateStatusDto] = UpdateBudgetStatusDto.create(body);
      
      if (error) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: error,
          }),
          headers: HEADERS.json,
        };
      }

      return new UpdateBudgetStatus()
        .execute(budgetId, updateStatusDto!, userId)
        .then((res) => res)
        .catch((error) => error);
    }

    // DELETE /budgets/patient/{patientId} - Eliminar presupuesto
    if (httpMethod === "DELETE" && path.includes('/patient/')) {
      const patientId = pathParts[budgetsIndex + 2] ? parseInt(pathParts[budgetsIndex + 2]) : null;
      
      if (!patientId || isNaN(patientId)) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "ID de paciente inválido",
          }),
          headers: HEADERS.json,
        };
      }

      return new DeleteBudget()
        .execute(patientId, userId)
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