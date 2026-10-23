export type OrderScope = "ongoing" | "past";

export interface DriverOrderStop {
  _id?: string;
  type: string;
  address?: string;
  items?: any;
}

/** An order as `GET /orders/driver/orders` and `GET /orders/:id` return it (only the fields the screens read). */
export interface DriverOrder {
  _id: string;
  status: string;
  serviceType?: string;
  createdAt: string;
  updatedAt?: string;
  totalPrice?: number;
  totalDistance?: number;
  duration?: number;
  paymentMethod?: "cash" | "online";
  paymentStatus?: string;
  cancelReason?: string | null;
  user?: { name?: string; phone?: string } | null;
  vendor?: { _id?: string; name?: string; partnerType?: string } | string | null;
  outlet?: { name?: string } | null;
  stops?: DriverOrderStop[];
  items?: { name?: string; quantity?: number }[];
  /** Set on a bike/auto job booked as a package delivery. */
  packageDelivery?: unknown;
}
