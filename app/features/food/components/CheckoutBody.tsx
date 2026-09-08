import React from "react";
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { fadeInUp } from "@/motion/presets";
import { router } from "expo-router";
import { moderateScale } from "react-native-size-matters";

// Moved out of app/checkout.tsx. The JSX is unchanged; every value it used to read
// from the screen's scope is now a prop of the same name.

interface Props {
  formatSlot: any;
  TIP_OPTIONS: any[];
  accent: any;
  activeTip: any;
  addressIssue: any;
  appliedPromo: any;
  applyCode: any;
  applyingCode: any;
  deliveryFee: any;
  getItemCount: any;
  insets: any;
  isApplyingPromo: any;
  isOtherTip: any;
  items: any[];
  offers: any[];
  otherTipText: any;
  promoCodeText: any;
  promoError: any;
  receiverName: any;
  receiverPhone: any;
  removeCode: any;
  scheduledFor: any;
  selectedAddress: any;
  setIsOtherTip: React.Dispatch<React.SetStateAction<any>>;
  setOtherTipText: React.Dispatch<React.SetStateAction<any>>;
  setPromoCodeText: React.Dispatch<React.SetStateAction<any>>;
  setScheduledFor: React.Dispatch<React.SetStateAction<any>>;
  setShowPromoInput: React.Dispatch<React.SetStateAction<any>>;
  setShowScheduleSheet: React.Dispatch<React.SetStateAction<any>>;
  setTipAmount: React.Dispatch<React.SetStateAction<any>>;
  showPromoInput: any;
  styles: any;
  subtotal: any;
  tipAmount: any;
  tokens: any;
  total: any;
}

