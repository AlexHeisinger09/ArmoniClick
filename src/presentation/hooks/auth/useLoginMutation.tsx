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
      console.log('Login mutation starting...'); // Debug
      return UseCases.loginUserUseCase(apiFetcher, body)
    },
    onMutate: () => {
      console.log('Login mutation onMutate'); // Debug
      setisLoadingLogin(true);
    },
    onSuccess: (data) => {
      console.log('Login mutation onSuccess:', data ? '***token received***' : 'no token'); // Debug
      setisLoadingLogin(false);
    },
    onError: (error) => {
      console.error('Login mutation onError:', error); // Debug
      setisLoadingLogin(false);
    },
  });

  const [token, saveToken] = useLocalStorage<string | null>("token", null);

  // Redirigir a /dashboard después del login exitoso
  useEffect(() => {
    if (loginMutation.data) {
      const receivedToken = loginMutation.data as string;
      console.log('Saving token to localStorage:', receivedToken ? '***saving token***' : 'no token to save'); // Debug
      
      saveToken(receivedToken);
      
      // Verificar que se guardó correctamente
      setTimeout(() => {
        const storedToken = localStorage.getItem("token");
        console.log('Token verification after save:', storedToken ? '***token saved successfully***' : 'token not saved'); // Debug
        
        if (storedToken) {
          console.log('Navigating to dashboard...'); // Debug
          navitation("/dashboard");
        } else {
          console.error('Token was not saved to localStorage'); // Debug
        }
      }, 100);
    }
  }, [loginMutation.data, saveToken, navitation]);

  // Redirigir a /auth/login si no hay token
  useEffect(() => {
    if (!token && !pathname.includes("/auth")) {
      console.log('No token found, redirecting to login'); // Debug
      navitation("/auth/login");
    }
  }, [token, navitation, pathname]);

  const logout = () => {
    console.log('Logging out...'); // Debug
    saveToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navitation("/auth/login");
  }

  return { loginMutation, token, logout, isLoadingLogin };
};