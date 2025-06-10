import { useEffect, useState } from "react";
import * as UseCases from "../../../core/use-cases";
import { apiFetcher } from "@/config/adapters/api.adapter";
import { useMutation } from "@tanstack/react-query";
import { useLocalStorage } from "@uidotdev/usehooks";
import { useLocation, useNavigate } from "react-router-dom";

export const useLoginMutation = () => {
  const [isLoadingLogin, setisLoadingLogin] = useState(false);
  const navitation = useNavigate();
  const { pathname } = useLocation();

  const loginMutation = useMutation({
    mutationFn: (body: Record<string, string>) => {
      return UseCases.loginUserUseCase(apiFetcher, body)
    },
    onMutate: () => {
      setisLoadingLogin(true);
    },
    onSuccess: () => {
      setisLoadingLogin(false);
    },
    onError: () => {
      setisLoadingLogin(false);
    },
  });

  const [token, saveToken] = useLocalStorage<string | null>("token", null);

  // CAMBIO 1: Redirigir a /dashboard después del login exitoso
  useEffect(() => {
    if (loginMutation.data) {
      saveToken(loginMutation.data as string);
      navitation("/dashboard"); // CAMBIO: era "/" ahora es "/dashboard"
    }
  }, [loginMutation.data, saveToken, navitation]);

  // CAMBIO 2: Redirigir a /auth/login si no hay token (en lugar de "/")
  useEffect(() => {
    if (!token && !pathname.includes("/auth")) {
      navitation("/auth/login"); // CAMBIO: era "/" ahora es "/auth/login"
    }
  }, [token, navitation, pathname]);

  const logout = () => {
    saveToken(null);
    navitation("/auth/login"); // CAMBIO: era "/" ahora es "/auth/login"
  }

  return { loginMutation, token, logout, isLoadingLogin };
};