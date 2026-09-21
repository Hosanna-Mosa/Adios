import { useEffect, useState } from "react";
import { Alert, Linking } from "react-native";
import { router } from "expo-router";
import { useDriverStore } from "@/store/driverStore";
import { API_URL as apiUrl } from "@/utils/apiUrl";
import type { Hotspot } from "../components/HighDemandAreas";

/** Going on and off duty, and opening a demand area in Google Maps.
 *
 * Going online is gated on identity verification — the driver is sent to the
 * verify screen rather than silently refused. Lifted out of the home screen. */
export function useOnlineActions({ onServicesChosen }: { onServicesChosen: (mode: "ride" | "delivery") => void }) {
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
      if (!supported) throw new Error("Google Maps link is not supported");
      await Linking.openURL(url);
    } catch {
      Alert.alert("Unable to open maps", "Please try again from this device.");
    }
  };

  const handleToggleOnline = () => {
    if (isOnline) {
      Alert.alert(
        "Go Offline",
        "Are you sure you want to go offline? You will stop receiving new requests.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Go Offline", style: "destructive", onPress: () => goOffline() }
        ]
      );
      return;
    }

    // Check identity verification before allowing go-online
    if (!identityVerified) {
      Alert.alert(
        "Identity Verification Required",
        "To start receiving orders, you must verify at least one government ID (Aadhaar or PAN Card).",
        [
          { text: "Not Now", style: "cancel" },
          {
            text: "Verify Now",
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
