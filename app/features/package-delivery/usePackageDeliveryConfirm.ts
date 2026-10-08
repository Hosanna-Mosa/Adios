import { useEffect, useRef, useState } from "react";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/contexts/authStore";
import { useDeliveryStore } from "@/contexts/deliveryStore";
import { usePackageDeliveryStore } from "@/contexts/packageDeliveryStore";
import { getPaymentMethod, usePaymentMethodStore } from "@/contexts/paymentMethodStore";
import { createOrder } from "@/services/orders.service";
import { describePaymentError, payOnlineAndPlaceOrder } from "@/utils/razorpay";
import { showAlert } from "@/components/ui/AppAlert";
import { createPackageDeliveryConfirmStyles } from "./packageDeliveryConfirm.styles";
import { usePackageDeliveryTheme } from "./usePackageDeliveryTheme";
import { usePackageDeliveryTrip } from "./usePackageDeliveryTrip";
import { distanceKm, fullAddress } from "./packageDelivery.utils";

// State and handlers for app/package-delivery/confirm.tsx. The package delivery is booked as a bike or auto
// ride carrying a `packageDelivery` block (contacts, where cash is paid), so from here on it
// follows the ride screens: finding a captain, then live tracking.

/** Closer than this, pickup and drop are the same place. */
const MIN_TRIP_KM = 0.1;

export function usePackageDeliveryConfirm() {
  const { t } = useTranslation();
  const { insets, tokens, accent, styles } = usePackageDeliveryTheme(createPackageDeliveryConfirmStyles);
  const pickup = usePackageDeliveryStore((s) => s.pickup);
  const drop = usePackageDeliveryStore((s) => s.drop);
  const vehicle = usePackageDeliveryStore((s) => s.vehicle);
  const payAt = usePackageDeliveryStore((s) => s.payAt);
  const setVehicle = usePackageDeliveryStore((s) => s.setVehicle);
  const setPayAt = usePackageDeliveryStore((s) => s.setPayAt);
  const paymentMethod = usePaymentMethodStore((s) => s.methods.packageDelivery);
  const [booking, setBooking] = useState(false);
  // Set once the order is placed: the store is cleared on the way out, which must not
  // read as "opened without a route".
  const placed = useRef(false);
  const trip = usePackageDeliveryTrip(pickup, drop);
  // The map frames the route above the sheet, so it needs the sheet's measured height.
  const [sheetHeight, setSheetHeight] = useState(420);
  const [fitKey, setFitKey] = useState(0);

  // Opened without both ends (a stale back-stack entry): start over.
  useEffect(() => {
    if (!placed.current && (!pickup || !drop)) router.replace("/package-delivery");
  }, [pickup, drop]);

  const tooShort = !!pickup && !!drop && distanceKm(pickup, drop) < MIN_TRIP_KM;
  const fare = trip.fares[vehicle]?.fareBreakdown?.total;
  const canBook = !!pickup && !!drop && !tooShort && fare != null && !booking;

  const book = async () => {
    if (!pickup || !drop || !canBook) return;
    const { user, token } = useAuthStore.getState();
    if (!user || !token) {
      showAlert(t("app.delivery.loginRequired"), t("app.packageDelivery.loginToBook"));
      return;
    }
    setBooking(true);
    try {
      const isOnline = getPaymentMethod("packageDelivery") === "online";
      const orderBody = {
        serviceType: vehicle,
        stops: [
          { address: fullAddress(pickup), latitude: pickup.lat, longitude: pickup.lng, type: "pickup" },
          { address: fullAddress(drop), latitude: drop.lat, longitude: drop.lng, type: "drop" },
        ],
        packageDelivery: {
          // Prepaid package deliveries have nothing to collect; "pickup" just keeps the field valid.
          payAt: isOnline ? "pickup" : payAt,
          pickupContact: { name: pickup.contactName, phone: pickup.contactPhone },
          dropContact: { name: drop.contactName, phone: drop.contactPhone },
        },
      };
      const order: any = isOnline
        ? await payOnlineAndPlaceOrder(Math.round(fare!), orderBody)
        : await createOrder({ ...orderBody, paymentMethod: "cash" });

      // Tracked globally from here, the same as a ride — see useRideConfirmationPlaceOrder.
      const { setOrderId, setServiceType, setStatus } = useDeliveryStore.getState();
      setOrderId(order._id);
      setServiceType(vehicle);
      setStatus("confirmed");
      placed.current = true;
      // Home underneath "Finding your captain", not this booking flow.
      router.dismissAll();
      router.push({ pathname: "/finding-driver", params: { orderId: order._id } });
      usePackageDeliveryStore.getState().reset();
    } catch (error: any) {
      const described = describePaymentError(error);
      showAlert(described?.title ?? t("app.packageDelivery.bookingFailed"), described?.message ?? error?.message ?? t("app.packageDelivery.tryAgain"), undefined, "error");
    } finally {
      setBooking(false);
    }
  };

  return {
    insets, tokens, accent, styles, pickup, drop, vehicle, setVehicle, payAt, setPayAt, paymentMethod,
    ...trip, tooShort, fare, canBook, booking, book, sheetHeight, setSheetHeight,
    fitKey, recenter: () => setFitKey((k) => k + 1), editRoute: () => router.back(),
  };
}
