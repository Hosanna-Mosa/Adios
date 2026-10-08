import { create } from "zustand";
import type { ScheduledRequestAlert } from "@/types/models";

// Live alerts — from polling (LiveOrderWatcher), or from a push that arrives
// while the app is open — held here so the banner/sheet that shows them can sit at the app root
// and appear over whichever screen is open. The web panel does the same from
// VendorLayout, which wraps every vendor page.

export interface NewOrderAlert {
  orderId: string;
  customerName?: string;
  totalPrice?: number;
  receivedAt: number;
}

interface OrderAlertState {
  newOrder: NewOrderAlert | null;
  scheduledRequest: ScheduledRequestAlert | null;
  /** Ids already alerted, so the poll and the push for one order ring once. */
  seen: string[];
  /** False when this order was already alerted. */
  showNewOrder: (alert: NewOrderAlert) => boolean;
  dismissNewOrder: () => void;
  /** False when this request was already alerted. */
  showScheduledRequest: (alert: ScheduledRequestAlert) => boolean;
  dismissScheduledRequest: () => void;
  reset: () => void;
}

const SEEN_LIMIT = 50;

const remember = (seen: string[], id: string) => [...seen, id].slice(-SEEN_LIMIT);

export const useOrderAlertStore = create<OrderAlertState>((set, get) => ({
  newOrder: null,
  scheduledRequest: null,
  seen: [],
  showNewOrder: (alert) => {
    if (get().seen.includes(alert.orderId)) return false;
    set((s) => ({ newOrder: alert, seen: remember(s.seen, alert.orderId) }));
    return true;
  },
  dismissNewOrder: () => set({ newOrder: null }),
  showScheduledRequest: (alert) => {
    if (get().seen.includes(alert.requestId)) return false;
    set((s) => ({ scheduledRequest: alert, seen: remember(s.seen, alert.requestId) }));
    return true;
  },
  dismissScheduledRequest: () => set({ scheduledRequest: null }),
  reset: () => set({ newOrder: null, scheduledRequest: null, seen: [] }),
}));
