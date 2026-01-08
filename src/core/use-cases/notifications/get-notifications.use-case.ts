import { HttpAdapter } from "@/config/adapters/http/http.adapter";
import type { Notification } from "@/core/entities/notification.entity";

export const getNotificationsUseCase = async (
  fetcher: HttpAdapter
): Promise<Notification[]> => {
  try {
    const notifications = await fetcher.get<Notification[]>("/notifications");

    // Convertir strings de fecha a objetos Date
    // Las fechas vienen de PostgreSQL en formato ISO UTC, las convertimos directamente
    return notifications.map((notification: any) => ({
      ...notification,
      createdAt: new Date(notification.createdAt),
      updatedAt: new Date(notification.updatedAt),
      readAt: notification.readAt ? new Date(notification.readAt) : null,
      appointmentDate: notification.appointmentDate ? new Date(notification.appointmentDate) : null,
    }));
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};
