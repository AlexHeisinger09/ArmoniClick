// src/core/use-cases/locations/delete-location.use-case.ts
import { HttpAdapter } from "@/config/adapters/http/http.adapter";

export const deleteLocationUseCase = async (
  httpAdapter: HttpAdapter,
  locationId: number
): Promise<void> => {
  try {
    await httpAdapter.delete(`/locations/${locationId}`);
  } catch (error: any) {
    throw new Error(error.message || "Error al eliminar la ubicación");
  }
};
