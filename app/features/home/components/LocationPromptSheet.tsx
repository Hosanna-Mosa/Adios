import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, AppState, Linking, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { moderateScale } from "react-native-size-matters";
import { type EdgeInsets } from "react-native-safe-area-context";
import { type ThemeTokens } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";
import { useAuthStore } from "@/contexts/authStore";
import { useDeliveryStore, type SelectedDeliveryAddress } from "@/contexts/deliveryStore";
import { getAddresses, type SavedAddress } from "@/services/users.service";

// Shown over Home after sign-in when there is no location to list outlets from (location
// permission or the device's location is off, and no saved address is chosen yet). It offers
// three ways out: turn location on, pick a saved address, or search for a place.

interface Props {
  /** Home has no usable location right now. */
  hasNoLocation: boolean;
  insets: EdgeInsets;
  tokens: ThemeTokens;
  /** Re-runs Home's location lookup. */
  refreshLocation: () => void;
}

const SAVED_SHOWN = 2;

function iconFor(label?: string): keyof typeof Ionicons.glyphMap {
  const l = (label ?? "").toLowerCase();
  if (l === "home") return "home-outline";
  if (l === "work" || l === "office") return "briefcase-outline";
  return "location-outline";
}

export function LocationPromptSheet({ hasNoLocation, insets, tokens, refreshLocation }: Props) {
  const { t } = useTranslation();
  const token = useAuthStore((s) => s.token);
  const [dismissed, setDismissed] = useState(false);
  const [saved, setSaved] = useState<SavedAddress[]>([]);
  const [enabling, setEnabling] = useState(false);
  const visible = hasNoLocation && !!token && !dismissed;

  // A new "no location" episode (e.g. after signing out and in) shows the sheet again.
  useEffect(() => {
    if (!hasNoLocation) setDismissed(false);
  }, [hasNoLocation]);

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    getAddresses()
      .then((list) => !cancelled && setSaved(Array.isArray(list) ? list : []))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [visible]);

  // Coming back from system settings with location switched on: look again.
  useEffect(() => {
    if (!visible) return;
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") refreshLocation();
    });
    return () => sub.remove();
  }, [visible, refreshLocation]);

  const enableLocation = useCallback(async () => {
    if (enabling) return;
    setEnabling(true);
    try {
      // An earlier "no" is remembered so Home does not nag; the user is asking now.
      await AsyncStorage.removeItem("gps_permission_denied");
      let perm = await Location.getForegroundPermissionsAsync();
      if (perm.status !== "granted" && perm.canAskAgain) {
        perm = await Location.requestForegroundPermissionsAsync();
      }
      if (perm.status !== "granted") {
        // Blocked for good: only the system settings can turn it back on.
        await Linking.openSettings();
        return;
      }
      if (!(await Location.hasServicesEnabledAsync())) {
        try {
          await Location.enableNetworkProviderAsync();
        } catch {
          await Linking.openSettings();
          return;
        }
      }
      refreshLocation();
    } finally {
      setEnabling(false);
    }
  }, [enabling, refreshLocation]);

  const pickSaved = (addr: SavedAddress) => {
    const lat = addr.coordinates?.lat ?? addr.location?.coordinates?.[1] ?? addr.lat;
    const lng = addr.coordinates?.lng ?? addr.location?.coordinates?.[0] ?? addr.lng;
    if (lat == null || lng == null) {
      // No coordinates stored for it: the full list lets the user fix or replace it.
      router.push("/delivery/saved-addresses");
      return;
    }
    const chosen: SelectedDeliveryAddress = {
      _id: addr._id,
      label: addr.label,
      addressLine: (addr.addressLine ?? addr.address ?? addr.label ?? "") as string,
      phone: addr.phone,
      receiverName: addr.receiverName,
      receiverPhone: addr.receiverPhone,
      landmark: addr.landmark,
      coordinates: { lat, lng },
      location: { type: "Point", coordinates: [lng, lat] },
    };
    // Home reloads on its own once there is a selected address.
    useDeliveryStore.getState().setSelectedAddress(chosen);
    useDeliveryStore.getState().setCurrentCoords({ lat, lng });
    useDeliveryStore.getState().setCurrentLocation(chosen.addressLine);
  };

  const goTo = (path: "/delivery/saved-addresses" | "/delivery/add-address") => {
    setDismissed(true);
    if (path === "/delivery/add-address") router.push({ pathname: path, params: { step: "1" } });
    else router.push(path);
  };

  const ms = moderateScale;
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={() => setDismissed(true)} statusBarTranslucent>
      <View style={s.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => setDismissed(true)} accessibilityLabel={t("actions.close", "Close")} />

        <View style={s.closeWrap} pointerEvents="box-none">
          <Pressable
            onPress={() => setDismissed(true)}
            hitSlop={8}
            style={[s.close, { backgroundColor: tokens.text }]}
            accessibilityRole="button"
            accessibilityLabel={t("actions.close", "Close")}
          >
            <Ionicons name="close" size={ms(22)} color={tokens.surface} />
          </Pressable>
        </View>

        <View style={[s.sheet, { backgroundColor: tokens.bg, paddingBottom: Math.max(insets.bottom, 12) + 12 }]}>
          <View style={[s.card, s.enableCard, { backgroundColor: tokens.surface, borderColor: tokens.border }]}>
            <View style={[s.iconCircle, { backgroundColor: tokens.brandSkin }]}>
              <MaterialIcons name="location-off" size={ms(24)} color={tokens.brand} />
            </View>
            <View style={s.enableText}>
              <Text style={[s.title, { color: tokens.text }]}>{t("app.home.locationOffTitle", "Device location not enabled")}</Text>
              <Text style={[s.sub, { color: tokens.sec }]}>{t("app.home.locationOffSub", "Turn on your device location for a better delivery")}</Text>
            </View>
            <Pressable
              onPress={enableLocation}
              disabled={enabling}
              style={({ pressed }) => [s.enableBtn, { backgroundColor: pressed ? tokens.brandPressed : tokens.brand }]}
              accessibilityRole="button"
              accessibilityLabel={t("app.home.enableLocation", "Enable")}
            >
              {enabling ? <ActivityIndicator size="small" color={tokens.onBrand} /> : <Text style={[s.enableBtnText, { color: tokens.onBrand }]}>{t("app.home.enableLocation", "Enable")}</Text>}
            </Pressable>
          </View>

          {saved.length > 0 && (
            <>
              <View style={s.sectionRow}>
                <Text style={[s.section, { color: tokens.text }]}>{t("app.home.selectSavedAddress", "Select a saved address")}</Text>
                <Pressable onPress={() => goTo("/delivery/saved-addresses")} hitSlop={8} accessibilityRole="button">
                  <Text style={[s.seeAll, { color: tokens.brand }]}>{t("app.home.seeAll", "See all")}</Text>
                </Pressable>
              </View>
              {saved.slice(0, SAVED_SHOWN).map((addr, i) => (
                <Pressable
                  key={String(addr._id ?? addr.id ?? i)}
                  onPress={() => pickSaved(addr)}
                  style={({ pressed }) => [s.card, s.row, { backgroundColor: pressed ? tokens.sunken : tokens.surface, borderColor: tokens.border }]}
                  accessibilityRole="button"
                >
                  <Ionicons name={iconFor(addr.label)} size={ms(20)} color={tokens.text} />
                  <View style={s.rowText}>
                    <Text style={[s.rowTitle, { color: tokens.text }]} numberOfLines={1}>{addr.label || t("app.home.savedAddress", "Saved address")}</Text>
                    <Text style={[s.sub, { color: tokens.sec }]} numberOfLines={1}>{addr.addressLine ?? addr.address ?? ""}</Text>
                  </View>
                </Pressable>
              ))}
            </>
          )}

          <Pressable
            onPress={() => goTo("/delivery/add-address")}
            style={({ pressed }) => [s.card, s.row, { backgroundColor: pressed ? tokens.sunken : tokens.surface, borderColor: tokens.border, marginTop: saved.length ? 0 : ms(14) }]}
            accessibilityRole="button"
          >
            <Ionicons name="search" size={ms(20)} color={tokens.brand} />
            <Text style={[s.search, { color: tokens.muted }]}>{t("app.home.searchLocationManually", "Search location manually")}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const ms = moderateScale;
