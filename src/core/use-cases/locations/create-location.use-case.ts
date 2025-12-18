// src/core/use-cases/locations/create-location.use-case.ts
import { HttpAdapter } from "@/config/adapters/http/http.adapter";
import { Location } from "@/core/entities/location.entity";

export interface CreateLocationDto {
  name: string;
  address: string;
  city: string;
  google_calendar_id?: string | null;
  is_active?: boolean;
}

export const createLocationUseCase = async (
  httpAdapter: HttpAdapter,
  locationData: CreateLocationDto
): Promise<Location> => {
  try {
    const newLocation = await httpAdapter.post<Location>("/locations", locationData);
    return newLocation;
  } catch (error: any) {
    throw new Error(error.message || "Error al crear la ubicación");
  }
};
