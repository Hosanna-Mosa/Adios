// Client-side shapes for the objects the API returns.
//
// These are deliberately LEANER than the Mongoose models in backend/src/database/models:
// they carry the fields this app actually reads, so a field the server stops sending
// shows up as a compile error here rather than as `undefined` on a screen. Server-only
// fields (payout records, internal flags) are omitted on purpose.
//
// Anything genuinely open-ended keeps a permissive type rather than a guessed one —
// a wrong type that compiles is worse than an honest `unknown`.

import type { OrderStatus } from "@/contexts/delivery.types";

/** Mongo ids reach the client as strings. */
export type Id = string;

/** GeoJSON as Mongo stores it: coordinates are [longitude, latitude]. */
export interface GeoPoint {
  type: string;
  coordinates: number[];
}

export type ServiceType =
  | "food"
  | "meat"
  | "ride"
  | "task"
  | "delivery"
  | "bike"
  | "auto"
  | "cab"
  | "cab_prime";

export interface OrderStop {
  sequence?: number;
  location?: GeoPoint;
  address?: string;
  storeName?: string;
  type?: string;
  items?: unknown;
  lat?: number;
  lng?: number;
}

export interface Driver {
  _id?: Id;
  id?: Id;
  name?: string;
  phone?: string;
  /** Populated user document when the server expands it. */
  user?: unknown;
  vehicleType?: string;
  /** Older payloads use `vehicle`; both are read at the call sites. */
  vehicle?: string;
  currentLocation?: GeoPoint;
  lat?: number;
  lng?: number;
  heading?: number;
}

export interface Vendor {
  _id: Id;
  name: string;
  email?: string;
  phone?: string;
  image?: string;
  address?: string;
  detailedAddress?: Record<string, string | undefined>;
  location?: GeoPoint;
  rating?: number;
  /** The API sends this as a string, not a number. */
  reviews?: string;
  categories?: string[];
  /** Derived server-side for the outlet cards. */
  time?: string;
  offer?: string;
  openState?: string;
  distance?: number;
}

export interface MenuItem {
  _id: Id;
  name: string;
  description?: string;
  price: number;
  category?: string;
  isVeg?: boolean;
  images?: string[];
  image?: string;
  weight?: string;
  vendorId?: Id;
}

export interface Order {
  _id: Id;
  status: OrderStatus | string;
  serviceType: ServiceType | string;
  /** Added client-side by resolveServiceKey for theming — not sent by the API. */
  __serviceKey?: string;
  vendor?: Vendor | Id | null;
  driver?: Driver | Id | null;
  stops?: OrderStop[];
  items?: unknown[];
  totalPrice?: number;
  customerPrice?: number;
  totalDistance?: number;
  duration?: number;
  radius?: number;
  polyline?: string;
  createdAt?: string;
  scheduledFor?: string | null;
  scheduleStatus?: "pending" | "accepted" | "rejected" | null;
  scheduleRejectionReason?: string;
  restaurantPickupCode?: string;
  startOtp?: string | number;
  deliveryOtp?: string | number;
  isReviewed?: boolean;
}

export interface Banner {
  _id: Id;
  title?: string;
  description?: string;
  imageUrl?: string;
  /** "ad" | "offer" — decides whether it renders as a promo card or a modal. */
  itemType?: string;
  /** "startup" | "below_greetings" | … — where on the home screen it belongs. */
  position?: string;
  displayOrder?: number;
  isActive?: boolean;
}
