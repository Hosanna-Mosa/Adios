import { View, Platform } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "@/contexts/authStore";
import { useThemeStore } from "@/contexts/themeStore";
import Colors from "@/constants/colors";

// The navigator itself plus the per-route animation options. Split out of
// app/_layout.tsx unchanged, so every screen keeps the transition it had.

export function RootLayoutNav() {
  const insets = useSafeAreaInsets();
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const theme = useThemeStore((s) => s.theme);
  const colors = Colors[theme];

  if (!isInitialized) {
    return null; // Or a custom Loading/Splash view
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Content colour, not a bar colour: edge-to-edge leaves the background to
          the screen underneath. Follows the theme so the icons never match the
          ground they sit on. */}
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
        <Stack.Screen name="index" options={{ animation: "fade" }} />
        <Stack.Screen name="login" options={{ animation: "fade" }} />
        <Stack.Screen name="otp" />
        <Stack.Screen name="signup" options={{ gestureEnabled: false }} />
        <Stack.Screen name="(tabs)" options={{ animation: "fade" }} />
        <Stack.Screen name="delivery/entry" />
        <Stack.Screen name="delivery/add-stop" />
        <Stack.Screen name="delivery/checkout" />
        <Stack.Screen name="cart" options={{ animation: "slide_from_bottom" }} />
        <Stack.Screen name="checkout" />
        <Stack.Screen name="payment" />
        <Stack.Screen name="tracking" />
        <Stack.Screen name="pickup-confirmation" />
        <Stack.Screen name="ride-searching" />
        <Stack.Screen name="restaurant-menu" />
        <Stack.Screen name="restaurant-details" />
        <Stack.Screen name="chat" />
        <Stack.Screen name="149-store" />
      </Stack>
      {Platform.OS === "android" && insets.bottom > 0 && (
        <View style={{ height: insets.bottom, backgroundColor: colors.background }} />
      )}
    </View>
  );
}
