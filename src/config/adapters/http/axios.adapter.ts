import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";

import { HttpAdapter } from "./";
import { HttpError } from "../../helpers";

interface Options {
  baseURL: string;
  params?: Record<string, string>;
  headers?: Record<string, string | boolean>;
}

export class AxiosAdapter implements HttpAdapter {
  private axiosInstance: AxiosInstance;

  constructor(options: Options) {
    this.axiosInstance = axios.create({
      baseURL: options.baseURL,
      params: options.params,
      headers: options.headers,
    });

    this.axiosInstance.interceptors.request.use(async (config) => {
      if (config.headers?.Authorization) {
        return config;
      }

      const token = localStorage.getItem("token");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    });
  }

  async get<T>(url: string, options?: AxiosRequestConfig): Promise<T> {
    try {
      const { data } = await this.axiosInstance.get<T>(url, options);
      return data;
    } catch (error: any) {
      const errorData = HttpError.getErrorSever(error);
      if (error.response) throw new HttpError(errorData);

      throw new HttpError({
        message: error.message,
        error: "Unknown error",
        statusCode: 500,
      });
    }
  }

  async post<T>(
    url: string,
    body: Record<string, any>,
    options?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const { data } = await this.axiosInstance.post<T>(url, body, options);
      return data;
    } catch (error: any) {
      const errorData = HttpError.getErrorSever(error);
      if (error.response) throw new HttpError(errorData);

      throw new HttpError({
        message: error.message,
        error: "Unknown error",
        statusCode: 500,
      });
    }
  }

  async put<T>(
    url: string,
    body: Record<string, any>,
    options?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const { data } = await this.axiosInstance.put<T>(url, body, options);
      return data;
    } catch (error: any) {
      const errorData = HttpError.getErrorSever(error);
      if (error.response) throw new HttpError(errorData);

      throw new HttpError({
        message: error.message,
        error: "Unknown error",
        statusCode: 500,
      });
    }
  }

  async delete<T>(url: string, options?: AxiosRequestConfig): Promise<T> {
    try {
      const { data } = await this.axiosInstance.delete<T>(url, options);
      return data;
    } catch (error: any) {
      const errorData = HttpError.getErrorSever(error);
      if (error.response) throw new HttpError(errorData);

      throw new HttpError({
        message: error.message,
        error: "Unknown error",
        statusCode: 500,
      });
    }
  }
}
