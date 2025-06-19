import * as UsesCases from "@/core/use-cases/user/profile.use-case";
import { apiFetcher } from "@/config/adapters/api.adapter";
import { useQuery } from "@tanstack/react-query";

export const useProfile = (token: string) => {
  console.log('useProfile called with token:', token ? '***token exists***' : 'no token'); // Debug

  const queryProfile = useQuery({
    queryKey: ["profile", token],
    queryFn: async () => {
      console.log('Profile query function executing...'); // Debug
      
      // Verificar que el token esté disponible antes de hacer la llamada
      if (!token) {
        throw new Error('No token available');
      }
      
      // Verificar que el token esté en localStorage
      const storedToken = localStorage.getItem('token');
      console.log('Token in localStorage during query:', storedToken ? '***exists***' : 'missing'); // Debug
      
      const result = await UsesCases.profileUseCase(apiFetcher);
      console.log('Profile query result:', result); // Debug
      return result;
    },
    enabled: !!token, // Solo ejecutar si hay token
    retry: (failureCount, error: any) => {
      console.log('Profile query retry:', failureCount, error?.message); // Debug
      
      // No reintentar en errores 401 (no autorizado)
      if (error?.statusCode === 401) {
        return false;
      }
      
      // Reintentar máximo 2 veces para otros errores
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });

  return {
    queryProfile,
  };
};