import { API_URL as apiUrl } from "@/utils/apiUrl";
import { trackEvent } from "@/utils/analytics";
import { socketService } from "../../utils/socketService";
import { mapApiOrder } from "../orderMapper";
import type {
  CompletedOrder,
  DriverState,
  GetDriverState,
  Order,
  OrderStatus,
  SetDriverState,
} from "../types";

type Actions = Pick<
  DriverState,
  | "updateStep"
  | "updateOrderStatus"
  | "completeOrder"
  | "setIncomingOrder"
  | "updateDriverLocation"
>;

export const createOrderStatusSlice = (
  set: SetDriverState,
  get: GetDriverState,
): Actions => ({
  updateStep: (step) => {
    const { currentOrder } = get();
    if (!currentOrder) return;
    set({ currentStep: step });
  },

  updateOrderStatus: async (status: OrderStatus, otp?: string) => {
    const { currentOrder, token } = get();
    if (!currentOrder) return;

    let orderFromApi: any = null;
    if (token) {
      try {
        const res = await fetch(`${apiUrl}/orders/${currentOrder.id}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ status, otp }),
        });
        if (res.ok) {
          orderFromApi = await res.json();
        } else {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || "Failed to update status on server");
        }
      } catch (e: any) {
        console.error("Failed to update order status via API:", e);
        throw e;
      }
    }

    // Also emit via socket to ensure real-time notification
    socketService.emit("order_status_update", { orderId: currentOrder.id, status });

    trackEvent("order_status_updated", { status, service_type: currentOrder.serviceType });

    set({
      currentOrder: orderFromApi
        ? mapApiOrder(orderFromApi, currentOrder)
        : ({ ...currentOrder, status } as Order),
    });
  },

  completeOrder: () => {
    const { currentOrder, earnings, orderHistory } = get();
    if (!currentOrder) return;

    const completed: CompletedOrder = {
      id: currentOrder.id,
      earnings: currentOrder.earnings,
      distance: currentOrder.distance,
      customerName: currentOrder.customerName,
      stops: currentOrder.stops.length,
      completedAt: new Date(),
    };
    trackEvent("order_completed", {
      service_type: currentOrder.serviceType,
      value: currentOrder.earnings,
      currency: "INR",
      stops: currentOrder.stops.length,
    });

    set({
      currentOrder: null,
      currentStep: 0,
      activeChat: [],
      unreadCount: 0,
      orderHistory: [completed, ...orderHistory],
      earnings: {
        ...earnings,
        today: earnings.today + currentOrder.earnings,
        week: earnings.week + currentOrder.earnings,
        totalDeliveries: earnings.totalDeliveries + 1,
      },
    });
  },

  setIncomingOrder: (order) => set({ incomingOrder: order }),

  updateDriverLocation: (lat, lng) => set({ driverLocation: { lat, lng } }),
});
