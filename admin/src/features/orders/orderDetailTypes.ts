import type { OrderServiceFields } from "@/components/shared/orderService";

export interface OrderStopItem {
  name: string;
  quantity: number;
}

export interface OrderStop {
  address?: string;
  type?: string;
  location?: { coordinates?: [number, number] };
  items?: OrderStopItem[] | unknown;
}

export interface OrderDriver {
  /** The driver's User. GET /admin/orders/:id may leave it unpopulated (just an id), so read it defensively. */
  user?: { name?: string; phone?: string };
  vehicleNumber?: string;
}

export interface OrderContact {
  name?: string;
  phone?: string;
}

/** Package delivery orders (bike/auto): who hands the package over, who receives it, where cash is paid. */
export interface OrderPackageDelivery {
  payAt?: "pickup" | "drop";
  pickupContact?: OrderContact;
  dropContact?: OrderContact;
}

export interface Order extends OrderServiceFields {
  _id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  /** The customer. Populated by GET /admin/orders/:id. */
  user?: { name?: string; phone?: string } | string;
  totalPrice?: number;
  totalDistance?: number;
  paymentMethod?: "cash" | "online";
  paymentStatus?: "pending" | "paid" | "cash_collected";
  cashCollected?: boolean;
  packageDelivery?: OrderPackageDelivery | null;
  driver?: OrderDriver;
  stops?: OrderStop[];
  /** Food (broadcast) orders: the rider search, whose accepted offer records when a driver took the order. */
  dispatch?: { offers?: { outcome?: string; respondedAt?: string }[] };
}

export interface MapMarker {
  lat: number;
  lng: number;
  label: string;
  address: string;
  type?: string;
}

export interface TimelineStep {
  time: string;
  title: string;
  desc: string;
  status: "completed" | "in_progress" | "pending";
  label?: string;
}
