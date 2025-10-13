import { HttpAdapter } from "@/config/adapters/http/http.adapter";
import { ServiceResponse } from "./types";

export const getServiceByIdUseCase = async (
  fetcher: HttpAdapter,
  serviceId: number
): Promise<ServiceResponse> => {
  try {
    const response = await fetcher.get<ServiceResponse>(`/services/${serviceId}`);
    return response;
  } catch (error) {
    throw new Error(`Error obteniendo servicio: ${error}`);
  }
};