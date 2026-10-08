import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { adminFetch } from "@/lib/api-client";
import { ensureWebPushSubscribed } from "@/lib/webPush";

// How often the bell re-reads the list and unread count while the tab is
// visible — in place of the old "new_notification" socket event.
const NOTIFICATIONS_REFRESH_MS = 30_000;

interface NotificationItem {
  _id: string;
  title: string;
  body: string;
  category: string;
  isRead: boolean;
  createdAt: string;
  data?: { deepLink?: { app?: string; screen: string; params?: Record<string, string> } };
}

function formatWhen(iso: string, t: (key: string, opts?: Record<string, unknown>) => string): string {
  const diffMin = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (diffMin < 1) return t("notifications.justNow");
  if (diffMin < 60) return t("notifications.minutesAgo", { count: diffMin, defaultValue: "{{count}}m ago" });
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return t("notifications.hoursAgo", { count: diffHr, defaultValue: "{{count}}h ago" });
  return new Date(iso).toLocaleDateString([], { day: "numeric", month: "short" });
}

/** A deepLink's params are notification-payload-shaped (orderId/ticketId), not React Router's
 *  :id — this maps the couple of screens SOS/support notifications actually target. */
function resolveAdminPath(deepLink?: { screen: string; params?: Record<string, string> }): string | null {
  if (!deepLink) return null;
  return deepLink.screen;
}

export function NotificationBell() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  // Skips a poll while the previous one is still in flight, so a slow
  // network never stacks requests up.
  const isFetchingRef = useRef(false);
  const fetchAll = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    try {
      const [list, count] = await Promise.all([
        adminFetch<NotificationItem[]>("/notifications"),
        adminFetch<{ unreadCount: number }>("/notifications/unread-count"),
      ]);
      setItems(list || []);
      setUnreadCount(count?.unreadCount || 0);
    } catch (err) {
      console.error("[NotificationBell] Failed to fetch notifications:", err);
    } finally {
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchAll();
    ensureWebPushSubscribed();

    // Poll only while the tab is visible, and catch up straight away when the
    // user comes back to it.
    const interval = window.setInterval(() => {
      if (!document.hidden) fetchAll();
    }, NOTIFICATIONS_REFRESH_MS);
    const handleVisibilityChange = () => {
      if (!document.hidden) fetchAll();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchAll]);

  const handleOpenItem = async (item: NotificationItem) => {
    if (!item.isRead) {
      setItems((prev) => prev.map((n) => (n._id === item._id ? { ...n, isRead: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
      adminFetch(`/notifications/${item._id}/read`, { method: "PATCH" }).catch(() => {});
    }
    setOpen(false);
    const path = resolveAdminPath(item.data?.deepLink);
    if (path) navigate(path);
  };

  const handleMarkAllRead = async () => {
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    try {
      await adminFetch("/notifications/read-all", { method: "PATCH" });
    } catch (err) {
      console.error("[NotificationBell] Failed to mark all read:", err);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[10px] leading-none flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="text-sm font-bold text-foreground">{t("notifications.notifications")}</span>
          {unreadCount > 0 && (
            <button className="text-xs font-semibold text-primary hover:underline" onClick={handleMarkAllRead}>
              {t("notifications.markAllRead")}
            </button>
          )}
        </div>
        <ScrollArea className="max-h-96">
          {items.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8 px-4">{t("notifications.nothingHereYet")}</p>
          ) : (
            <div className="divide-y divide-border">
              {items.map((item) => (
                <button
                  key={item._id}
                  onClick={() => handleOpenItem(item)}
                  className={`w-full text-left px-4 py-3 hover:bg-muted transition-colors ${!item.isRead ? "bg-primary/5" : ""}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground">{item.title}</span>
                    {!item.isRead && <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.body}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{formatWhen(item.createdAt, t)}</p>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
