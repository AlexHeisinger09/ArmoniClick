// netlify/functions/patients/patients.ts (VERSIÓN COMPLETA)
import { Handler, HandlerEvent } from "@netlify/functions";

import { validateJWT } from "../../middlewares";
import { HEADERS, fromBodyToObject } from "../../config/utils";
import { PatientService } from "../../services/patient.service";
import { patientsTable } from "../../data/schemas/patient.schema";

const handler: Handler = async (event: HandlerEvent) => {
  const { httpMethod, path } = event;

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: HEADERS.json,
    };
  }

  // Validar JWT y obtener usuario
  const userValidation = await validateJWT(event.headers.authorization!);
  if (userValidation.statusCode !== 200) return userValidation;

  // Extraer información del usuario validado
  const userData = JSON.parse(userValidation.body);
  const doctorId = userData.id;

  const patientService = new PatientService();

  // GET /patients - Obtener todos los pacientes del doctor
  if (httpMethod === "GET" && path === "/patients") {
    try {
      const patients = await patientService.findByDoctorId(doctorId);
      
      return {
        statusCode: 200,
        body: JSON.stringify({
          patients,
          total: patients.length
        }),
        headers: HEADERS.json,
      };
    } catch (error: any) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "Error al obtener pacientes",
          error: error.message
        }),
        headers: HEADERS.json,
      };
    }
  }

  // GET /patients/:id - Obtener un paciente específico
  if (httpMethod === "GET" && path.match(/^\/patients\/\d+$/)) {
    try {
      const patientId = parseInt(path.split('/')[2]);
      const patient = await patientService.findOne(patientsTable.id, patientId);
      
      if (!patient) {
        return {
          statusCode: 404,
          body: JSON.stringify({
            message: "Paciente no encontrado"
          }),
          headers: HEADERS.json,
        };
      }

      // Verificar que el paciente pertenece al doctor
      if (patient.idDoctor !== doctorId) {
        return {
          statusCode: 403,
          body: JSON.stringify({
            message: "No tienes autorización para acceder a este paciente"
          }),
          headers: HEADERS.json,
        };
      }

      return {
        statusCode: 200,
        body: JSON.stringify({ patient }),
        headers: HEADERS.json,
      };
    } catch (error: any) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "Error al obtener paciente",
          error: error.message
        }),
        headers: HEADERS.json,
      };
    }
  }

  // POST /patients - Crear nuevo paciente
  if (httpMethod === "POST" && path === "/patients") {
    try {
      const body = event.body ? fromBodyToObject(event.body) : {};
      
      // Validaciones básicas
      if (!body.rut || !body.nombres || !body.apellidos || !body.fechaNacimiento) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "Faltan campos obligatorios: rut, nombres, apellidos, fechaNacimiento"
          }),
          headers: HEADERS.json,
        };
      }

      // Verificar que el RUT no exista
      const existingPatient = await patientService.findOne(patientsTable.rut, body.rut);
      if (existingPatient) {
        return {
          statusCode: 409,
          body: JSON.stringify({
            message: "Ya existe un paciente con este RUT"
          }),
          headers: HEADERS.json,
        };
      }

      // Agregar el ID del doctor al paciente
      const patientData = {
        rut: body.rut,
        nombres: body.nombres,
        apellidos: body.apellidos,
        fechaNacimiento: body.fechaNacimiento,
        telefono: body.telefono || null,
        email: body.email || null,
        direccion: body.direccion || null,
        ciudad: body.ciudad || null,
        codigoPostal: body.codigoPostal || null,
        idDoctor: doctorId
      };

      const newPatient = await patientService.insert(patientData);
      
      return {
        statusCode: 201,
        body: JSON.stringify({
          message: "Paciente creado exitosamente",
          patient: newPatient
        }),
        headers: HEADERS.json,
      };
    } catch (error: any) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "Error al crear paciente",
          error: error.message
        }),
        headers: HEADERS.json,
      };
    }
  }

  // PUT /patients/:id - Actualizar paciente
  if (httpMethod === "PUT" && path.match(/^\/patients\/\d+$/)) {
    try {
      const patientId = parseInt(path.split('/')[2]);
      const body = event.body ? fromBodyToObject(event.body) : {};

      // Verificar que el paciente existe y pertenece al doctor
      const existingPatient = await patientService.findOne(patientsTable.id, patientId);
      if (!existingPatient) {
        return {
          statusCode: 404,
          body: JSON.stringify({
            message: "Paciente no encontrado"
          }),
          headers: HEADERS.json,
        };
      }

      if (existingPatient.idDoctor !== doctorId) {
        return {
          statusCode: 403,
          body: JSON.stringify({
            message: "No tienes autorización para modificar este paciente"
          }),
          headers: HEADERS.json,
        };
      }

      // Si se está actualizando el RUT, verificar que no exista otro paciente con ese RUT
      if (body.rut && body.rut !== existingPatient.rut) {
        const patientWithSameRut = await patientService.findOne(patientsTable.rut, body.rut);
        if (patientWithSameRut) {
          return {
            statusCode: 409,
            body: JSON.stringify({
              message: "Ya existe otro paciente con este RUT"
            }),
            headers: HEADERS.json,
          };
        }
      }

      // Preparar datos para actualización (solo campos que se enviaron)
      const updateData: any = {
        updatedAt: new Date()
      };

      if (body.rut !== undefined) updateData.rut = body.rut;
      if (body.nombres !== undefined) updateData.nombres = body.nombres;
      if (body.apellidos !== undefined) updateData.apellidos = body.apellidos;
      if (body.fechaNacimiento !== undefined) updateData.fechaNacimiento = body.fechaNacimiento;
      if (body.telefono !== undefined) updateData.telefono = body.telefono;
      if (body.email !== undefined) updateData.email = body.email;
      if (body.direccion !== undefined) updateData.direccion = body.direccion;
      if (body.ciudad !== undefined) updateData.ciudad = body.ciudad;
      if (body.codigoPostal !== undefined) updateData.codigoPostal = body.codigoPostal;

      const updatedPatient = await patientService.update(
        updateData, 
        patientsTable.id, 
        patientId
      );

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Paciente actualizado exitosamente",
          patient: updatedPatient
        }),
        headers: HEADERS.json,
      };
    } catch (error: any) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "Error al actualizar paciente",
          error: error.message
        }),
        headers: HEADERS.json,
      };
    }
  }

  // DELETE /patients/:id - Eliminar paciente (soft delete)
  if (httpMethod === "DELETE" && path.match(/^\/patients\/\d+$/)) {
    try {
      const patientId = parseInt(path.split('/')[2]);

      // Verificar que el paciente existe y pertenece al doctor
      const existingPatient = await patientService.findOne(patientsTable.id, patientId);
      if (!existingPatient) {
        return {
          statusCode: 404,
          body: JSON.stringify({
            message: "Paciente no encontrado"
          }),
          headers: HEADERS.json,
        };
      }

      if (existingPatient.idDoctor !== doctorId) {
        return {
          statusCode: 403,
          body: JSON.stringify({
            message: "No tienes autorización para eliminar este paciente"
          }),
          headers: HEADERS.json,
        };
      }

      await patientService.delete(patientId);

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Paciente eliminado exitosamente"
        }),
        headers: HEADERS.json,
      };
    } catch (error: any) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "Error al eliminar paciente",
          error: error.message
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