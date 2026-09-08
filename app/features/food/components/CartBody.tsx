import { Image } from "expo-image";
import React from "react";
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { staggerListItem } from "@/motion/presets";
import { router } from "expo-router";
import { moderateScale } from "react-native-size-matters";

// Moved out of app/cart.tsx. The JSX is unchanged; every value it used to read
// from the screen's scope is now a prop of the same name.

interface Props {
  accent: any;
  addItem: any;
  appliedPromo: any;
  clearSyncNotices: any;
  complements: any[];
  deliveryFee: any;
  discount: any;
  handleApplyPromo: any;
  insets: any;
  isApplyingPromo: any;
  items: any[];
  promoCode: any;
  promoError: any;
  setAppliedPromo: React.Dispatch<React.SetStateAction<any>>;
  setPromoCode: React.Dispatch<React.SetStateAction<any>>;
  setShowPromoInput: React.Dispatch<React.SetStateAction<boolean>>;
  showPromoInput: any;
  styles: any;
  subtotal: any;
  syncNotices: any[];
  tokens: any;
  total: any;
  updateQuantity: any;
  vendorId: any;
}

export function CartBody({
  accent,
  addItem,
  appliedPromo,
  clearSyncNotices,
  complements,
  deliveryFee,
  discount,
  handleApplyPromo,
  insets,
  isApplyingPromo,
  items,
  promoCode,
  promoError,
  setAppliedPromo,
  setPromoCode,
  setShowPromoInput,
  showPromoInput,
  styles,
  subtotal,
  syncNotices,
  tokens,
  total,
  updateQuantity,
  vendorId,
}: Props) {
  return (
    <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 160 }} showsVerticalScrollIndicator={false}>
      {syncNotices.length > 0 && (
        <View style={styles.section}>
          <View style={styles.noticeCard}>
            <Feather name="alert-circle" size={moderateScale(16)} color={tokens.warning} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.noticeTitle}>
                {syncNotices.length === 1 ? "1 item was updated" : `${syncNotices.length} items were updated`}
              </Text>
              {syncNotices.map((notice) => (
                <Text key={notice.itemId} style={styles.noticeLine}>
                  {notice.status === "price_changed"
                    ? `${notice.name} is now ₹${notice.price} (was ₹${notice.previousPrice})`
                    : notice.status === "unavailable"
                      ? `${notice.name} is sold out and was removed`
                      : `${notice.name} is no longer on the menu and was removed`}
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
            <Text style={styles.addMoreText}>+ Add more items</Text>
          </TouchableOpacity>
        </View>
      </View>

      {complements.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Complement your cart</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
            {complements.slice(0, 8).map((comp, idx) => (
              <Animated.View key={comp._id} entering={staggerListItem(idx)} style={styles.complementCard}>
                <Image source={{ uri: comp.images?.[0] }} style={styles.complementImage} contentFit="cover" transition={200} />
                <Text style={styles.complementName} numberOfLines={1}>{comp.name}</Text>
                <View style={styles.complementFooter}>
                  <Text style={styles.complementPrice}>₹{comp.price}</Text>
                  <TouchableOpacity style={styles.complementAddBtn} onPress={() => addItem(comp, vendorId!)}>
                    <Ionicons name="add" size={16} color={accent.accent} />
                  </TouchableOpacity>
                </View>
              </Animated.View>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.section}>
        <TouchableOpacity
          style={styles.couponRow}
          activeOpacity={0.85}
          onPress={() => (appliedPromo ? setAppliedPromo(null) : setShowPromoInput((s) => !s))}
        >
          <View style={styles.couponIconCircle}>
            <Ionicons name="pricetag" size={moderateScale(15)} color={accent.accent} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.couponTitle}>{appliedPromo ? `${appliedPromo.code} applied` : "Have a promo code?"}</Text>
            <Text style={styles.couponSub}>
              {appliedPromo ? `You saved ₹${Math.round(discount)}` : "Tap to add it at checkout"}
            </Text>
          </View>
          <Text style={styles.couponAction}>{appliedPromo ? "Remove" : "Apply"}</Text>
        </TouchableOpacity>

        {showPromoInput && !appliedPromo && (
          <View style={styles.promoInputRow}>
            <TextInput
              style={styles.promoInput}
              placeholder="Enter code"
              placeholderTextColor={tokens.muted}
              autoCapitalize="characters"
              value={promoCode}
              onChangeText={setPromoCode}
            />
            <TouchableOpacity style={styles.promoApplyBtn} onPress={handleApplyPromo} disabled={isApplyingPromo}>
              {isApplyingPromo ? <ActivityIndicator size="small" color={accent.on} /> : <Text style={styles.promoApplyBtnText}>Apply</Text>}
            </TouchableOpacity>
          </View>
        )}
        {!!promoError && <Text style={styles.promoError}>{promoError}</Text>}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Bill summary</Text>
        <View style={styles.billCard}>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Item total</Text>
            <Text style={styles.billValue}>₹{subtotal}</Text>
          </View>
          {deliveryFee != null ? (
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Delivery fee</Text>
              <Text style={styles.billValue}>{deliveryFee === 0 ? "Free" : `₹${deliveryFee}`}</Text>
            </View>
          ) : (
            <Text style={styles.billNote}>Delivery fee is confirmed at checkout.</Text>
          )}
          {appliedPromo && (
            <View style={styles.billRow}>
              <Text style={[styles.billLabel, { color: tokens.success }]}>Coupon {appliedPromo.code}</Text>
              <Text style={[styles.billValue, { color: tokens.success }]}>−₹{Math.round(discount)}</Text>
            </View>
          )}
          <View style={styles.billDivider} />
          <View style={styles.billRow}>
            <Text style={styles.billTotalLabel}>To pay</Text>
            <Text style={styles.billTotalValue}>₹{total}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
