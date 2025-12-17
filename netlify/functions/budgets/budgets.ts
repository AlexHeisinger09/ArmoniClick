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
  AddBudgetItem,
  DeleteBudgetItem,
  CompleteBudgetItem,
  GetBudgetStats,
  GetRevenueByTreatments,
  GetPendingRevenue,
} from "./use-cases";

import {
  SaveBudgetDto,
  ActivateBudgetDto,
} from "./dtos";

import { fromBodyToObject, HEADERS } from "../../config/utils";
import { validateJWT } from "../../middlewares";
import { db } from "../../data/db";
import { setTenantContext } from "../../config/tenant-context";

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

  // ✅ NUEVO: Setear contexto de tenant para Row-Level Security
  await setTenantContext(db, userId);

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

    // ✅ GET /budgets/revenue-treatments - Obtener ingresos por treatments completados
    if (httpMethod === "GET" && path.includes('/revenue-treatments')) {
      return new GetRevenueByTreatments()
        .execute(userId)
        .then((res) => res)
        .catch((error) => error);
    }

    // ✅ GET /budgets/pending-revenue - Obtener dinero pendiente (treatments no completados)
    if (httpMethod === "GET" && path.includes('/pending-revenue')) {
      return new GetPendingRevenue()
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

    // ✅ PUT /budgets/{budgetId}/complete - Completar presupuesto (no items)
    if (httpMethod === "PUT" && path.includes('/complete') && !path.includes('/items/')) {
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

    // ✅ POST /budgets/{budgetId}/items - Agregar item a presupuesto existente
    if (httpMethod === "POST" && path.includes('/items') && !path.includes('/complete')) {
      const budgetId = pathParts[budgetsIndex + 1] ? parseInt(pathParts[budgetsIndex + 1]) : null;

      if (!budgetId || isNaN(budgetId)) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: "ID de presupuesto inválido" }),
          headers: HEADERS.json,
        };
      }

      const { pieza, accion, valor } = body;

      if (!accion || !valor || valor <= 0) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: "Datos inválidos: accion y valor son requeridos" }),
          headers: HEADERS.json,
        };
      }

      return new AddBudgetItem()
        .execute(budgetId, userId, { pieza, accion, valor: parseFloat(valor) })
        .then((res) => res)
        .catch((error) => error);
    }

    // ✅ PUT /budgets/items/{budgetItemId}/complete - Completar item específico
    if (httpMethod === "PUT" && path.includes('/items/') && path.includes('/complete')) {
      const itemsIndex = pathParts.findIndex(part => part === 'items');
      const budgetItemId = pathParts[itemsIndex + 1] ? parseInt(pathParts[itemsIndex + 1]) : null;

      console.log('🔍 Complete budget item:', { path, pathParts, itemsIndex, budgetItemId });

      if (!budgetItemId || isNaN(budgetItemId)) {
        console.error('❌ ID inválido:', { budgetItemId, pathParts });
        return {
          statusCode: 400,
          body: JSON.stringify({ message: "ID inválido", debug: { pathParts, itemsIndex } }),
          headers: HEADERS.json,
        };
      }

      return new CompleteBudgetItem()
        .execute(budgetItemId, userId)
        .then((res) => res)
        .catch((error) => error);
    }

    // ✅ DELETE /budgets/items/{budgetItemId} - Eliminar item específico del presupuesto
    if (httpMethod === "DELETE" && path.includes('/items/')) {
      const itemsIndex = pathParts.findIndex(part => part === 'items');
      const budgetItemId = pathParts[itemsIndex + 1] ? parseInt(pathParts[itemsIndex + 1]) : null;

      if (!budgetItemId || isNaN(budgetItemId)) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "ID de item del presupuesto inválido",
          }),
          headers: HEADERS.json,
        };
      }

      return new DeleteBudgetItem()
        .execute(budgetItemId, userId)
        .then((res) => res)
        .catch((error) => error);
    }

    // ✅ DELETE /budgets/{budgetId} - Eliminar presupuesto específico
    if (httpMethod === "DELETE" && !path.includes('/patient/') && !path.includes('/items/')) {
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