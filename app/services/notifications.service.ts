import { customFetch } from "@/utils/api/custom-fetch";

// Every /notifications call the app makes. Moved out of the screens unchanged:
// same paths, same methods, same absence of a body.

export interface NotificationItem {
  _id: string;
  title: string;
  body: string;
  type: string;
  category: string;
  isRead: boolean;
  createdAt: string;
  /** Deep-link payload; its shape is decided by the sender, so it stays open. */
  data?: any;
}

export const getNotifications = () =>
  customFetch<NotificationItem[]>("/notifications");

export const getUnreadCount = () =>
  customFetch<{ unreadCount: number }>("/notifications/unread-count");

/** Fire-and-forget at the call sites: the row is marked read optimistically. */
export const markNotificationRead = (id: string) =>
  customFetch(`/notifications/${id}/read`, { method: "PATCH" });

export const markAllNotificationsRead = () =>
  customFetch("/notifications/read-all", { method: "PATCH" });
