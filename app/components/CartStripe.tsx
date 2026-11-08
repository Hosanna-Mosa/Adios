import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  interpolate, runOnJS, useAnimatedStyle, useSharedValue, withSpring,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { moderateScale } from "react-native-size-matters";
import { SafeBlurView } from "@/components/ui/SafeBlurView";
import { type ServiceTokens } from "@/constants/colors";
import { useCartStore } from "@/contexts/cartStore";
import { getVendor } from "@/services/catalog.service";
import { type AppTabBarStyles } from "./AppTabBar.styles";

// How far (dp) the stripe has to be dragged up, or how fast a flick, to open checkout.
const DRAG_OPEN_DISTANCE = 70;
const DRAG_OPEN_VELOCITY = -900;

/**
 * The cart summary that floats above the tab bar while the cart has items:
 * the outlet's photo, its name on the first line and the cost on the second.
 *
 * Name and photo come from the cart itself (set when a dish is added from the
 * menu). A cart restored after a restart only knows the outlet's id, so they
 * are looked up once from GET /vendors/:id; the screen's `cartVendorName` is
 * the last resort.
 */
interface Props {
  bottom: number;
  styles: AppTabBarStyles;
  theme: string;
  cartAccent: ServiceTokens;
  itemCount: number;
  totalPrice: number;
  cartVendorName?: string;
}

export function CartStripe({ bottom, styles, theme, cartAccent, itemCount, totalPrice, cartVendorName }: Props) {
  const vendorId = useCartStore((s) => s.vendorId);
  const storeName = useCartStore((s) => s.vendorName);
  const storeImage = useCartStore((s) => s.vendorImage);

  const { data: vendor } = useQuery({
    queryKey: ["cart-stripe-vendor", vendorId],
    queryFn: () => getVendor<{ name?: string; image?: string }>(vendorId as string),
    enabled: !!vendorId && (!storeName || !storeImage),
    staleTime: 30 * 60 * 1000,
    retry: false,
  });

  const openCheckout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    router.push({ pathname: "/cart", params: { autoCheckout: "1" } });
  };

  // Drag the stripe up to "drop" the checkout: it follows the finger (upward
  // only), then springs back; past the threshold it opens checkout instead.
  const dragY = useSharedValue(0);
  const drag = Gesture.Pan()
    .activeOffsetY([-8, 8])
    .failOffsetX([-20, 20])
    .onUpdate((e) => {
      dragY.value = Math.min(0, e.translationY);
    })
    .onEnd((e) => {
      const open = e.translationY < -DRAG_OPEN_DISTANCE || e.velocityY < DRAG_OPEN_VELOCITY;
      if (open) runOnJS(openCheckout)();
      dragY.value = withSpring(0, { damping: 18, stiffness: 220 });
    });
  const dragStyle = useAnimatedStyle(() => ({ transform: [{ translateY: dragY.value }] }));
  const hintStyle = useAnimatedStyle(() => ({
    opacity: interpolate(dragY.value, [0, -DRAG_OPEN_DISTANCE], [0, 1], "clamp"),
  }));

  const name = storeName || vendor?.name || cartVendorName || "Your cart";
  const image = storeImage || vendor?.image;

  return (
    <GestureDetector gesture={drag}>
    <Animated.View style={[styles.cartCardWrap, { bottom }, dragStyle]}>
      <Animated.View pointerEvents="none" style={[styles.cartDragHint, hintStyle]}>
        <Ionicons name="chevron-up" size={moderateScale(14)} color={cartAccent.accent} />
        <Text style={[styles.cartDragHintText, { color: cartAccent.accent }]}>Release to checkout</Text>
      </Animated.View>
      <View style={styles.cartCard}>
        <View style={styles.cartGrabHandle} />
        <SafeBlurView intensity={90} tint={theme === "dark" ? "dark" : "light"} style={StyleSheet.absoluteFillObject} />
        <TouchableOpacity style={styles.cartRow} activeOpacity={0.85} onPress={() => router.push("/cart")}>
          {image ? (
            <Image source={{ uri: image }} style={styles.cartThumb} contentFit="cover" transition={150} />
          ) : (
            <View style={[styles.cartThumb, styles.cartThumbFallback]}>
              <Ionicons name="storefront-outline" size={moderateScale(20)} color={cartAccent.accent} />
            </View>
          )}
          <View style={styles.cartInfo}>
            <Text style={styles.cartVendor} numberOfLines={1}>{name}</Text>
            <Text style={styles.cartMeta} numberOfLines={1}>
              <Text style={styles.cartPrice}>₹{totalPrice}</Text>
              {` · ${itemCount} ${itemCount === 1 ? "item" : "items"}`}
            </Text>
          </View>
          <Text style={styles.cartCta}>View cart</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
    </GestureDetector>
  );
}
