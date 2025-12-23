// netlify/functions/user/user.ts - ACTUALIZADO CON RUT
import { Handler, HandlerEvent } from "@netlify/functions";

import { validateJWT } from "../../middlewares";
import { HEADERS, fromBodyToObject } from "../../config/utils";
import { UserService } from "../../services";
import { usersTable } from "../../data/schemas/user.schema";
import { BcriptAdapter } from "../../config/adapters";

const handler: Handler = async (event: HandlerEvent) => {
  const { httpMethod, path } = event;
  const body = event.body ? fromBodyToObject(event.body) : {};

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: HEADERS.json,
    };
  }

  const user = await validateJWT(event.headers.authorization!);
  if (user.statusCode !== 200) return user;

  const userData = JSON.parse(user.body);
  const userService = new UserService();

  if (httpMethod === "GET" && path.includes("/profile")) {
    return user;
  }

  if (httpMethod === "PUT" && path.includes("/profile")) {
    try {
      const {
        rut,
        name,
        lastName,
        username,
        email,
        phone,
        address,
        zipCode,
        city,
        profession,
        specialty
      } = body;

      // Validaciones básicas
      if (!name || !lastName || !username || !email) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "Los campos nombre, apellido, username y email son obligatorios",
          }),
          headers: HEADERS.json,
        };
      }

      // Validar formato de RUT si se proporciona
      if (rut && !/^\d{7,8}-[\dkK]$/.test(rut)) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "Formato de RUT inválido (ej: 12345678-9)",
          }),
          headers: HEADERS.json,
        };
      }

      // Verificar si el username, email o RUT ya existen (excepto para el usuario actual)
      const existingUserByUsername = await userService.findOne(usersTable.username, username);
      if (existingUserByUsername && existingUserByUsername.id !== userData.id) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "El nombre de usuario ya está en uso",
          }),
          headers: HEADERS.json,
        };
      }

      const existingUserByEmail = await userService.findOne(usersTable.email, email);
      if (existingUserByEmail && existingUserByEmail.id !== userData.id) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "El email ya está en uso",
          }),
          headers: HEADERS.json,
        };
      }

      // Verificar RUT si se proporciona y es diferente al actual
      if (rut && rut !== userData.rut) {
        const existingUserByRut = await userService.findOne(usersTable.rut, rut);
        if (existingUserByRut && existingUserByRut.id !== userData.id) {
          return {
            statusCode: 400,
            body: JSON.stringify({
              message: "El RUT ya está registrado por otro usuario",
            }),
            headers: HEADERS.json,
          };
        }
      }

      // Actualizar el perfil
      await userService.update(
        {
          rut: rut || null,
          name,
          lastName,
          username,
          email,
          phone: phone || null,
          address: address || null,
          zipCode: zipCode || null,
          city: city || null,
          profession: profession || null,
          specialty: specialty || null,
          updatedAt: new Date(),
        },
        usersTable.id,
        userData.id
      );

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Perfil actualizado correctamente",
        }),
        headers: HEADERS.json,
      };
    } catch (error: any) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: error.message || "Error al actualizar el perfil",
        }),
        headers: HEADERS.json,
      };
    }
  }

  if (httpMethod === "PUT" && path.includes("/password")) {
    try {
      const { currentPassword, newPassword } = body;

      if (!currentPassword || !newPassword) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "La contraseña actual y la nueva contraseña son obligatorias",
          }),
          headers: HEADERS.json,
        };
      }

      if (newPassword.length < 6) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "La nueva contraseña debe tener al menos 6 caracteres",
          }),
          headers: HEADERS.json,
        };
      }

      // Obtener el usuario completo con la contraseña
      const fullUser = await userService.findOneWithPassword(usersTable.id, userData.id);
      if (!fullUser) {
        return {
          statusCode: 404,
          body: JSON.stringify({
            message: "Usuario no encontrado",
          }),
          headers: HEADERS.json,
        };
      }

      // Verificar la contraseña actual
      const isCurrentPasswordValid = BcriptAdapter.compare(currentPassword, fullUser.password);
      if (!isCurrentPasswordValid) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: "La contraseña actual es incorrecta",
          }),
          headers: HEADERS.json,
        };
      }

      // Encriptar la nueva contraseña
      const hashedNewPassword = BcriptAdapter.hash(newPassword);

      // Actualizar la contraseña
      await userService.update(
        {
          password: hashedNewPassword,
          updatedAt: new Date(),
        },
        usersTable.id,
        userData.id
      );

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Contraseña actualizada correctamente",
        }),
        headers: HEADERS.json,
      };
    } catch (error: any) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: error.message || "Error al actualizar la contraseña",
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