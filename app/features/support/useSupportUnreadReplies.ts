import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { SupportTicket } from "./useSupportChat.shared";

// Remembers, per ticket, how many messages the customer had on screen the last
// time they had that case's chat open. Support replies after that point count
// as unread and show as a badge on the case card.
const STORAGE_KEY = "support_seen_message_counts";

type SeenCounts = Record<string, number>;

function countUnread(ticket: SupportTicket, seen: number | undefined): number {
  if (seen === undefined) {
    // Never opened on this device: flag it only if support spoke last and the
    // case is still live, so old history doesn't light up after a reinstall.
    if (ticket.status === "RESOLVED") return 0;
    const lastReal = [...ticket.messages].reverse().find((m) => m.sender !== "system");
    return lastReal?.sender === "admin" ? 1 : 0;
  }
  return ticket.messages.slice(seen).filter((m) => m.sender === "admin").length;
}

export function useSupportUnreadReplies(allTickets: SupportTicket[], openTicket: SupportTicket | null, isChatOpen: boolean) {
  const [seenCounts, setSeenCounts] = useState<SeenCounts>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setSeenCounts(JSON.parse(raw));
      })
      .catch(() => {
        // Unreadable storage just means every live case starts from the fallback rule.
      })
      .finally(() => setLoaded(true));
  }, []);

  // While a case's chat is on screen, everything in it has been seen — including
  // replies that arrive while it is open.
  const openId = isChatOpen ? openTicket?._id : undefined;
  const openLength = openTicket?.messages.length ?? 0;
  useEffect(() => {
    if (!loaded || !openId) return;
    setSeenCounts((prev) => {
      if (prev[openId] === openLength) return prev;
      const next = { ...prev, [openId]: openLength };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, [loaded, openId, openLength]);

  const unreadCount = useCallback(
    (ticket: SupportTicket) => (loaded && ticket._id !== openId ? countUnread(ticket, seenCounts[ticket._id]) : 0),
    [loaded, openId, seenCounts],
  );

  return { unreadCount };
}