const s = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(23,23,23,0.55)" },
  closeWrap: { alignItems: "center", marginBottom: ms(14) },
  close: { width: ms(40), height: ms(40), borderRadius: ms(20), alignItems: "center", justifyContent: "center" },
  sheet: { borderTopLeftRadius: ms(24), borderTopRightRadius: ms(24), paddingTop: ms(16), paddingHorizontal: ms(14), gap: ms(10) },
  card: { borderWidth: StyleSheet.hairlineWidth, borderRadius: ms(14) },
  enableCard: { flexDirection: "row", alignItems: "center", padding: ms(12), gap: ms(12), marginBottom: ms(4) },
  iconCircle: { width: ms(44), height: ms(44), borderRadius: ms(22), alignItems: "center", justifyContent: "center" },
  enableText: { flex: 1 },
  title: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small },
  sub: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.small, marginTop: 2 },
  enableBtn: { minWidth: ms(76), minHeight: ms(38), paddingHorizontal: ms(14), borderRadius: ms(10), alignItems: "center", justifyContent: "center" },
  enableBtnText: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small },
  sectionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: ms(8) },
  section: { fontFamily: fontFamilies.heading.bold, fontSize: typography.sizes.medium },
  seeAll: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small },
  row: { flexDirection: "row", alignItems: "center", gap: ms(14), paddingHorizontal: ms(14), paddingVertical: ms(14), minHeight: ms(56) },
  rowText: { flex: 1 },
  rowTitle: { fontFamily: fontFamilies.body.bold, fontSize: typography.sizes.small },
  search: { fontFamily: fontFamilies.body.regular, fontSize: typography.sizes.small },
});
