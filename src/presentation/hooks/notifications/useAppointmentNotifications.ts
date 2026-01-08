import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetcher } from "@/config/adapters/api.adapter";
import { getNotificationsUseCase } from "@/core/use-cases/notifications/get-notifications.use-case";
import { markNotificationsReadUseCase } from "@/core/use-cases/notifications/mark-notifications-read.use-case";

export const useAppointmentNotifications = () => {
  const queryClient = useQueryClient();

  // Obtener notificaciones
  const queryNotifications = useQuery({
    queryKey: ["appointment-notifications"],
    queryFn: () => getNotificationsUseCase(apiFetcher),
    refetchInterval: 30000, // Refetch cada 30 segundos
    staleTime: 10000, // Considerar datos obsoletos después de 10 segundos
  });

  // Marcar todas como leídas
  const markAllAsReadMutation = useMutation({
    mutationFn: () => markNotificationsReadUseCase(apiFetcher),
    onSuccess: () => {
      // Invalidar la query para refrescar las notificaciones
      queryClient.invalidateQueries({ queryKey: ["appointment-notifications"] });
    },
  });

  // Calcular número de notificaciones sin leer
  const unreadCount = queryNotifications.data?.filter(n => !n.isRead).length || 0;

  return {
    notifications: queryNotifications.data || [],
    isLoading: queryNotifications.isLoading,
    isError: queryNotifications.isError,
    error: queryNotifications.error,
    unreadCount,
    markAllAsRead: markAllAsReadMutation.mutate,
    isMarkingAsRead: markAllAsReadMutation.isPending,
  };
};
