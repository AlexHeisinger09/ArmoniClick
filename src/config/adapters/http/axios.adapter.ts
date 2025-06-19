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

    // Interceptor para agregar el token automáticamente
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        console.log('Axios interceptor - URL:', config.url); // Debug
        console.log('Axios interceptor - Current headers:', config.headers); // Debug

        // Si ya tiene Authorization, no modificar
        if (config.headers?.Authorization) {
          console.log('Authorization header already exists:', config.headers.Authorization); // Debug
          return config;
        }

        // Obtener token del localStorage
        const token = localStorage.getItem("token");
        console.log('Token from localStorage in interceptor:', token ? '***token exists***' : 'no token'); // Debug

        if (token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
          console.log('Added Authorization header:', `Bearer ${token.substring(0, 20)}...`); // Debug
        } else {
          console.log('No token found, request will be sent without Authorization header'); // Debug
        }

        return config;
      },
      (error) => {
        console.error('Axios request interceptor error:', error); // Debug
        return Promise.reject(error);
      }
    );

    // Interceptor para respuestas
    this.axiosInstance.interceptors.response.use(
      (response) => {
        console.log('Axios response:', response.status, response.config.url); // Debug
        return response;
      },
      (error) => {
        console.error('Axios response error:', error.response?.status, error.response?.data); // Debug
        return Promise.reject(error);
      }
    );
  }
  

  async get<T>(url: string, options?: AxiosRequestConfig): Promise<T> {
    try {
      console.log('GET request to:', url); // Debug
      const { data } = await this.axiosInstance.get<T>(url, options);
      return data;
    } catch (error: any) {
      console.error('GET request error:', error.response?.status, error.response?.data); // Debug
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
      console.log('POST request to:', url); // Debug
      const { data } = await this.axiosInstance.post<T>(url, body, options);
      return data;
    } catch (error: any) {
      console.error('POST request error:', error.response?.status, error.response?.data); // Debug
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
      console.log('PUT request to:', url); // Debug
      const { data } = await this.axiosInstance.put<T>(url, body, options);
      return data;
    } catch (error: any) {
      console.error('PUT request error:', error.response?.status, error.response?.data); // Debug
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
      console.log('DELETE request to:', url); // Debug
      const { data } = await this.axiosInstance.delete<T>(url, options);
      return data;
    } catch (error: any) {
      console.error('DELETE request error:', error.response?.status, error.response?.data); // Debug
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