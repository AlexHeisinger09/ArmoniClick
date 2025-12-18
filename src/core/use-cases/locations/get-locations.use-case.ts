// src/core/use-cases/locations/get-locations.use-case.ts
import { HttpAdapter } from "@/config/adapters/http/http.adapter";
import { Location } from "@/core/entities/location.entity";

export const getLocationsUseCase = async (
  httpAdapter: HttpAdapter
): Promise<Location[]> => {
  try {
    const locations = await httpAdapter.get<Location[]>("/locations");
    return locations;
  } catch (error: any) {
    throw new Error(error.message || "Error al obtener las ubicaciones");
  }
};
