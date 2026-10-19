import type { OrderServiceFields, OrderServiceKind } from "@/components/shared/orderService";

// The support desk's read-only view of orders (GET /support/orders, /support/orders/:id).
// Built server-side by backend/src/modules/support/support.orders.view.ts: every phone
// number arrives masked ("98xxxxx210") and handover codes (delivery OTP, pickup code,
// helper PIN) are never sent.

export type SupportStatusGroup = "active" | "completed" | "cancelled";

export interface SupportOrderRow {
  _id: string;
  status: string;
  kind: OrderServiceKind;
  serviceType: string;
  createdAt: string | null;
  customer: { _id: string | null; name: string | null; phone: string | null } | null;
  driverName: string | null;
  outletName: string | null;
  from: string | null;
  to: string | null;
  total: number;
  paymentMethod: "cash" | "online" | null;
  paymentStatus: "pending" | "paid" | "cash_collected" | null;
  refundStatus: string | null;
}

export interface SupportOrderPage {
  orders: SupportOrderRow[];
  total: number;
  page: number;
  limit: number;
}

export interface SupportOrderSearchParams {
  q?: string;
  status?: SupportStatusGroup;
  kind?: OrderServiceKind;
  customerId?: string;
  driverUserId?: string;
  vendorId?: string;
  page?: number;
  limit?: number;
}

interface MaskedContact {
  name: string | null;
  phone: string | null;
}

export interface SupportOrder {
  _id: string;
  status: string;
  kind: OrderServiceKind;
  serviceType: string;
  createdAt: string | null;
  updatedAt: string | null;
  customer: { _id: string | null; name: string | null; phone: string | null };
  bookingFor: { type: "myself" | "someone_else"; contactNumber: string | null } | null;
  driver: { _id: string | null; name: string | null; phone: string | null; vehicleType: string | null } | null;
  outlet: { _id: string; name: string | null; phone: string | null; address: string | null; partnerType: "food" | "meat" } | null;
  stops: { sequence: number; type: string; address: string | null; instructions: string | null; location: { coordinates: [number, number] } | null }[];
  items: { name: string; quantity: number; price: number }[];
  packageDelivery: { payAt: "pickup" | "drop"; pickupContact: MaskedContact | null; dropContact: MaskedContact | null } | null;
  pricing: {
    total: number;
    customerPrice: number | null;
    breakdown: { baseFare?: number; distanceFare?: number; timeFare?: number; surgeMultiplier?: number; total?: number } | null;
    couponCode: string | null;
    discountAmount: number;
    distanceKm: number | null;
    durationMinutes: number | null;
  };
  payment: { method: "cash" | "online" | null; status: string | null; cashCollected: boolean; cashCollectedAt: string | null; cashCollectedAmount: number | null };
  refund: {
    status: string;
    amount: number | null;
    method: string | null;
    reference: string | null;
    requestedAt: string | null;
    completedAt: string | null;
    failureReason: string | null;
  } | null;
  schedule: { scheduledFor: string | null; status: string | null; rejectionReason: string | null } | null;
  cancelReason: string | null;
  timeline: Record<
    | "createdAt"
    | "restaurantAcceptBy"
    | "restaurantAcceptedAt"
    | "foodReadyAt"
    | "driverAcceptedAt"
    | "assignConfirmedAt"
    | "taskStartedAt"
    | "taskCompletedAt"
    | "searchExhaustedAt"
    | "updatedAt",
    string | null
  > & { prepMinutes: number | null };
  dispatch: { state: string; attempts: number; candidateCount: number; failureReason: string | null } | null;
  isReviewed: boolean;
}

export interface SupportOrderChatMessage {
  role: string;
  text: string;
  time: string;
  createdAt: string;
}

/** What ServiceBadge needs to label an order, rebuilt from the server's `kind`. */
export function serviceFieldsOf(order: { kind: OrderServiceKind; serviceType: string }): OrderServiceFields {
  return {
    serviceType: order.serviceType,
    packageDelivery: order.kind === "packageDelivery" ? {} : undefined,
    vendor: order.kind === "food" ? true : undefined,
  };
}

export const formatDateTime = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleString([], { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
};

export const rupees = (value?: number | null) => `₹${(Number(value) || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

const FINISHED = ["DELIVERED", "COMPLETED", "delivered", "completed"];

/** StatusBadge colour for an order status. */
export function orderStatusVariant(status: string): "delivered" | "suspended" | "transit" | "assigned" {
  if (FINISHED.includes(status)) return "delivered";
  if (status === "CANCELLED" || status === "cancelled") return "suspended";
  if (["ON_THE_WAY", "IN_TRANSIT", "en_route_delivery", "arrived_delivery", "IN_PROGRESS", "in_progress"].includes(status)) return "transit";
  return "assigned";
}

/** The query that lists a ticket owner's orders: customers by user, drivers by their user, outlets by id. */
export function ticketOwnerFilter(ticket: { userId?: string | null; userRole?: string }): Partial<SupportOrderSearchParams> | null {
  if (!ticket.userId) return null;
  if (ticket.userRole === "DRIVER") return { driverUserId: ticket.userId };
  if (ticket.userRole === "VENDOR") return { vendorId: ticket.userId };
  if (ticket.userRole === "ADMIN") return null;
  return { customerId: ticket.userId };
}
