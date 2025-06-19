import type { HandlerEvent, Handler } from "@netlify/functions";

import {
  ChangePassword,
  CheckUserToken,
  LoginUser,
  RegisterUser,
  ResetPassword,
  ValidateEmail,
} from "./use-cases";

import {
  ChangePasswordDto,
  LoginUserDto,
  RegisterUserDto,
  ResetPasswordDto,
} from "./dtos";

import { fromBodyToObject, HEADERS } from "../../config/utils";

const handler: Handler = async (event: HandlerEvent) => {
  const { httpMethod, path } = event;
  const body = event.body ? fromBodyToObject(event.body) : {};
  const token = path.split("/").pop();

   // CORS headers para todas las respuestas
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'content-type, authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Manejar OPTIONS request (preflight)
  if (httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  if (httpMethod === "POST" && path.includes("/register")) {
    const [error, registerUserDto] = RegisterUserDto.create(body);
    if (error)
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: error,
        }),
        headers: corsHeaders,
      };

    return new RegisterUser()
      .execute(registerUserDto!)
      .then((res) => res)
      .catch((error) => error);
  }

  if (httpMethod === "POST" && path.includes("/login")) {
    const [error, loginUserDto] = LoginUserDto.create(body);
    if (error)
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: error,
        }),
        headers: corsHeaders,
      };

    return new LoginUser()
      .execute(loginUserDto!)
      .then((res) => res)
      .catch((error) => error);
  }

  if (httpMethod === "POST" && path.includes("/reset-password")) {
    const [error, resetPasswordDto] = ResetPasswordDto.create(body);
    if (error)
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: error,
        }),
        headers: corsHeaders,
      };

    return new ResetPassword()
      .execute(resetPasswordDto!)
      .then((res) => res)
      .catch((error) => error);
  }
  if (httpMethod === "POST" && path.includes("/change-password") && token) {
    const [error, changePasswordDto] = ChangePasswordDto.create(body);
    if (error)
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: error,
        }),
        headers: corsHeaders,
      };
    return new ChangePassword()
      .execute(token, changePasswordDto!.newPassword)
      .then((res) => res)
      .catch((error) => error);
  }

  if (httpMethod === "GET" && path.includes("/validate-email") && token) {
    return new ValidateEmail()
      .execute(token)
      .then((res) => res)
      .catch((error) => error);
  }

  if (httpMethod === "GET" && path.includes("/change-password") && token) {
    return new CheckUserToken()
      .execute(token)
      .then((res) => res)
      .catch((error) => error);
  }

  return {
    statusCode: 405,
    body: JSON.stringify({
      message: "Method Not Allowed",
    }),
    headers: corsHeaders,
  };
};

export { handler };
