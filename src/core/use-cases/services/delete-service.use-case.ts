import { HttpAdapter } from "@/config/adapters/http/http.adapter";
import { DeleteServiceResponse } from "./types";

export const deleteServiceUseCase = async (
  fetcher: HttpAdapter,
  serviceId: number
): Promise<DeleteServiceResponse> => {
  try {
    const response = await fetcher.delete<DeleteServiceResponse>(
      `/services/${serviceId}`
    );
    return response;
  } catch (error) {
    throw new Error(`Error eliminando servicio: ${error}`);
  }
};