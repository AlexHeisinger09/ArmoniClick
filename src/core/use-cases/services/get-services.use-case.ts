import { HttpAdapter } from "@/config/adapters/http/http.adapter";
import { GetServicesResponse } from "./types";

export const getServicesUseCase = async (
  fetcher: HttpAdapter
): Promise<GetServicesResponse> => {
  try {
    const response = await fetcher.get<GetServicesResponse>("/services");
    return response;
  } catch (error) {
    throw new Error(`Error obteniendo servicios: ${error}`);
  }
};