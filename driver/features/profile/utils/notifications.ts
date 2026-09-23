import { Feather } from "@expo/vector-icons";
import i18n from "@/i18n";

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
  if (diffMin < 1) return i18n.t("profile.justNow");
  if (diffMin < 60) return i18n.t("profile.minAgoShort", { value: diffMin, defaultValue: "{{value}}m ago" });
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return i18n.t("profile.hoursAgoShort", { value: diffHr, defaultValue: "{{value}}h ago" });
  if (d.toDateString() === now.toDateString()) return i18n.t("profile.today");
  return d.toLocaleDateString([], { day: "numeric", month: "short" });
}
