import { useState } from "react";
import { apiFetcher } from "@/config/adapters/api.adapter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProfileUseCase } from "@/core/use-cases/user/update-profile.use-case";
import { updatePasswordUseCase } from "@/core/use-cases/user/update-password.use-case";

export const useUpdateProfileMutation = () => {
  const [isLoadingUpdate, setIsLoadingUpdate] = useState(false);
  const queryClient = useQueryClient();

  const updateProfileMutation = useMutation({
    mutationFn: (body: Record<string, string>) => {
      return updateProfileUseCase(apiFetcher, body);
    },
    onMutate: () => {
      setIsLoadingUpdate(true);
    },
    onSuccess: () => {
      setIsLoadingUpdate(false);
      // Invalidar y refrescar el cache del perfil
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: () => {
      setIsLoadingUpdate(false);
    },
  });

  return {
    updateProfileMutation,
    isLoadingUpdate,
  };
};

export const useUpdatePasswordMutation = () => {
  const [isLoadingPasswordUpdate, setIsLoadingPasswordUpdate] = useState(false);

  const updatePasswordMutation = useMutation({
    mutationFn: (body: Record<string, string>) => {
      return updatePasswordUseCase(apiFetcher, body);
    },
    onMutate: () => {
      setIsLoadingPasswordUpdate(true);
    },
    onSuccess: () => {
      setIsLoadingPasswordUpdate(false);
    },
    onError: () => {
      setIsLoadingPasswordUpdate(false);
    },
  });

  return {
    updatePasswordMutation,
    isLoadingPasswordUpdate,
  };
};