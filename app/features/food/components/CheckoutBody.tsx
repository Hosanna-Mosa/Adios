import React from "react";
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { fadeInUp } from "@/motion/presets";
import { router } from "expo-router";
import { moderateScale } from "react-native-size-matters";
import { CheckoutDeliveryTime } from "./CheckoutDeliveryTime";
import { CheckoutSection } from "./CheckoutSection";
import { CheckoutTipYourDelivery } from "./CheckoutTipYourDelivery";
import { CheckoutBillDetails } from "./CheckoutBillDetails";

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

export function CheckoutBody(props: Props) {
  const { addressIssue, insets, receiverName, receiverPhone, selectedAddress, styles, tokens } = props;
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

      <CheckoutDeliveryTime {...props} />

      <CheckoutSection {...props} />

      <CheckoutTipYourDelivery {...props} />

      <CheckoutBillDetails {...props} />
    </ScrollView>
  );
}
