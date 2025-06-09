import type { AxiosRequestConfig } from "axios";

export abstract class HttpAdapter {
  abstract get<T>(url: string, options?: AxiosRequestConfig): Promise<T>;

  abstract post<T>(
    url: string,
    body: Record<string, any>,
    options?: AxiosRequestConfig
  ): Promise<T>;

  abstract put<T>(
    url: string,
    body: Record<string, any>,
    options?: AxiosRequestConfig
  ): Promise<T>;

  abstract delete<T>(url: string, options?: AxiosRequestConfig): Promise<T>;
}
