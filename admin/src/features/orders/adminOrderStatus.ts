// Maps the raw backend order-status enum (used for filtering/variant logic — never translate the
// value itself) to a translated display label. Shared across the Orders + Payments admin screens.
const ADMIN_ORDER_STATUS_LABEL_KEY: Record<string, string> = {
  SEARCHING_DRIVER: "orderStatus.searchingDriver",
  DRIVER_ASSIGNED: "orderStatus.driverAssigned",
  PICKED_UP: "orders.pickedUp",
  IN_TRANSIT: "orders.inTransit",
  DELIVERED: "orderStatus.delivered",
  CANCELLED: "orders.cancelled",
  COMPLETED: "orders.completed",
  PENDING: "orders.pending",
  SETTLED: "orders.settled",
};

export const adminOrderStatusLabel = (status: string, t: (key: string) => string): string => {
  const key = ADMIN_ORDER_STATUS_LABEL_KEY[status];
  return key ? t(key) : status;
};
