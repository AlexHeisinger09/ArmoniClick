// src/core/use-cases/locations/update-location.use-case.ts
import { HttpAdapter } from "@/config/adapters/http/http.adapter";
import { Location } from "@/core/entities/location.entity";

export interface UpdateLocationDto {
  name?: string;
  address?: string;
  city?: string;
  google_calendar_id?: string | null;
  is_active?: boolean;
}

export const updateLocationUseCase = async (
  httpAdapter: HttpAdapter,
  locationId: number,
  locationData: UpdateLocationDto
): Promise<Location> => {
  try {
    const updatedLocation = await httpAdapter.put<Location>(
      `/locations/${locationId}`,
      locationData
    );
    return updatedLocation;
  } catch (error: any) {
    throw new Error(error.message || "Error al actualizar la ubicación");
  }
};
