import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
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

  const { t } = useTranslation();
  const name = storeName || vendor?.name || cartVendorName || "Your cart";
  const image = storeImage || vendor?.image;

  const openMenu = () => {
    if (vendorId) router.push({ pathname: "/restaurant-menu", params: { id: vendorId, name } });
  };
  const confirmClear = () => {
    Alert.alert(t("app.cart.clearTitle", "Clear your cart?"), t("app.cart.clearBody", "This removes everything you added from {{name}}.", { name }), [
      { text: t("actions.cancel", "Cancel"), style: "cancel" },
      { text: t("app.cart.clear", "Clear"), style: "destructive", onPress: () => useCartStore.getState().clearCart() },
    ]);
  };

  return (
    <Animated.View style={[styles.cartCardWrap, { bottom }]}>
      <View style={styles.cartCard}>
        <SafeBlurView intensity={90} tint={theme === "dark" ? "dark" : "light"} style={StyleSheet.absoluteFillObject} />
        <View style={styles.cartRow}>
          {image ? (
            <Image source={{ uri: image }} style={styles.cartThumb} contentFit="cover" transition={150} />
          ) : (
            <View style={[styles.cartThumb, styles.cartThumbFallback]}>
              <Ionicons name="storefront-outline" size={moderateScale(20)} color={cartAccent.accent} />
            </View>
          )}
          <View style={styles.cartInfo}>
            <Text style={styles.cartVendor} numberOfLines={1}>{name}</Text>
            <TouchableOpacity onPress={openMenu} hitSlop={8} accessibilityRole="link">
              <Text style={[styles.cartMeta, { textDecorationLine: "underline", color: cartAccent.accent }]} numberOfLines={1}>
                {t("app.cart.viewFullMenu", "View full menu")}
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.cartViewBtn} activeOpacity={0.85} onPress={() => router.push("/cart")} accessibilityRole="button">
            <Text style={styles.cartViewTitle}>{t("app.cart.viewCart", "View Cart")}</Text>
            <Text style={styles.cartViewMeta} numberOfLines={1}>
              {itemCount} {itemCount === 1 ? "item" : "items"} • ₹{totalPrice}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cartTrash} onPress={confirmClear} hitSlop={6} accessibilityRole="button" accessibilityLabel={t("app.cart.clear", "Clear")}>
            <Ionicons name="trash-outline" size={moderateScale(18)} color={cartAccent.accent} />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}
