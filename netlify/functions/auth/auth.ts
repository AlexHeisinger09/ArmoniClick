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

import { fromBodyToObject, HEADERS, getCORSHeaders } from "../../config/utils";

const handler: Handler = async (event: HandlerEvent) => {
  const { httpMethod, path } = event;
  const body = event.body ? fromBodyToObject(event.body) : {};
  const token = path.split("/").pop();
  const origin = event.headers.origin || event.headers.referer;

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: getCORSHeaders(origin),
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
        headers: getCORSHeaders(origin),
      };

    const result = await new RegisterUser()
      .execute(registerUserDto!);

    return {
      ...result,
      headers: getCORSHeaders(origin),
    };
  }

  if (httpMethod === "POST" && path.includes("/login")) {
    const [error, loginUserDto] = LoginUserDto.create(body);
    if (error)
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: error,
        }),
        headers: getCORSHeaders(origin),
      };

    const result = await new LoginUser()
      .execute(loginUserDto!);

    return {
      ...result,
      headers: getCORSHeaders(origin),
    };
  }

  if (httpMethod === "POST" && path.includes("/reset-password")) {
    const [error, resetPasswordDto] = ResetPasswordDto.create(body);
    if (error)
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: error,
        }),
        headers: getCORSHeaders(origin),
      };

    const result = await new ResetPassword()
      .execute(resetPasswordDto!);

    return {
      ...result,
      headers: getCORSHeaders(origin),
    };
  }
  if (httpMethod === "POST" && path.includes("/change-password") && token) {
    const [error, changePasswordDto] = ChangePasswordDto.create(body);
    if (error)
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: error,
        }),
        headers: getCORSHeaders(origin),
      };
    const result = await new ChangePassword()
      .execute(token, changePasswordDto!.newPassword);

    return {
      ...result,
      headers: getCORSHeaders(origin),
    };
  }

  if (httpMethod === "GET" && path.includes("/validate-email") && token) {
    const result = await new ValidateEmail()
      .execute(token);

    return {
      ...result,
      headers: getCORSHeaders(origin),
    };
  }

  if (httpMethod === "GET" && path.includes("/change-password") && token) {
    const result = await new CheckUserToken()
      .execute(token);

    return {
      ...result,
      headers: getCORSHeaders(origin),
    };
  }

  return {
    statusCode: 405,
    body: JSON.stringify({
      message: "Method Not Allowed",
    }),
    headers: getCORSHeaders(origin),
  };
};

export { handler };
