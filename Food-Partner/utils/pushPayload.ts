import type { PushPayload } from "@/types/models";

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

export type PushTarget = { pathname: "/order/[id]"; params: { id: string } } | { pathname: "/scheduled-orders" };

/** The screen tapping a push opens, or null when it has nowhere particular to go. */
export function pushTarget(payload: PushPayload | null): PushTarget | null {
  if (payload?.kind === "new_order") return { pathname: "/order/[id]", params: { id: payload.orderId } };
  if (payload?.kind === "scheduled_request") return { pathname: "/scheduled-orders" };
  return null;
}
