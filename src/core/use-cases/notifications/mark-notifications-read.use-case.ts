import { HttpAdapter } from "@/config/adapters/http/http.adapter";

export const markNotificationsReadUseCase = async (
  fetcher: HttpAdapter
): Promise<void> => {
  try {
    await fetcher.put("/notifications/mark-read", {});
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    throw error;
  }
};
