export interface VendorOrderStop {
  type: string;
  address?: string;
  items?: {
    lines?: { name: string; quantity: number; price: number }[];
    deliveryAddress?: { formattedAddress?: string };
  };
}

export interface VendorOrder {
  _id: string;
  status: string;
  totalPrice: number;
  createdAt: string;
  restaurantPickupCode?: string;
  user?: { name?: string; phone?: string };
  stops?: VendorOrderStop[];
  driver?: {
    user?: { name?: string; phone?: string };
    vehicleType?: string;
  };
  /** "broadcast" = a restaurant food order: accepted with a prep time, which starts the driver search. */
  dispatchMode?: "sequential" | "broadcast";
  /** A new food order not accepted by this time is cancelled automatically. */
  restaurantAcceptBy?: string | null;
  restaurantAcceptedAt?: string | null;
  /** Set when the system cancelled it: "restaurant_timeout" | "restaurant_rejected". */
  cancelReason?: string | null;
  prepMinutes?: number | null;
  foodReadyAt?: string | null;
  /** A booking for a later slot — the vendor isn't alerted about it as a new order. */
  isReserved?: boolean;
}

/** Prep times a restaurant can quote when accepting a food order, in minutes. */
export const PREP_TIME_OPTIONS = [10, 15, 20, 30, 45, 60];

/** A food order the restaurant hasn't accepted yet — no driver is searched for until it is. */
export const needsAcceptance = (order: VendorOrder) =>
  order.dispatchMode === "broadcast" && (order.status || "").toLowerCase() === "created" && !order.restaurantAcceptedAt;

export interface ScheduledDeliveryRequest {
  requestId: string;
  customerName?: string;
  customerPhone?: string;
  scheduledFor: string;
}

export interface StatusDisplay {
  text: string;
  color: string;
}

export interface VendorData {
  _id?: string;
  name?: string;
  role?: string;
}
