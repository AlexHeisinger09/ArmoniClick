import { HttpAdapter } from "@/config/adapters/http/http.adapter";
import { CreateServiceData, ServiceResponse } from "./types";

export const createServiceUseCase = async (
  fetcher: HttpAdapter,
  serviceData: CreateServiceData
): Promise<ServiceResponse> => {
  try {
    const response = await fetcher.post<ServiceResponse>(
      "/services",
      serviceData
    );
    return response;
  } catch (error) {
    throw new Error(`Error creando servicio: ${error}`);
  }
};
