import i18n from "@/i18n";

/**
 * Who cancelled an order, as the backend records it on `order.cancelReason` and
 * sends as `reason` with the CANCELLED status update.
 */
export type CancelReason =
  | "restaurant_rejected"
  | "restaurant_timeout"
  | "driver_cancelled"
  | "admin_cancelled"
  | "customer_cancelled";

/**
 * What to tell the customer about a cancelled order, by who cancelled it.
 * Unknown or missing reasons (orders cancelled before reasons were recorded)
 * get a neutral notice rather than guessing at someone to blame.
 */
export function cancellationNotice(reason?: string | null): { title: string; message: string } {
  switch (reason) {
    case "restaurant_rejected":
      return { title: i18n.t("app.ride.cancelledByRestaurant"), message: i18n.t("app.ride.restaurantCouldNotTakeOrder") };
    case "restaurant_timeout":
      return { title: i18n.t("app.ride.cancelledByRestaurant"), message: i18n.t("app.ride.restaurantDidNotAcceptInTime") };
    case "driver_cancelled":
      return { title: i18n.t("app.ride.cancelledByRider"), message: i18n.t("app.ride.riderCancelledOrder") };
    case "admin_cancelled":
      return { title: i18n.t("app.ride.cancelledByAdios"), message: i18n.t("app.ride.adiosCancelledOrder") };
    case "customer_cancelled":
      return { title: i18n.t("app.ride.orderCancelled"), message: i18n.t("app.ride.youCancelledThisOrder") };
    default:
      return { title: i18n.t("app.ride.orderCancelled"), message: i18n.t("app.ride.wereSorryThisOrderCouldNot") };
  }
}
