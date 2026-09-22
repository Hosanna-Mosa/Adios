import { useEffect, useState } from "react";
import { Alert, Linking } from "react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { useDriverStore } from "@/store/driverStore";
import { API_URL as apiUrl } from "@/utils/apiUrl";
import type { Hotspot } from "../components/HighDemandAreas";

/** Going on and off duty, and opening a demand area in Google Maps.
 *
 * Going online is gated on identity verification — the driver is sent to the
 * verify screen rather than silently refused. Lifted out of the home screen. */
export function useOnlineActions({ onServicesChosen }: { onServicesChosen: (mode: "ride" | "delivery") => void }) {
  const { t } = useTranslation();
  const token = useDriverStore((s) => s.token);
  const isOnline = useDriverStore((s) => s.isOnline);
  const goOffline = useDriverStore((s) => s.goOffline);
  const goOnline = useDriverStore((s) => s.goOnline);
  const identityVerified = useDriverStore((s) => s.identityVerified);
  const setIdentityVerified = useDriverStore((s) => s.setIdentityVerified);
  const [showOnlineModal, setShowOnlineModal] = useState(false);

  const openDemandAreaInMaps = async (area: Hotspot) => {
    const query = encodeURIComponent(
      Number.isFinite(area.lat) && Number.isFinite(area.lng)
        ? `${area.lat},${area.lng}`
        : area.address,
    );
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;

    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) throw new Error(t("jobs.googleMapsLinkNotSupported"));
      await Linking.openURL(url);
    } catch {
      Alert.alert(t("jobs.unableToOpenMaps"), t("jobs.pleaseTryAgainFromThisDevice"));
    }
  };

  const handleToggleOnline = () => {
    if (isOnline) {
      Alert.alert(
        t("jobs.goOffline"),
        t("jobs.areYouSureYouWantToGoOffline"),
        [
          { text: t("actions.cancel"), style: "cancel" },
          { text: t("jobs.goOffline"), style: "destructive", onPress: () => goOffline() }
        ]
      );
      return;
    }

    // Check identity verification before allowing go-online
    if (!identityVerified) {
      Alert.alert(
        t("jobs.identityVerificationRequired"),
        t("jobs.verifyAtLeastOneGovernmentId"),
        [
          { text: t("jobs.notNow"), style: "cancel" },
          {
            text: t("jobs.verifyNow"),
            onPress: () => router.push("/identity-verify"),
          },
        ]
      );
      return;
    }

    setShowOnlineModal(true);
  };

  // Load identity status from profile on mount
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const res = await fetch(`${apiUrl}/drivers/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data.verification?.identity != null) {
          setIdentityVerified(data.verification.identity);
        }
      } catch {
        // silently ignore — store defaults to false
      }
    })();
  }, [token]);

  const handleGoOnline = (services: ("food" | "ride")[]) => {
    goOnline(services);
    onServicesChosen(services[0] === "food" ? "delivery" : "ride");
  };

  return { showOnlineModal, setShowOnlineModal, openDemandAreaInMaps, handleToggleOnline, handleGoOnline };
}
