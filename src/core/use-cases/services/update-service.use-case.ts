import { HttpAdapter } from "@/config/adapters/http/http.adapter";
import { UpdateServiceData, ServiceResponse } from "./types";

export const updateServiceUseCase = async (
  fetcher: HttpAdapter,
  serviceId: number,
  serviceData: UpdateServiceData
): Promise<ServiceResponse> => {
  try {
    const response = await fetcher.put<ServiceResponse>(
      `/services/${serviceId}`,
      serviceData
    );
    return response;
  } catch (error) {
    throw new Error(`Error actualizando servicio: ${error}`);
  }
};