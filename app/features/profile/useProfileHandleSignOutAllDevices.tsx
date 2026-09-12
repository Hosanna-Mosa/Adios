import { Alert } from "react-native";
import { router } from "expo-router";
import { signOutAllDevices } from "@/services/users.service";

// Split out of useProfile so each file stays small. Kept in the original call
// order, so React still sees the same hook sequence.

export function useProfileHandleSignOutAllDevices(user: any, logout: any, setLoading: any, unreadCount: any, setSecurityVisible: any, setSigningOutAll: any) {
  const handleSignOutAllDevices = () => {
    Alert.alert(
      "Sign out of all devices?",
      "Every phone signed in to this account gets signed out, including this one.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign out everywhere",
          style: "destructive",
          onPress: async () => {
            try {
              setSigningOutAll(true);
              await signOutAllDevices();
            } catch (err: any) {
              console.error("Sign out of all devices error:", err);
              Alert.alert("Error", err?.message || "Couldn't sign out of all devices.");
              setSigningOutAll(false);
              return;
            }
            await logout();
            setSigningOutAll(false);
            router.replace("/login");
          },
        },
      ]
    );
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout();
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  };

  const memberSinceYear = user?.createdAt ? new Date(user.createdAt).getFullYear() : null;

  const MENU_ITEMS = [
    { key: "orders", icon: "receipt", label: "My orders", onPress: () => router.push("/(tabs)/orders") },
    { key: "personal", icon: "person-circle", label: "Personal details", onPress: () => router.push("/personal-details") },
    { key: "places", icon: "location", label: "Places", badge: user?.addresses?.length ? String(user.addresses.length) : undefined, onPress: () => router.push("/delivery/saved-addresses") },
    { key: "favorites", icon: "heart", label: "Favorites", badge: user?.favorites?.length ? String(user.favorites.length) : undefined, onPress: () => router.push("/favorites") },
    { key: "notifications", icon: "notifications", label: "Notifications", countBadge: unreadCount > 0 ? unreadCount : undefined, onPress: () => router.push("/notifications") },
    { key: "security", icon: "shield-checkmark", label: "Security", onPress: () => setSecurityVisible(true) },
    { key: "support", icon: "mail", label: "Help & support", onPress: () => router.push("/support") },
  ] as const;

  return { handleSignOutAllDevices, handleLogout, memberSinceYear, MENU_ITEMS };
}
