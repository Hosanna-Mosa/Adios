
// Reading a push notification's `data`. Kept free of native modules so the
// rules for what a push means — and where tapping it goes — are unit-tested.

const text = (value: unknown) => (typeof value === "string" && value ? value : undefined);
const amount = (value: unknown) => (typeof value === "number" && Number.isFinite(value) ? value : undefined);

/** One of the payloads backend orders.service.ts sends, or null for anything else. */
export function parsePushPayload(data: unknown): PushPayload | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  if (d.kind === "new_order" && text(d.orderId)) {
    return { kind: "new_order", orderId: d.orderId as string, customerName: text(d.customerName), totalPrice: amount(d.totalPrice) };
  }
  if (d.kind === "scheduled_request" && text(d.requestId)) {
    return {
      kind: "scheduled_request",
      requestId: d.requestId as string,
      customerName: text(d.customerName),
      customerPhone: text(d.customerPhone),
      scheduledFor: text(d.scheduledFor),
    };
  }
  return null;
}

export type PushTarget =
  | { pathname: "/order/[id]"; params: { id: string } }
  | { pathname: "/scheduled-orders" }
  | { pathname: "/payouts" }
  | { pathname: "/support-chat"; params: { ticketId: string } }
  | { pathname: "/support" }
  | { pathname: "/(tabs)/orders" | "/(tabs)/menu" | "/(tabs)/inventory" | "/(tabs)/account" };

// Screens an announcement push (admin broadcast) may open; anything else is ignored.
const ANNOUNCEMENT_SCREENS = ["/(tabs)/orders", "/(tabs)/menu", "/(tabs)/inventory", "/(tabs)/account", "/payouts", "/scheduled-orders", "/support"] as const;

/** The screen tapping a push opens, or null when it has nowhere particular to go. */
export function pushTarget(payload: PushPayload | null): PushTarget | null {
  if (payload?.kind === "new_order") return { pathname: "/order/[id]", params: { id: payload.orderId } };
  if (payload?.kind === "scheduled_request") return { pathname: "/scheduled-orders" };
  return null;
}

/**
 * Where tapping any push goes. The two live alerts open their order / request list; other pushes
 * carry a `kind` (order_update, payout, support_reply, announcement) with what they are about.
 * A push with no destination, or one this app version does not know, just opens the app.
 */
export function pushTargetFromData(data: unknown): PushTarget | null {
  const alert = pushTarget(parsePushPayload(data));
  if (alert) return alert;
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  if (d.kind === "order_update" && text(d.orderId)) return { pathname: "/order/[id]", params: { id: d.orderId as string } };
  if (d.kind === "payout") return { pathname: "/payouts" };
  if (d.kind === "support_reply") return text(d.ticketId) ? { pathname: "/support-chat", params: { ticketId: d.ticketId as string } } : { pathname: "/support" };
  if (d.kind === "announcement" && typeof d.screen === "string") {
    const screen = ANNOUNCEMENT_SCREENS.find((s) => s === d.screen);
    return screen ? ({ pathname: screen } as PushTarget) : null;
  }
  return null;
}

/** What a push notification's `data` carries — set by backend orders.service.ts. */
export type PushPayload =
  | { kind: "new_order"; orderId: string; customerName?: string; totalPrice?: number }
  | { kind: "scheduled_request"; requestId: string; customerName?: string; customerPhone?: string; scheduledFor?: string };
