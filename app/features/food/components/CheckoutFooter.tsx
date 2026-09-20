import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { moderateScale } from "react-native-size-matters";
import { type ThemeTokens, type ServiceTokens } from "@/constants/colors";
import { type EdgeInsets } from "react-native-safe-area-context";
import { type CheckoutStyles } from "@/features/food/checkout.styles";

// Moved out of app/checkout.tsx. The JSX is unchanged; every value it used to read
// from the screen's scope is now a prop of the same name.

interface Props {
  accent: ServiceTokens;
  addressIssue: any;
  insets: EdgeInsets;
  isPlacingOrder: boolean;
  placeOrder: any;
  scheduledFor: any;
  styles: CheckoutStyles;
  tokens: ThemeTokens;
  total: number;
}

export function CheckoutFooter({
  accent,
  addressIssue,
  insets,
  isPlacingOrder,
  placeOrder,
  scheduledFor,
  styles,
  tokens,
  total,
}: Props) {
  return (
    <View style={[styles.footer, { paddingBottom: insets.bottom + 14 }]}>
      {!!addressIssue && (
        <TouchableOpacity
          style={styles.blockedNote}
          activeOpacity={0.8}
          onPress={() => router.push("/delivery/saved-addresses")}
        >
          <Ionicons name="alert-circle" size={moderateScale(14)} color={tokens.error} />
          <Text style={styles.blockedNoteText}>{addressIssue}</Text>
          <Text style={styles.changeLink}>Fix</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity
        style={[styles.placeOrderBtn, (isPlacingOrder || !!addressIssue) && styles.placeOrderBtnDisabled]}
        activeOpacity={0.9}
        onPress={placeOrder}
        disabled={isPlacingOrder || !!addressIssue}
      >
        {isPlacingOrder ? (
          <ActivityIndicator size="small" color={accent.on} />
        ) : (
          <>
            <Text style={styles.placeOrderBtnText}>{scheduledFor ? "Schedule order" : "Place order"}</Text>
            <Text style={styles.placeOrderBtnPrice}>· ₹{total}</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}
