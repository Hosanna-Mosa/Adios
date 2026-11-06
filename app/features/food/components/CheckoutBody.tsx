import React from "react";
import { ActivityIndicator, ScrollView, Text, TextInput, View } from "react-native";
import { TouchableOpacity } from "@/components/ui/TrackedTouchable";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { fadeInUp } from "@/motion/presets";
import { router } from "expo-router";
import { moderateScale } from "react-native-size-matters";
import { CheckoutDeliveryTime } from "./CheckoutDeliveryTime";
import { CheckoutSection } from "./CheckoutSection";
import { CheckoutTipYourDelivery } from "./CheckoutTipYourDelivery";
import { CheckoutBillDetails } from "./CheckoutBillDetails";
import { type ThemeTokens, type ServiceTokens } from "@/constants/colors";
import { type EdgeInsets } from "react-native-safe-area-context";
import { type CheckoutStyles } from "@/features/food/checkout.styles";

// Moved out of app/checkout.tsx. The JSX is unchanged; every value it used to read
// from the screen's scope is now a prop of the same name.

interface Props {
  /** Height of the floating footer (payment method + Place order); the last section scrolls clear of it. */
  footerHeight?: number;
  formatSlot: any;
  TIP_OPTIONS: any[];
  accent: ServiceTokens;
  activeTip: any;
  addressIssue: any;
  appliedPromo: any;
  applyCode: any;
  applyingCode: any;
  deliveryFee: number | null;
  getItemCount: any;
  insets: EdgeInsets;
  isApplyingPromo: boolean;
  isOtherTip: boolean;
  items: any[];
  offers: any[];
  otherTipText: string;
  promoCodeText: string;
  promoError: string | null;
  receiverName: string;
  receiverPhone: string;
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
  showPromoInput: boolean;
  styles: CheckoutStyles;
  subtotal: number;
  tipAmount: any;
  tokens: ThemeTokens;
  total: number;
}

export function CheckoutBody(props: Props) {
  const { addressIssue, footerHeight, insets, receiverName, receiverPhone, selectedAddress, styles, tokens } = props;
  const { t } = useTranslation();
  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: Math.max(footerHeight ?? 0, insets.bottom + 150) + 16 }}
      showsVerticalScrollIndicator={false}
    >
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
            <Text style={styles.addressTitle}>{t("app.food.deliverTo")} {selectedAddress?.label || "…"}</Text>
            <Text style={styles.addressLine} numberOfLines={2}>
              {selectedAddress?.addressLine || "Select a delivery address"}
            </Text>
            {!!selectedAddress?.landmark && (
              <Text style={styles.addressContact}>{t("app.delivery.near")} {selectedAddress.landmark}</Text>
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
          <Text style={styles.changeLink}>{t("app.delivery.change")}</Text>
        </TouchableOpacity>
      </Animated.View>

      <CheckoutDeliveryTime {...props} />

      <CheckoutSection {...props} />

      <CheckoutTipYourDelivery {...props} />

      <CheckoutBillDetails {...props} />
    </ScrollView>
  );
}