export function CheckoutBody({
  formatSlot,
  TIP_OPTIONS,
  accent,
  activeTip,
  addressIssue,
  appliedPromo,
  applyCode,
  applyingCode,
  deliveryFee,
  getItemCount,
  insets,
  isApplyingPromo,
  isOtherTip,
  items,
  offers,
  otherTipText,
  promoCodeText,
  promoError,
  receiverName,
  receiverPhone,
  removeCode,
  scheduledFor,
  selectedAddress,
  setIsOtherTip,
  setOtherTipText,
  setPromoCodeText,
  setScheduledFor,
  setShowPromoInput,
  setShowScheduleSheet,
  setTipAmount,
  showPromoInput,
  styles,
  subtotal,
  tipAmount,
  tokens,
  total,
}: Props) {
  return (
    <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 150 }} showsVerticalScrollIndicator={false}>
      <Animated.View entering={fadeInUp(0)} style={styles.section}>
        <TouchableOpacity
          style={[styles.addressCard, !!addressIssue && styles.addressCardBlocked]}
          activeOpacity={0.85}
          onPress={() => router.push("/delivery/saved-addresses")}
        >
          <View style={styles.addressAvatar}>
            <Text style={styles.addressAvatarText}>{(selectedAddress?.label || "H")[0].toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.addressTitle}>Deliver to {selectedAddress?.label || "…"}</Text>
            <Text style={styles.addressLine} numberOfLines={2}>
              {selectedAddress?.addressLine || "Select a delivery address"}
            </Text>
            {!!selectedAddress?.landmark && (
              <Text style={styles.addressContact}>Near {selectedAddress.landmark}</Text>
            )}
            {(!!receiverName || !!receiverPhone) && (
              <Text style={styles.addressContact}>{[receiverName, receiverPhone].filter(Boolean).join(" · ")}</Text>
            )}
            {!!addressIssue && (
              <View style={styles.addressWarnRow}>
                <Ionicons name="alert-circle" size={moderateScale(14)} color={tokens.error} />
                <Text style={styles.addressWarnText}>{addressIssue}</Text>
              </View>
            )}
          </View>
          <Text style={styles.changeLink}>Change</Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View entering={fadeInUp(60)} style={styles.section}>
        <View style={styles.orderCard}>
          <View style={styles.orderCardHead}>
            <Text style={styles.orderCardTitle}>Your order · {getItemCount()} items</Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.changeLink}>Edit</Text>
            </TouchableOpacity>
          </View>
          {items.map((item) => (
            <View key={item._id} style={styles.orderLine}>
              <Text style={styles.orderLineLabel} numberOfLines={1}>{item.quantity} × {item.name}</Text>
              <Text style={styles.orderLineValue}>₹{item.price * item.quantity}</Text>
            </View>
          ))}
        </View>
      </Animated.View>

      <Animated.View entering={fadeInUp(90)} style={styles.section}>
        <Text style={styles.sectionLabel}>Delivery time</Text>
        <View style={{ gap: 8 }}>
          <TouchableOpacity
            style={[styles.couponOptionRow, !scheduledFor && { borderColor: accent.accent, backgroundColor: accent.skin }]}
            activeOpacity={0.85}
            onPress={() => setScheduledFor(null)}
          >
            <View style={styles.radioSelected}>{!scheduledFor && <View style={[styles.radioDot, { backgroundColor: accent.accent }]} />}</View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.couponCode}>Deliver now</Text>
              <Text style={styles.couponDesc}>We start preparing as soon as you order.</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.couponOptionRow, !!scheduledFor && { borderColor: accent.accent, backgroundColor: accent.skin }]}
            activeOpacity={0.85}
            onPress={() => setShowScheduleSheet(true)}
          >
            <View style={styles.radioSelected}>{!!scheduledFor && <View style={[styles.radioDot, { backgroundColor: accent.accent }]} />}</View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.couponCode}>Schedule for later</Text>
              <Text style={styles.couponDesc}>
                {scheduledFor ? formatSlot(scheduledFor) : "Pick a future date and time"}
              </Text>
            </View>
            <Text style={styles.changeLink}>{scheduledFor ? "Edit" : "Pick"}</Text>
          </TouchableOpacity>
        </View>
        {!!scheduledFor && (
          <Text style={styles.scheduleNote}>
            The restaurant confirms scheduled slots — you&apos;ll see it as pending under Scheduled in My orders.
          </Text>
        )}
      </Animated.View>

      <Animated.View entering={fadeInUp(120)} style={styles.section}>
        <Text style={styles.sectionLabel}>Offers &amp; coupons</Text>
        {appliedPromo ? (
          <View style={[styles.couponOptionRow, { borderColor: accent.accent, backgroundColor: accent.skin }]}>
            <View style={styles.radioSelected}><View style={[styles.radioDot, { backgroundColor: accent.accent }]} /></View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.couponCode}>{appliedPromo.code}</Text>
              <Text style={styles.couponDesc}>You saved ₹{appliedPromo.discountAmount}</Text>
            </View>
            <TouchableOpacity onPress={removeCode}>
              <Text style={styles.changeLink}>Remove</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ gap: 8 }}>
            {offers.map((offer) => {
              const locked = offer.isApplicable === false;
              return (
                <View key={offer.code} style={[styles.couponOptionRow, locked && styles.couponOptionRowLocked]}>
                  <View style={styles.couponIconCircle}>
                    <Ionicons name="pricetag" size={moderateScale(15)} color={accent.accent} />
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.couponCode}>{offer.code}</Text>
                    <Text style={styles.couponDesc}>{offer.title}</Text>
                    <Text style={styles.couponSaving}>
                      {locked
                        ? `Add ₹${Math.max(0, Math.round(offer.amountToUnlock ?? offer.minOrder - subtotal))} more to use this`
                        : `Saves ₹${offer.discountAmount} on this order`}
                    </Text>
                  </View>
                  <TouchableOpacity disabled={locked || isApplyingPromo} onPress={() => applyCode(offer.code)}>
                    {applyingCode === offer.code ? (
                      <ActivityIndicator size="small" color={accent.accent} />
                    ) : (
                      <Text style={[styles.changeLink, locked && { color: tokens.muted }]}>Apply</Text>
                    )}
                  </TouchableOpacity>
                </View>
              );
            })}

            {showPromoInput ? (
              <View style={styles.promoInputRow}>
                <TextInput
                  style={styles.promoInput}
                  placeholder="Enter promo code"
                  placeholderTextColor={tokens.muted}
                  autoCapitalize="characters"
                  value={promoCodeText}
                  onChangeText={setPromoCodeText}
                />
                <TouchableOpacity style={styles.promoApplyBtn} onPress={() => applyCode(promoCodeText)} disabled={isApplyingPromo}>
                  {isApplyingPromo && !applyingCode ? (
                    <ActivityIndicator size="small" color={accent.on} />
                  ) : (
                    <Text style={styles.promoApplyBtnText}>Apply</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.couponOptionRow} activeOpacity={0.85} onPress={() => setShowPromoInput(true)}>
                <Ionicons name="pricetag-outline" size={moderateScale(18)} color={tokens.sec} />
                <Text style={[styles.couponCode, { flex: 1 }]}>Have a promo code?</Text>
                <Text style={styles.changeLink}>Add</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        {!!promoError && <Text style={styles.promoError}>{promoError}</Text>}
      </Animated.View>

      <Animated.View entering={fadeInUp(180)} style={styles.section}>
        <Text style={styles.sectionLabel}>Tip your delivery partner</Text>
        <Text style={styles.tipSub}>100% of the tip goes to the partner.</Text>
        <View style={styles.tipRow}>
          {TIP_OPTIONS.map((opt) => {
            const isSelected = !isOtherTip && tipAmount === opt;
            return (
              <TouchableOpacity
                key={opt}
                style={[styles.tipPill, isSelected && { backgroundColor: accent.accent, borderColor: accent.accent }]}
                onPress={() => { setIsOtherTip(false); setTipAmount(opt); }}
              >
                <Text style={[styles.tipPillText, isSelected && { color: accent.on }]}>{opt === 0 ? "None" : `₹${opt}`}</Text>
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity
            style={[styles.tipPill, isOtherTip && { backgroundColor: accent.accent, borderColor: accent.accent }]}
            onPress={() => setIsOtherTip(true)}
          >
            <Text style={[styles.tipPillText, isOtherTip && { color: accent.on }]}>Other</Text>
          </TouchableOpacity>
        </View>
        {isOtherTip && (
          <TextInput
            style={styles.otherTipInput}
            placeholder="Enter amount"
            placeholderTextColor={tokens.muted}
            keyboardType="numeric"
            value={otherTipText}
            onChangeText={setOtherTipText}
          />
        )}
      </Animated.View>

      <Animated.View entering={fadeInUp(240)} style={styles.section}>
        <Text style={styles.sectionLabel}>Bill details</Text>
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
            <Text style={styles.billNote}>Delivery fee is confirmed with your order.</Text>
          )}
          {activeTip > 0 && (
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Delivery tip</Text>
              <Text style={styles.billValue}>₹{activeTip}</Text>
            </View>
          )}
          {appliedPromo && (
            <View style={styles.billRow}>
              <Text style={[styles.billLabel, { color: tokens.success }]}>Coupon {appliedPromo.code}</Text>
              <Text style={[styles.billValue, { color: tokens.success }]}>−₹{appliedPromo.discountAmount}</Text>
            </View>
          )}
          <View style={styles.billDivider} />
          <View style={styles.billRow}>
            <Text style={styles.billTotalLabel}>To pay</Text>
            <Text style={styles.billTotalValue}>₹{total}</Text>
          </View>
        </View>
      </Animated.View>
    </ScrollView>
  );
}
