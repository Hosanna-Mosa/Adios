// Delivery domain types. Split out of contexts/deliveryStore.ts unchanged.

export interface SelectedDeliveryAddress {
  _id?: string;
  label?: string;
  addressLine: string;
  phone?: string;
  receiverName?: string;
  receiverPhone?: string;
  landmark?: string;
  coordinates?: { lat: number; lng: number } | null;
  location?: { type: string; coordinates: number[] } | null;
}

export interface DeliveryItem {
  id: string;
  name: string;
  quantity: number;
  /** The customer's own estimate of this item's price — never a price we control or verify. */
  estimatedPrice?: number;
}

export interface DeliveryStop {
  id: string;
  address: string;
  storeName?: string;
  items: DeliveryItem[];
  lat?: number;
  lng?: number;
  type?: string;
}

export interface RouteInfo {
  totalDistance: number;
  estimatedTime: number;
  polyline?: string;
}

export interface PriceBreakdown {
  baseFee: number;
  distanceCost: number;
  stopCharges: number;
  total: number;
}

export interface ChatMessage {
  id: string;
  sender: "customer" | "driver";
  text: string;
  timestamp: string;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "driver_assigned"
  | "en_route_pickup"
  | "arrived_pickup"
  | "picking_items"
  | "en_route_delivery"
  | "arrived_delivery"
  | "delivered"
  | "cancelled";

/**
 * Where a restaurant food order stands before a delivery partner is assigned —
 * something `status` alone can't say: "awaiting_restaurant" until the restaurant
 * accepts (it has 2 minutes, or the order is cancelled), then "preparing" while the
 * food is cooked and a partner is found. null for every other order and stage.
 */
export type FoodStage = "awaiting_restaurant" | "preparing" | null;

export interface DeliveryState {
  stops: DeliveryStop[];
  route: RouteInfo | null;
  price: PriceBreakdown | null;
  status: OrderStatus;
  foodStage: FoodStage;
  /** Who cancelled the current order (backend `cancelReason`), once it is cancelled. */
  cancelReason: string | null;
  scheduling: "asap" | "scheduled";
  loadType: "package" | "grocery" | "fragile" | "mixed";
  paymentMethod: string;
  currentLocation: string;
  currentCoords: { lat: number; lng: number } | null;
  currentOrderId: string | null;
  serviceType: string | null;
  driver: any | null;
  activeChat: ChatMessage[];
  unreadCount: number;
  isChatActive: boolean;
  vendorId: string | null;
  selectedAddress: SelectedDeliveryAddress | null;
  setCurrentLocation: (address: string) => void;
  setCurrentCoords: (coords: { lat: number; lng: number }) => void;
  /** Sets the chosen delivery address and mirrors it to AsyncStorage. Pass null to clear it. */
  setSelectedAddress: (address: SelectedDeliveryAddress | null) => void;
  /** Reads the mirrored address back into the store — the store itself is not persisted. */
  hydrateSelectedAddress: () => Promise<void>;
  setOrderId: (id: string | null) => void;
  setServiceType: (type: string | null) => void;
  setDriver: (driver: any) => void;
  setVendorId: (id: string | null) => void;
  addStop: (address: string, storeName?: string, items?: DeliveryItem[], lat?: number, lng?: number) => void;
  removeStop: (id: string) => void;
  reorderStops: (from: number, to: number) => void;
  addItemToStop: (stopId: string, item: DeliveryItem) => void;
  removeItemFromStop: (stopId: string, itemId: string) => void;
  updateStop: (stopId: string, data: Partial<DeliveryStop>) => void;
  setScheduling: (s: "asap" | "scheduled") => void;
  setLoadType: (t: "package" | "grocery" | "fragile" | "mixed") => void;
  calculateRoute: () => void;
  calculatePrice: () => void;
  setStatus: (status: OrderStatus) => void;
  setFoodStage: (foodStage: FoodStage) => void;
  setCancelReason: (cancelReason: string | null) => void;
  setRoute: (route: RouteInfo) => void;
  setStops: (stops: DeliveryStop[]) => void;
  resetDelivery: () => void;
  addChatMessage: (msg: ChatMessage) => void;
  setChatMessages: (msgs: ChatMessage[]) => void;
  clearChat: () => void;
  setUnreadCount: (count: number) => void;
  incrementUnreadCount: () => void;
  setIsChatActive: (active: boolean) => void;
}
