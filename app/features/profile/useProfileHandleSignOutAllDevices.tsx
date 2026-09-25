import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { useLanguageStore } from "@/contexts/languageStore";
import { signOutAllDevices } from "@/services/users.service";

// Split out of useProfile so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

export function useProfileHandleSignOutAllDevices(user: any, logout: any, setLoading: any, unreadCount: any, setSecurityVisible: any, setSigningOutAll: any) {
  const { t } = useTranslation();

  const handleSignOutAllDevices = () => {
    Alert.alert(
      t("app.profile.signOutOfAllDevices"),
      t("app.profile.everyPhoneSignedInToThis"),
      [
        { text: t("actions.cancel"), style: "cancel" },
        {
          text: t("app.profile.signOutEverywhere"),
          style: "destructive",
          onPress: async () => {
            try {
              setSigningOutAll(true);
              await signOutAllDevices();
            } catch (err: any) {
              console.error("Sign out of all devices error:", err);
              Alert.alert(t("app.profile.errorTitle"), err?.message || t("app.profile.couldntSignOutAllDevices"));
              setSigningOutAll(false);
              return;
            }
            await logout();
            // Keep the persisted language choice; only the in-memory
            // "gate passed" flag resets, so Select Language reappears
            // (pre-selected) before the next Login instead of being skipped.
            useLanguageStore.getState().resetLanguageGate();
            setSigningOutAll(false);
            router.replace("/select-language");
          },
        },
      ]
    );
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout();
      useLanguageStore.getState().resetLanguageGate();
      router.replace("/select-language");
    } finally {
      setLoading(false);
    }
  };

  const memberSinceYear = user?.createdAt ? new Date(user.createdAt).getFullYear() : null;

  const MENU_ITEMS = [
    { key: "orders", icon: "receipt", label: t("app.profile.menuItems.myOrders"), onPress: () => router.push("/(tabs)/orders") },
    { key: "personal", icon: "person-circle", label: t("app.profile.menuItems.personalDetails"), onPress: () => router.push("/personal-details") },
    { key: "places", icon: "location", label: t("app.profile.menuItems.places"), badge: user?.addresses?.length ? String(user.addresses.length) : undefined, onPress: () => router.push("/delivery/saved-addresses") },
    { key: "favorites", icon: "heart", label: t("app.profile.menuItems.favorites"), badge: user?.favorites?.length ? String(user.favorites.length) : undefined, onPress: () => router.push("/favorites") },
    { key: "notifications", icon: "notifications", label: t("app.profile.menuItems.notifications"), countBadge: unreadCount > 0 ? unreadCount : undefined, onPress: () => router.push("/notifications") },
    { key: "security", icon: "shield-checkmark", label: t("app.profile.menuItems.security"), onPress: () => setSecurityVisible(true) },
    { key: "language", icon: "globe", label: t("app.profile.menuItems.language"), onPress: () => router.push("/language-settings") },
    { key: "support", icon: "mail", label: t("app.profile.menuItems.helpSupport"), onPress: () => router.push("/support") },
  ] as const;

  return { handleSignOutAllDevices, handleLogout, memberSinceYear, MENU_ITEMS };
}
