// netlify/functions/patients/patients.ts
import type { HandlerEvent, Handler } from "@netlify/functions";

import {
  GetPatients,
  GetPatientById,
  CreatePatient,
  UpdatePatient,
  DeletePatient,
} from "./use-cases";

import {
  CreatePatientDto,
  UpdatePatientDto,
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

  // Extraer ID del paciente de la URL si existe
  const pathParts = path.split('/');
  const patientIdIndex = pathParts.findIndex(part => part === 'patients') + 1;
  const patientId = pathParts[patientIdIndex] ? parseInt(pathParts[patientIdIndex]) : null;

  try {
    // GET /patients - Obtener todos los pacientes (con búsqueda opcional)
    if (httpMethod === "GET" && !patientId) {
      const searchTerm = queryStringParameters?.search || '';
      
      return new GetPatients()
        .execute(doctorId, searchTerm)
        .then((res) => res)
        .catch((error) => error);
    }

    // GET /patients/:id - Obtener un paciente específico
    if (httpMethod === "GET" && patientId) {
      if (isNaN(patientId)) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "ID de paciente inválido",
          }),
          headers: HEADERS.json,
        };
      }

      return new GetPatientById()
        .execute(patientId, doctorId)
        .then((res) => res)
        .catch((error) => error);
    }

    // POST /patients - Crear nuevo paciente
    if (httpMethod === "POST" && !patientId) {
      const [error, createPatientDto] = CreatePatientDto.create(body);
      
      if (error) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: error,
          }),
          headers: HEADERS.json,
        };
      }

      return new CreatePatient()
        .execute(createPatientDto!, doctorId)
        .then((res) => res)
        .catch((error) => error);
    }

    // PUT /patients/:id - Actualizar paciente
    if (httpMethod === "PUT" && patientId) {
      if (isNaN(patientId)) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "ID de paciente inválido",
          }),
          headers: HEADERS.json,
        };
      }

      const [error, updatePatientDto] = UpdatePatientDto.create(body);
      
      if (error) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: error,
          }),
          headers: HEADERS.json,
        };
      }

      return new UpdatePatient()
        .execute(patientId, updatePatientDto!, doctorId)
        .then((res) => res)
        .catch((error) => error);
    }

    // DELETE /patients/:id - Eliminar paciente (soft delete)
    if (httpMethod === "DELETE" && patientId) {
      if (isNaN(patientId)) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "ID de paciente inválido",
          }),
          headers: HEADERS.json,
        };
      }

      return new DeletePatient()
        .execute(patientId, doctorId)
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