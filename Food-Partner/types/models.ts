// Shapes of what the backend sends the partner app. Field names match the
// API exactly (see backend/src/modules/{vendors,meat,orders,food,support}).

/** restaurant_vendor → a Vendor document; meat_vendor → a Vendor (partnerType "meat") or MeatCenter. */
export type PartnerRole = "restaurant_vendor" | "meat_vendor";

/** What /vendors/login and /meat/login return, minus the token. */
export interface PartnerSession {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  role: PartnerRole;
  partnerType?: "food" | "meat";
}

export interface OrderItemLine {
  name: string;
  quantity: number;
  price: number;
}

export interface OrderStop {
  type: string;
  address?: string;
  items?: {
    lines?: OrderItemLine[];
    deliveryAddress?: { formattedAddress?: string };
  };
}

export interface PartnerOrder {
  _id: string;
  status: string;
  totalPrice: number;
  createdAt: string;
  updatedAt?: string;
  restaurantPickupCode?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  /** Populated by GET /orders/vendor/:id, a bare id from GET /orders/:id. */
  user?: string | { _id?: string; name?: string; phone?: string } | null;
  stops?: OrderStop[];
  /** Populated by some endpoints, a bare id by others (GET /orders/vendor/:id). */
  driver?: string | { user?: { name?: string; phone?: string }; vehicleType?: string } | null;
  /**
   * "broadcast" = a restaurant food order. The kitchen accepts it with a prep time,
   * which starts the rider search. Every other order (meat, older orders) has no
   * accept step and only "Mark as ready".
   */
  dispatchMode?: "sequential" | "broadcast";
  /** A new food order not accepted by this time is cancelled automatically. */
  restaurantAcceptBy?: string | null;
  restaurantAcceptedAt?: string | null;
  /** Set when the system cancelled it: "restaurant_timeout" | "restaurant_rejected". */
  cancelReason?: string | null;
  /** The prep time the kitchen quoted on accept, in minutes. */
  prepMinutes?: number | null;
  /** When the kitchen marked the food ready. */
  foodReadyAt?: string | null;
}

export type ScheduledRequestStatus = "pending" | "accepted" | "rejected";

export interface ScheduledRequest {
  requestId: string;
  vendorId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  scheduledFor: string;
  status: ScheduledRequestStatus;
  respondedAt?: string;
  createdAt: string;
}

/** Pushed over the socket when a customer asks for a scheduled delivery. */
export interface ScheduledRequestAlert {
  requestId: string;
  customerName?: string;
  customerPhone?: string;
  scheduledFor: string;
}

export interface FoodItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isVeg: boolean;
  images: string[];
  isAvailable?: boolean;
}

export interface FoodItemInput {
  name: string;
  description: string;
  price: string;
  category: string;
  isVeg: boolean;
  images: string[];
}

export interface MeatItem {
  _id: string;
  name: string;
  weight: string;
  price: number;
  category: string;
  image?: string;
  isAvailable: boolean;
  isGlobalItem?: boolean;
}

export interface ChatMessage {
  sender: "user" | "admin" | "system";
  time: string;
  text: string;
}

export type TicketStatus = "OPEN" | "RESOLVED" | "PENDING_RESOLVE";

export interface SupportTicket {
  _id: string;
  ticketId: string;
  title: string;
  category: string;
  status: TicketStatus;
  message: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

/** GET /vendors/me — the outlet's own record, read fresh from the database. */
export interface PartnerProfile extends PartnerSession {
  address?: string;
  image?: string;
  /** Average customer rating; 0 until the outlet has reviews. */
  rating?: number;
  /** Review count — stored as a string on the backend model. */
  reviews?: string | number;
  /** Cuisines the outlet registered with, e.g. "Biryani", "North Indian". */
  categories?: string[];
  isPureVeg?: boolean;
  /** The partner's own "Accepting orders" switch, turned off. */
  isManuallyClosed?: boolean;
  /** The Flavour team's switch — false closes the outlet whatever the partner sets. */
  isOpen?: boolean;
  /** Whether customers can order right now: opening hours plus both switches. */
  openState?: { isOpen: boolean; label: string; today: string | null };
}

/** pending = requested, processing = with the bank, processed = paid, failed = rejected or bounced. */
export type PayoutStatus = "pending" | "processing" | "processed" | "failed";

export interface Payout {
  _id: string;
  amount: number;
  status: PayoutStatus;
  requestedAt: string;
  paidAt?: string;
  /** Bank reference (UTR) once paid. */
  reference?: string;
  /** Why the Flavour team rejected it, when they did. */
  note?: string;
}

/** GET /vendors/me/payouts — backend/src/modules/vendors/vendor-payouts.controller.ts. */
export type PayoutSummary =
  | { payoutsEnabled: false }
  | {
      payoutsEnabled: true;
      minimumAmount: number;
      commissionRate: number;
      balance: {
        /** The outlet's share of paid, delivered orders — after commission. */
        earnedShare: number;
        /** Requested, in progress and paid payouts. */
        paidOut: number;
        availableBalance: number;
      };
      /** Only the last four digits ever reach the app. */
      bankAccount: { accountLast4: string; ifsc: string; accountType: "savings" | "current"; verified: boolean } | null;
      payouts: Payout[];
    };

/** POST /vendors/payout. */
export interface PayoutRequestResult {
  message: string;
  payout: { id: string; amount: number; status: PayoutStatus };
}

/** What a push notification's `data` carries — set by backend orders.service.ts. */
export type PushPayload =
  | { kind: "new_order"; orderId: string; customerName?: string; totalPrice?: number }
  | { kind: "scheduled_request"; requestId: string; customerName?: string; customerPhone?: string; scheduledFor?: string };
