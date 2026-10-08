import { Image } from "expo-image";
import { DishPrice } from "@/components/shared/DishPrice";
import React from "react";
import { ActivityIndicator, ScrollView, Text, TextInput, View } from "react-native";
import { TouchableOpacity } from "@/components/ui/TrackedTouchable";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import Animated from "react-native-reanimated";
import { staggerListItem } from "@/motion/presets";
import { router } from "expo-router";
import { moderateScale } from "react-native-size-matters";
import { CartBillSummary } from "./CartBillSummary";
import { type ThemeTokens, type ServiceTokens } from "@/constants/colors";
import { type EdgeInsets } from "react-native-safe-area-context";
import { type CartStyles } from "../cart.styles";

// Moved out of app/cart.tsx. The JSX is unchanged; every value it used to read
// from the screen's scope is now a prop of the same name.

interface Props {
  accent: ServiceTokens;
  addItem: any;
  appliedPromo: any;
  clearSyncNotices: () => void;
  complements: any[];
  deliveryFee: number | null;
  discount: number;
  handleApplyPromo: () => void;
  insets: EdgeInsets;
  isApplyingPromo: boolean;
  items: any[];
  promoCode: any;
  promoError: string | null;
  setAppliedPromo: React.Dispatch<React.SetStateAction<any>>;
  setPromoCode: React.Dispatch<React.SetStateAction<any>>;
  setShowPromoInput: React.Dispatch<React.SetStateAction<boolean>>;
  showPromoInput: boolean;
  styles: CartStyles;
  subtotal: number;
  syncNotices: any[];
  tokens: ThemeTokens;
  total: number;
  updateQuantity: any;
  vendorId: any;
}

export function CartContents(props: Props) {
  const { accent, addItem, clearSyncNotices, complements, insets, items, styles, syncNotices, tokens, updateQuantity, vendorId } = props;
  const { t } = useTranslation();
  return (
    <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 160 }} showsVerticalScrollIndicator={false}>
      {syncNotices.length > 0 && (
        <View style={styles.section}>
          <View style={styles.noticeCard}>
            <Feather name="alert-circle" size={moderateScale(16)} color={tokens.warning} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.noticeTitle}>
                {t("app.food.itemWasUpdatedCount", { count: syncNotices.length })}
              </Text>
              {syncNotices.map((notice) => (
                <Text key={notice.itemId} style={styles.noticeLine}>
                  {notice.status === "price_changed"
                    ? t("app.food.isNowPriceWasPrice", { name: notice.name, price: notice.price, previousPrice: notice.previousPrice })
                    : notice.status === "unavailable"
                      ? t("app.food.isSoldOutAndWasRemoved", { name: notice.name })
                      : t("app.food.isNoLongerOnTheMenu", { name: notice.name })}
                </Text>
              ))}
            </View>
            <TouchableOpacity onPress={clearSyncNotices} hitSlop={8}>
              <Feather name="x" size={moderateScale(16)} color={tokens.sec} />
            </TouchableOpacity>
          </View>
        </View>
      )}
      <View style={styles.section}>
        <View style={styles.itemsCard}>
          {items.map((item, idx) => (
            <Animated.View key={item._id} entering={staggerListItem(idx)} style={[styles.itemRow, idx < items.length - 1 && styles.itemRowDivider]}>
              <View style={styles.itemThumbWrap}>
                {item.images?.[0] ? (
                  <Image source={{ uri: item.images[0] }} style={styles.itemThumb} contentFit="cover" transition={200} />
                ) : (
                  <View style={[styles.itemThumb, styles.itemThumbFallback]}>
                    <Ionicons name="restaurant-outline" size={moderateScale(16)} color={tokens.muted} />
                  </View>
                )}
                <View style={[styles.dietIcon, { borderColor: item.isVeg ? tokens.veg : tokens.nonveg }]}>
                  {item.isVeg ? (
                    <View style={[styles.vegDot, { backgroundColor: tokens.veg }]} />
                  ) : (
                    <View style={styles.nonvegTriangle} />
                  )}
                </View>
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                {!!item.category && <Text style={styles.itemMeta} numberOfLines={1}>{item.category}</Text>}
              </View>
              <View style={styles.qtyPill}>
                <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQuantity(item._id, item.quantity - 1)}>
                  <Feather name="minus" size={14} color={accent.accent} />
                </TouchableOpacity>
                <Text style={styles.qtyText}>{item.quantity}</Text>
                <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQuantity(item._id, item.quantity + 1)}>
                  <Feather name="plus" size={14} color={accent.accent} />
                </TouchableOpacity>
              </View>
              <Text style={styles.itemLinePrice}>₹{item.price * item.quantity}</Text>
            </Animated.View>
          ))}
          <TouchableOpacity style={styles.addMoreRow} onPress={() => router.back()}>
            <Text style={styles.addMoreText}>{t("app.food.addMoreItems")}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {complements.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t("app.food.complementYourCart")}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
            {complements.slice(0, 8).map((comp, idx) => (
              <Animated.View key={comp._id} entering={staggerListItem(idx)} style={styles.complementCard}>
                <Image source={{ uri: comp.images?.[0] }} style={styles.complementImage} contentFit="cover" transition={200} />
                <Text style={styles.complementName} numberOfLines={1}>{comp.name}</Text>
                <View style={styles.complementFooter}>
                  <DishPrice price={comp.price} offerPrice={comp.offerPrice} discountPercent={comp.discountPercent} priceStyle={styles.complementPrice} hidePercent />
                  <TouchableOpacity style={styles.complementAddBtn} onPress={() => addItem(comp, vendorId!)}>
                    <Ionicons name="add" size={16} color={accent.accent} />
                  </TouchableOpacity>
                </View>
              </Animated.View>
            ))}
          </ScrollView>
        </View>
      )}

      <CartBillSummary {...props} />
    </ScrollView>
  );
}
