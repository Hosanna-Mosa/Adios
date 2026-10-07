import { View } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { designTokens } from "@/constants/colors";
import { useThemeStore } from "@/contexts/themeStore";

// The navigator and per-route transitions, as in app/components/RootLayoutNav.tsx.
export function RootLayoutNav() {
  const theme = useThemeStore((s) => s.theme);
  const tokens = designTokens[theme];

  return (
    <View style={{ flex: 1, backgroundColor: tokens.bg }}>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false, animation: "slide_from_right", contentStyle: { backgroundColor: tokens.bg } }}>
        <Stack.Screen name="index" options={{ animation: "fade" }} />
        <Stack.Screen name="select-language" options={{ animation: "fade" }} />
        <Stack.Screen name="login" options={{ animation: "fade" }} />
        <Stack.Screen name="forgot-password" />
        <Stack.Screen name="(tabs)" options={{ animation: "fade" }} />
        <Stack.Screen name="order/[id]" />
        <Stack.Screen name="scheduled-orders" />
        <Stack.Screen name="payouts" />
        <Stack.Screen name="dish-form" options={{ animation: "slide_from_bottom" }} />
        <Stack.Screen name="menu-bulk-upload" />
        <Stack.Screen name="edit-profile" />
        <Stack.Screen name="opening-hours" />
        <Stack.Screen name="change-password" />
        <Stack.Screen name="language-settings" />
        <Stack.Screen name="support" />
        <Stack.Screen name="support-chat" />
      </Stack>
    </View>
  );
}
