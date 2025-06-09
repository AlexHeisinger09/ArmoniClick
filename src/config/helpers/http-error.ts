import type { AxiosError } from "axios";
import { MsgResponse } from "@/infrastructure/interfaces";

export class HttpError extends Error {
  statusCode: number;

  constructor({ message, error, statusCode }: MsgResponse) {
    super(Array.isArray(message) ? message[0] : message);
    this.statusCode = statusCode;
    this.name = error;
  }

  static getErrorSever(error: Error): MsgResponse {
    const serverError = error as AxiosError;
    const errorData = serverError.response?.data as MsgResponse;

    return errorData;
  }

  static getError(error: Error): MsgResponse {
    const errorData = error as HttpError;

    return {
      message: errorData.message,
      error: errorData.name,
      statusCode: errorData.statusCode,
    };
  }
}
