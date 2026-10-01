import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

/** AsyncStorage mirror of `selectedAddress`, kept for the screens that still read the raw key. */
import type {
  ChatMessage, DeliveryItem, DeliveryState, DeliveryStop, OrderStatus,
  PriceBreakdown, RouteInfo, SelectedDeliveryAddress,
} from "@/contexts/delivery.types";

export type {
  ChatMessage, DeliveryItem, DeliveryState, DeliveryStop, OrderStatus,
  PriceBreakdown, RouteInfo, SelectedDeliveryAddress,
} from "@/contexts/delivery.types";

const ACTIVE_ADDRESS_KEY = "active_address";
/** The last mirror write, so a hydrate right after a select never reads the previous value. */
let activeAddressWrite: Promise<unknown> = Promise.resolve();

/**
 * The delivery address the customer has chosen for the next order. Shaped after the
 * address subdocument returned by `GET /users/addresses`, plus the `coordinates`
 * convenience pair the address screens attach on selection.
 */
const generateId = () =>
  Date.now().toString() + Math.random().toString(36).substr(2, 9);

const initialState = {
  stops: [],
  route: null,
  price: null,
  status: "pending" as OrderStatus,
  scheduling: "asap" as const,
  loadType: "mixed" as const,
  paymentMethod: "**** 4342",
  currentLocation: "Detecting your location…",
  currentCoords: null,
  currentOrderId: null,
  serviceType: null,
  driver: null,
  activeChat: [],
  unreadCount: 0,
  isChatActive: false,
  vendorId: null,
};

export const useDeliveryStore = create<DeliveryState>((set, get) => ({
  ...initialState,
  // Deliberately outside initialState: the chosen delivery address is a standing
  // preference rather than in-progress order state, so resetDelivery() must not wipe it.
  selectedAddress: null,
  setCurrentLocation: (currentLocation) => set({ currentLocation }),
  setCurrentCoords: (currentCoords) => set({ currentCoords }),

  setSelectedAddress: (selectedAddress) => {
    set({ selectedAddress });
    activeAddressWrite = (selectedAddress
      ? AsyncStorage.setItem(ACTIVE_ADDRESS_KEY, JSON.stringify(selectedAddress))
      : AsyncStorage.removeItem(ACTIVE_ADDRESS_KEY)
    ).catch((err) => console.error("Failed to persist active address:", err));
  },

  hydrateSelectedAddress: async () => {
    try {
      await activeAddressWrite;
      const stored = await AsyncStorage.getItem(ACTIVE_ADDRESS_KEY);
      set({ selectedAddress: stored ? (JSON.parse(stored) as SelectedDeliveryAddress) : null });
    } catch (err) {
      console.error("Failed to read active address:", err);
    }
  },
  // Switching orders drops the previous order's conversation. Without this the
  // chat screen opened on a brand new task showing the last one's messages.
  setOrderId: (currentOrderId) =>
    set((state) =>
      state.currentOrderId === currentOrderId
        ? { currentOrderId }
        : { currentOrderId, activeChat: [], unreadCount: 0 }
    ),
  setServiceType: (serviceType) => set({ serviceType }),
  setDriver: (driver) => set({ driver }),
  setVendorId: (vendorId) => set({ vendorId }),

  addStop: (address: string, storeName?: string, items: DeliveryItem[] = [], lat?: number, lng?: number) => {
    set((state) => ({
      stops: [
        ...state.stops,
        {
          id: generateId(),
          address,
          storeName,
          items,
          lat,
          lng,
        },
      ],
    }));
  },

  removeStop: (id: string) => {
    set((state) => ({
      stops: state.stops.filter((s) => s.id !== id),
    }));
  },

  reorderStops: (from: number, to: number) => {
    set((state) => {
      const stops = [...state.stops];
      const [removed] = stops.splice(from, 1);
      stops.splice(to, 0, removed);
      return { stops };
    });
  },

  addItemToStop: (stopId: string, item: DeliveryItem) => {
    set((state) => ({
      stops: state.stops.map((s) =>
        s.id === stopId ? { ...s, items: [...s.items, item] } : s
      ),
    }));
  },

  removeItemFromStop: (stopId: string, itemId: string) => {
    set((state) => ({
      stops: state.stops.map((s) =>
        s.id === stopId
          ? { ...s, items: s.items.filter((i) => i.id !== itemId) }
          : s
      ),
    }));
  },

  updateStop: (stopId: string, data: Partial<DeliveryStop>) => {
    set((state) => ({
      stops: state.stops.map((s) =>
        s.id === stopId ? { ...s, ...data } : s
      ),
    }));
  },

  setScheduling: (scheduling) => set({ scheduling }),
  setLoadType: (loadType) => set({ loadType }),

  calculateRoute: () => {
    const { stops } = get();
    const totalDistance = stops.length * 2.5 + Math.random() * 3;
    const estimatedTime = Math.round(totalDistance * 4);
    set({
      route: {
        totalDistance: Math.round(totalDistance * 10) / 10,
        estimatedTime,
      },
    });
  },

  calculatePrice: () => {
    const { stops, route } = get();
    const baseFee = 2.0;
    const distanceCost = route ? Math.round(route.totalDistance * 0.6 * 100) / 100 : 4.5;
    const stopCharges = stops.length * 1.5;
    const total = Math.round((baseFee + distanceCost + stopCharges) * 100) / 100;
    set({ price: { baseFee, distanceCost, stopCharges, total } });
  },

  setStatus: (status) => set({ status }),
  setRoute: (route) => set({ route }),
  setStops: (stops) => set({ stops }),
  resetDelivery: () => set(initialState),
  addChatMessage: (msg) => set((state) => ({
    activeChat: [...state.activeChat, msg]
  })),
  setChatMessages: (activeChat) => set({ activeChat }),
  clearChat: () => set({ activeChat: [], unreadCount: 0 }),
  setUnreadCount: (unreadCount) => set({ unreadCount }),
  incrementUnreadCount: () => set((state) => ({ unreadCount: state.unreadCount + 1 })),
  setIsChatActive: (isChatActive) => set({ isChatActive }),
}));

/** Once `status` reaches either of these, there is nothing further to show for the order. */
const TERMINAL_ORDER_STATUSES: OrderStatus[] = ["delivered", "cancelled"];

/**
 * Whether the customer has an order in flight right now, regardless of which screen
 * they're on — the source for the active-order stripe above the tab bar. `currentOrderId`
 * on its own isn't enough to tell: nothing clears it once an order finishes (only the
 * next order overwrites it), so a completed/cancelled one is excluded by its terminal
 * `status` instead. `status` itself is kept live in the background by GlobalSocketHandler,
 * not just while the tracking screen happens to be open.
 */
export const useActiveOrder = () => {
  const orderId = useDeliveryStore((s) => s.currentOrderId);
  const status = useDeliveryStore((s) => s.status);
  const serviceType = useDeliveryStore((s) => s.serviceType);
  const driver = useDeliveryStore((s) => s.driver);
  const isActive = !!orderId && !TERMINAL_ORDER_STATUSES.includes(status);
  return { isActive, orderId, serviceType, status, driver };
};
