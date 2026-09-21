import { router } from "expo-router";
import { useDeliveryStore } from "@/contexts/deliveryStore";
import { RIDE_TYPES, readStopLines, resolveServiceKey } from "./useOrders.shared";

// Split out of useOrders so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

export function useOrdersHandleReorder(reorderIntoCart: any) {
  const handleReorder = (order: any) => {
    const serviceKey = order.__serviceKey || resolveServiceKey(order);

    if (RIDE_TYPES.includes(order.serviceType)) {
      const pickup = order.stops?.find((s: any) => s.type === "pickup") || order.stops?.[0];
      const drop = order.stops?.find((s: any) => s.type === "drop") || order.stops?.[order.stops.length - 1];
      if (!pickup || !drop) return;
      router.push({
        pathname: "/ride-confirmation",
        params: {
          serviceId: order.serviceType,
          pickupName: pickup.address || "Pickup",
          pickupLat: String(pickup.location?.coordinates?.[1] || 0),
          pickupLng: String(pickup.location?.coordinates?.[0] || 0),
          dropName: drop.address || "Drop",
          dropLat: String(drop.location?.coordinates?.[1] || 0),
          dropLng: String(drop.location?.coordinates?.[0] || 0),
        },
      });
      return;
    }

    if (order.serviceType === "helper") {
      router.push("/helper-task");
      return;
    }

    if (serviceKey === "food" || serviceKey === "meat") {
      void reorderIntoCart(order, serviceKey);
      return;
    }

    // Package delivery — prefill the real multi-stop entry screen instead
    // of routing it through the food-cart flow it doesn't belong to.
    const { resetDelivery, addStop } = useDeliveryStore.getState();
    resetDelivery();
    (order.stops || [])
      .filter((s: any) => s.type !== "pickup")
      .forEach((s: any) => {
        const stopItems = readStopLines(s).map((line: any) => ({
          id: String(line?.id || line?._id || ""),
          name: String(line?.name || "Item"),
          quantity: Math.max(1, Math.round(Number(line?.quantity) || 1)),
          estimatedPrice: line?.estimatedPrice ?? line?.price,
        }));
        addStop(s.address || "Stop", undefined, stopItems, s.location?.coordinates?.[1], s.location?.coordinates?.[0]);
      });
    router.push("/delivery/entry");
  };

  return { handleReorder };
}
