import { useEffect, useState } from "react";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/contexts/authStore";
import { usePackageDeliveryStore, type PackageDeliveryPointKind } from "@/contexts/packageDeliveryStore";
import { checkZone } from "@/services/places.service";
import { showAlert } from "@/components/ui/AppAlert";
import { createPackageDeliveryHomeStyles } from "./packageDeliveryHome.styles";
import { usePackageDeliveryTheme } from "./usePackageDeliveryTheme";
import { locateDevice, toPhone10 } from "./packageDelivery.utils";

// State and handlers for app/package-delivery.tsx: where the package is collected and where
// it goes. Pickup starts at the customer's own location, with their own contact.

export function usePackageDeliveryHome() {
  const { t } = useTranslation();
  const { insets, tokens, accent, styles } = usePackageDeliveryTheme(createPackageDeliveryHomeStyles);
  const user = useAuthStore((s) => s.user);
  const pickup = usePackageDeliveryStore((s) => s.pickup);
  const drop = usePackageDeliveryStore((s) => s.drop);
  const swap = usePackageDeliveryStore((s) => s.swap);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (usePackageDeliveryStore.getState().pickup) return;
    let cancelled = false;
    setLocating(true);
    (async () => {
      try {
        const here = await locateDevice();
        if (cancelled || !here || usePackageDeliveryStore.getState().pickup) return;
        // Outside every zone there's nobody to send — leave pickup for the customer to choose.
        const zone = await checkZone(here.lat, here.lng).catch(() => null);
        if (cancelled || (zone && !zone.inZone)) return;
        usePackageDeliveryStore.getState().setPoint("pickup", {
          address: here.address,
          lat: here.lat,
          lng: here.lng,
          contactName: user?.name || "",
          contactPhone: toPhone10(user?.phone),
          fromCurrentLocation: true,
        });
      } catch (error) {
        console.warn("Package delivery: could not read the current location", error);
      } finally {
        if (!cancelled) setLocating(false);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openSearch = (kind: PackageDeliveryPointKind) => router.push({ pathname: "/package-delivery/search", params: { kind } });

  /** Edits the contact and house number of a point that's already chosen. */
  const editDetails = (kind: PackageDeliveryPointKind) => router.push({ pathname: "/package-delivery/details", params: { kind, edit: "1" } });

  const goToVehicles = () => {
    if (!pickup || !drop) return;
    if (!pickup.contactName || !pickup.contactPhone) {
      editDetails("pickup");
      return;
    }
    router.push("/package-delivery/confirm");
  };

  const showProhibitedItems = () => showAlert(t("app.packageDelivery.prohibitedTitle"), t("app.packageDelivery.prohibitedBody"));
  const showTerms = () => showAlert(t("app.packageDelivery.termsTitle"), t("app.packageDelivery.termsBody"));

  return {
    insets, tokens, accent, styles, pickup, drop, locating, swap,
    openSearch, editDetails, goToVehicles, showProhibitedItems, showTerms,
  };
}
