import { AxiosAdapter } from "./http/axios.adapter";

export const apiFetcher = new AxiosAdapter({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  headers: {
    "Content-Type": "application/json", // Cambio de form-data a JSON
  },
});

// Crear un adaptador específico para formularios si es necesario
export const apiFormFetcher = new AxiosAdapter({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
  },
});