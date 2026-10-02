export type StopType = "pickup" | "delivery" | "drop" | "stop";

export interface StopItem {
  name: string;
  quantity: number;
}

export interface Stop {
  id: string;
  type: StopType;
  locationName: string;
  address: string;
  lat: number;
  lng: number;
  items?: StopItem[];
  instructions?: string;
}

export type OrderStatus =
  | "pending"
  | "accepted"
  | "driver_assigned"
  | "en_route_pickup"
  | "arrived_pickup"
  | "picking_items"
  | "picked_up"
  | "en_route_delivery"
  | "arrived_delivery"
  | "delivered"
  | "completed"
  | "CANCELLED";

export interface Order {
  id: string;
  distance: string;
  duration: string;
  earnings: number;
  stops: Stop[];
  customerName: string;
  customerPhone: string;
  status: OrderStatus;
  timestamp: Date;
  serviceType?: string;
  radius?: number;
  restaurantPickupCode?: string;
  deliveryOtp?: string;
  polyline?: string;
  vendorName?: string;
  vendorPhone?: string;
  isReserved?: boolean;
  reservedAt?: Date | string;
  /** From the backend only. "online" = already paid through Razorpay; "cash" = collect it. */
  paymentMethod?: "cash" | "online";
  paymentStatus?: "pending" | "paid" | "cash_collected";
  /** Rupees the customer owes for a cash order (the order total). */
  payableAmount?: number;
  cashCollected?: boolean;
  cashCollectedAmount?: number | null;
}

export interface CompletedOrder {
  id: string;
  earnings: number;
  distance: string;
  customerName: string;
  stops: number;
  completedAt: Date;
}

export interface ChatMessage {
  id: string;
  from: "driver" | "user";
  text: string;
  time: string;
}

export interface EarningsData {
  today: number;
  week: number;
  /** Completed trips this week — kept under its original name so existing callers
   * (Profile's "Trips" stat) don't need to change; use `todayTrips` for the
   * home screen's "Today" performance view. */
  totalDeliveries: number;
  todayTrips: number;
  weeklyBreakdown: { day: string; amount: number }[];
}

export interface DriverState {
  isOnline: boolean;
  homeMode: boolean;
  activeServices: ("food" | "ride")[];
  currentOrder: Order | null;
  incomingOrder: Order | null;
  currentStep: number;
  earnings: EarningsData;
  orderHistory: CompletedOrder[];
  driverLocation: { lat: number; lng: number } | null;
  driverName: string;
  driverPhone: string;
  driverUserId: string | null;
  token: string | null;
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  identityVerified: boolean;
  activeChat: ChatMessage[];
  unreadCount: number;
  isChatActive: boolean;

  goOnline: (services: ("food" | "ride")[]) => Promise<void>;
  goOffline: () => Promise<void>;
  toggleHomeMode: () => void;
  acceptOrder: () => void;
  rejectOrder: (reason?: string) => void;
  updateStep: (step: number) => void;
  updateOrderStatus: (status: OrderStatus, otp?: string) => Promise<void>;
  /** Records the cash the driver received; the backend checks it against the order total. */
  confirmCashCollected: (amount: number) => Promise<void>;
  completeOrder: () => void;
  setIncomingOrder: (order: Order | null) => void;
  updateDriverLocation: (lat: number, lng: number) => void;
  setAuthenticated: (name: string, phone: string, token: string, userId: string) => void;
  setOnboardingCompleted: () => void;
  setIdentityVerified: (verified: boolean) => void;
  resetOnboarding: () => void;
  logout: () => void;
  addChatMessage: (msg: ChatMessage) => void;
  /** Replaces the thread wholesale — used when the stored history is loaded. */
  setChatMessages: (msgs: ChatMessage[]) => void;
  clearChat: () => void;
  setUnreadCount: (count: number) => void;
  incrementUnreadCount: () => void;
  setIsChatActive: (active: boolean) => void;
  loginWithPassword: (phone: string, password: string) => Promise<void>;
  refreshSession: () => Promise<boolean>;
  startReservedRide: (orderId: string) => Promise<void>;
  fetchEarnings: () => Promise<void>;
}

/** zustand's `set`/`get`, narrowed to what the slice creators below use. */
export type SetDriverState = (
  partial:
    | Partial<DriverState>
    | ((state: DriverState) => Partial<DriverState>),
) => void;

export type GetDriverState = () => DriverState;
