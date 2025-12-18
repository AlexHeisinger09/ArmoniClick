// src/presentation/hooks/locations/useLocations.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetcher } from "@/config/adapters/api.adapter";
import {
  getLocationsUseCase,
  createLocationUseCase,
  updateLocationUseCase,
  deleteLocationUseCase,
  type CreateLocationDto,
  type UpdateLocationDto,
} from "@/core/use-cases/locations";
import { Location } from "@/core/entities/location.entity";

export const useLocations = () => {
  const queryClient = useQueryClient();

  // Query para obtener todas las ubicaciones
  const queryLocations = useQuery({
    queryKey: ["locations"],
    queryFn: () => getLocationsUseCase(apiFetcher),
  });

  // Mutation para crear ubicación
  const createLocationMutation = useMutation({
    mutationFn: (locationData: CreateLocationDto) =>
      createLocationUseCase(apiFetcher, locationData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    },
  });

  // Mutation para actualizar ubicación
  const updateLocationMutation = useMutation({
    mutationFn: ({
      locationId,
      locationData,
    }: {
      locationId: number;
      locationData: UpdateLocationDto;
    }) => updateLocationUseCase(apiFetcher, locationId, locationData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    },
  });

  // Mutation para eliminar ubicación
  const deleteLocationMutation = useMutation({
    mutationFn: (locationId: number) =>
      deleteLocationUseCase(apiFetcher, locationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    },
  });

  return {
    // Query
    queryLocations,
    locations: queryLocations.data as Location[] | undefined,
    isLoading: queryLocations.isLoading,
    isError: queryLocations.isError,
    error: queryLocations.error,

    // Mutations
    createLocationMutation,
    updateLocationMutation,
    deleteLocationMutation,
  };
};
