import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { type ThemeTokens, type ServiceTokens } from "@/constants/colors";
import { type EdgeInsets } from "react-native-safe-area-context";
import { type DeliveryCheckoutStyles } from "@/features/delivery/useDeliveryCheckout";
import type { OrderStop } from "@/types/models";
import type { PriceBreakdown } from "@/contexts/delivery.types";

// Moved out of app/delivery/checkout.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  accent: ServiceTokens;
  handleConfirm: () => void;
  insets: EdgeInsets;
  isProcessing: boolean;
  price: PriceBreakdown | null;
  stops: OrderStop[];
  styles: DeliveryCheckoutStyles;
  tokens: ThemeTokens;
}

export function DeliveryCheckoutFooter({
  accent,
  handleConfirm,
  insets,
  isProcessing,
  price,
  stops,
  styles,
  tokens,
}: Props) {
  return (
    <View style={[styles.footer, { paddingBottom: insets.bottom + 14 }]}>
      <View style={styles.trustRow}>
        <Ionicons name="lock-closed" size={13} color={tokens.success} />
        <Text style={styles.trustText}>Encrypted and secure transaction · Razorpay</Text>
      </View>
      <TouchableOpacity style={[styles.payBtn, (isProcessing || stops.length === 0) && { opacity: 0.6 }]} onPress={handleConfirm} disabled={isProcessing || stops.length === 0}>
        {isProcessing ? (
          <ActivityIndicator size="small" color={accent.on} />
        ) : (
          <>
            <Text style={styles.payBtnText}>Pay securely</Text>
            <Text style={styles.payBtnPrice}>· ₹{price?.total ?? 0}</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}
