// netlify/functions/budgets/budgets.ts - ENDPOINTS ACTUALIZADOS
import type { HandlerEvent, Handler } from "@netlify/functions";

import {
  GetAllBudgetsByPatient,
  GetActiveBudgetByPatient,
  SaveBudget,
  ActivateBudget,
  CompleteBudget,
  RevertBudgetToDraft,
  DeleteBudget,
  GetBudgetStats,
} from "./use-cases";

import {
  SaveBudgetDto,
  ActivateBudgetDto,
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
    // ✅ GET /budgets/stats - Obtener estadísticas de presupuestos
    if (httpMethod === "GET" && path.includes('/stats')) {
      return new GetBudgetStats()
        .execute(userId)
        .then((res) => res)
        .catch((error) => error);
    }

    // ✅ GET /budgets/patient/{patientId} - Obtener TODOS los presupuestos de un paciente
    if (httpMethod === "GET" && path.includes('/patient/') && !path.includes('/active')) {
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

      return new GetAllBudgetsByPatient()
        .execute(patientId, userId)
        .then((res) => res)
        .catch((error) => error);
    }

    // ✅ GET /budgets/patient/{patientId}/active - Obtener presupuesto ACTIVO de un paciente
    if (httpMethod === "GET" && path.includes('/patient/') && path.includes('/active')) {
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

      return new GetActiveBudgetByPatient()
        .execute(patientId, userId)
        .then((res) => res)
        .catch((error) => error);
    }

    // ✅ POST /budgets/patient/{patientId} - Crear/actualizar presupuesto
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

    // ✅ PUT /budgets/{budgetId}/activate - Activar presupuesto
    if (httpMethod === "PUT" && path.includes('/activate')) {
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

      return new ActivateBudget()
        .execute(budgetId, userId)
        .then((res) => res)
        .catch((error) => error);
    }

    // ✅ PUT /budgets/{budgetId}/complete - Completar presupuesto
    if (httpMethod === "PUT" && path.includes('/complete')) {
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

      return new CompleteBudget()
        .execute(budgetId, userId)
        .then((res) => res)
        .catch((error) => error);
    }

    // ✅ PUT /budgets/{budgetId}/revert - Volver a borrador
    if (httpMethod === "PUT" && path.includes('/revert')) {
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

      return new RevertBudgetToDraft()
        .execute(budgetId, userId)
        .then((res) => res)
        .catch((error) => error);
    }

    // ✅ DELETE /budgets/{budgetId} - Eliminar presupuesto específico
    if (httpMethod === "DELETE" && !path.includes('/patient/')) {
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

      return new DeleteBudget()
        .execute(budgetId, userId)
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