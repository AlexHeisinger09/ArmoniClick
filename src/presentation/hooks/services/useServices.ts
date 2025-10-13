// src/presentation/hooks/services/useServices.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetcher } from '@/config/adapters/api.adapter';
import {
  getServicesUseCase,
  createServiceUseCase,
  updateServiceUseCase,
  deleteServiceUseCase,
  CreateServiceData,
  UpdateServiceData,
} from "@/core/use-cases/services";

export const useServices = () => {
  const queryClient = useQueryClient();

  const queryServices = useQuery({
    queryKey: ['services'],
    queryFn: () => getServicesUseCase(apiFetcher),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  const createServiceMutation = useMutation({
    mutationFn: (serviceData: CreateServiceData) =>
      createServiceUseCase(apiFetcher, serviceData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });

  const updateServiceMutation = useMutation({
    mutationFn: ({ serviceId, serviceData }: { serviceId: number; serviceData: UpdateServiceData }) =>
      updateServiceUseCase(apiFetcher, serviceId, serviceData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: (serviceId: number) =>
      deleteServiceUseCase(apiFetcher, serviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });

  return {
    queryServices,
    services: queryServices.data?.services || [],
    total: queryServices.data?.total || 0,
    isLoading: queryServices.isLoading,
    error: queryServices.error,

    createService: createServiceMutation.mutateAsync,
    updateService: updateServiceMutation.mutateAsync,
    deleteService: deleteServiceMutation.mutateAsync,

    isCreating: createServiceMutation.isPending,
    isUpdating: updateServiceMutation.isPending,
    isDeleting: deleteServiceMutation.isPending,

    createServiceMutation,
    updateServiceMutation,
    deleteServiceMutation,
  };
};