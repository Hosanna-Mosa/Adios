import { Feather } from "@expo/vector-icons";

export interface NotificationItem {
  _id: string;
  title: string;
  body: string;
  type: string;
  category: string;
  isRead: boolean;
  createdAt: string;
  data?: any;
}

export const CATEGORY_ICON: Record<string, keyof typeof Feather.glyphMap> = {
  order_status: "package",
  chat: "message-circle",
  system: "bell",
};

/** Relative age of a notification: "Just now", "12m ago", "3h ago", "Today", "4 Sep". */
export function formatWhen(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMin = Math.floor((now.getTime() - d.getTime()) / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  if (d.toDateString() === now.toDateString()) return "Today";
  return d.toLocaleDateString([], { day: "numeric", month: "short" });
}
