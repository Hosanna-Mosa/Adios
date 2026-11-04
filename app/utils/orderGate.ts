import { router } from "expo-router";
import i18n from "@/i18n";
import { useAuthStore } from "@/contexts/authStore";
import { checkZone, getNearbyDrivers } from "@/services/places.service";
import { showAlert } from "@/components/ui/AppAlert";

// Checks every order flow runs before anything is charged or created. Browsing is open to
// guests and to areas with no driver on shift; ordering is where an account and a driver are
// actually needed.

/** Same radius the Home screen used for its "riders nearby" count. */
const DRIVER_RADIUS_M = 5000;

export type OrderPoint = { lat: number; lng: number };

/** True when signed in. A guest is told why and sent to Login (Skip there returns here). */
export function requireLogin(): boolean {
  const { user, token } = useAuthStore.getState();
  if (user && token) return true;
  showAlert(i18n.t("app.auth.loginToContinueTitle"), i18n.t("app.auth.loginToContinueMessage"));
  router.push("/login");
  return false;
}

/**
 * True when `point` is inside a service zone; otherwise says so and returns false. Browsing never
 * checks this: Home lists outlets everywhere and the customer is told here, at checkout. Same
 * leniency as the driver check: an unreadable point or a failed lookup does not block the order,
 * because the server refuses an unserviceable order on its own.
 */
export async function ensureServiceable(point: OrderPoint | null | undefined): Promise<boolean> {
  const lat = Number(point?.lat);
  const lng = Number(point?.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return true;
  try {
    const result = await checkZone(lat, lng);
    if (result?.inZone === false) {
      showAlert(i18n.t("app.checkout.notServiceableTitle"), i18n.t("app.checkout.notServiceableMessage"), undefined, "warning");
      return false;
    }
  } catch (error) {
    console.warn("Service area check failed, continuing:", error);
  }
  return true;
}

/**
 * True when at least one driver is online near `point`; otherwise says so and returns false.
 * A point we cannot read, or a failed lookup, does not block the order: the server still
 * dispatches (or reports no drivers) on its own, so a flaky check must not stop a customer.
 */
export async function ensureDriversOnline(point: OrderPoint | null | undefined): Promise<boolean> {
  const lat = Number(point?.lat);
  const lng = Number(point?.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return true;
  try {
    const drivers = await getNearbyDrivers<any[]>(`latitude=${lat}&longitude=${lng}&radius=${DRIVER_RADIUS_M}`);
    if (Array.isArray(drivers) && drivers.length === 0) {
      showAlert(i18n.t("app.checkout.noDriversTitle"), i18n.t("app.checkout.noDriversMessage"), undefined, "warning");
      return false;
    }
  } catch (error) {
    console.warn("Driver availability check failed, continuing:", error);
  }
  return true;
}
