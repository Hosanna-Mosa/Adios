import React from "react";
import { useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { designTokens, type ServiceTokens } from "@/constants/colors";
import { useThemeStore } from "@/contexts/themeStore";
import { useCartStore } from "@/contexts/cartStore";
import { useServiceAccent } from "@/contexts/homeStore";
import { SPRING } from "@/motion/presets";
import { createStyles } from "./AppTabBar.styles";
import { ALL_TAB_KEYS } from "./AppTabBar";
import * as Haptics from "expo-haptics";
import type { TabKey } from "./AppTabBar";

// State and animation wiring for AppTabBar, moved out so both files stay
// under 150 lines. The statements keep their original order.

export function useAppTabBar(active: any, accent: any, cartVendorName: any) {
  const insets = useSafeAreaInsets();
  const theme = useThemeStore((s) => s.theme);
  const tokens = designTokens[theme];
  // The cart row shows what is in the cart, so it takes the shopping service's
  // colour — the same one app/cart.tsx uses — rather than the screen's accent.
  // Without this it fell back to brand purple on screens that pass no accent.
  const cartAccent = useServiceAccent();
  // The bar is one control, so all four tabs share a colour. Screens with no
  // service context (Orders, Account, Favorites) follow whichever service is
  // selected, so switching to Meat turns the whole bar maroon rather than only
  // the Home tab. They used to fall back to brand purple.
  const accentTokens: ServiceTokens = accent
    ? tokens.services[accent as keyof typeof tokens.services]
    : cartAccent;
  const styles = React.useMemo(() => createStyles(tokens, accentTokens, cartAccent),
    [theme, accent, cartAccent]);

  const itemCount = useCartStore((s) => s.getItemCount());
  const totalPrice = useCartStore((s) => s.getTotalPrice());

  const [pillWidth, setPillWidth] = React.useState(0);
  const segmentWidth = pillWidth / ALL_TAB_KEYS.length;
  const activeIndex = active ? ALL_TAB_KEYS.indexOf(active) : -1;

  const indicatorX = useSharedValue(0);
  const indicatorOpacity = useSharedValue(0);

  React.useEffect(() => {
    if (activeIndex === -1 || segmentWidth === 0) {
      indicatorOpacity.value = withTiming(0, { duration: 160 });
      return;
    }
    indicatorX.value = withSpring(activeIndex * segmentWidth, SPRING);
    indicatorOpacity.value = withTiming(1, { duration: 160 });
  }, [activeIndex, segmentWidth, tokens]);

  const indicatorStyle = useAnimatedStyle(() => ({
    width: segmentWidth,
    opacity: indicatorOpacity.value,
    transform: [{ translateX: indicatorX.value }],
  }));

  const handleTabPress = (key: TabKey, routeOrCart: string) => {
    if (key === active) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(routeOrCart as any);
  };


  return {
  insets, theme, tokens, accentTokens, styles, itemCount, totalPrice, pillWidth, setPillWidth,
  indicatorStyle, handleTabPress
  };
}
