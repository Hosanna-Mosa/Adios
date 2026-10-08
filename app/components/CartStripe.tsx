import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { moderateScale } from "react-native-size-matters";
import { SafeBlurView } from "@/components/ui/SafeBlurView";
import { type ServiceTokens } from "@/constants/colors";
import { useCartStore } from "@/contexts/cartStore";
import { getVendor } from "@/services/catalog.service";
import { type AppTabBarStyles } from "./AppTabBar.styles";

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

  const name = storeName || vendor?.name || cartVendorName || "Your cart";
  const image = storeImage || vendor?.image;

  return (
    <Animated.View style={[styles.cartCard, { bottom }]}>
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
    </Animated.View>
  );
}
