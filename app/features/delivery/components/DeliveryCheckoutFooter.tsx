import { ActivityIndicator, Text, View } from "react-native";
import { TouchableOpacity } from "@/components/ui/TrackedTouchable";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { type ThemeTokens, type ServiceTokens } from "@/constants/colors";
import { type EdgeInsets } from "react-native-safe-area-context";
import { type DeliveryCheckoutStyles } from "@/features/delivery/useDeliveryCheckout";
import type { OrderStop } from "@/types/models";
import type { PriceBreakdown } from "@/contexts/delivery.types";
import { usePaymentMethodStore } from "@/contexts/paymentMethodStore";

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
  const { t } = useTranslation();
  const isOnline = usePaymentMethodStore((s) => s.methods.delivery) === "online";
  return (
    <View style={[styles.footer, { paddingBottom: insets.bottom + 14 }]}>
      {isOnline && (
        <View style={styles.trustRow}>
          <Ionicons name="lock-closed" size={13} color={tokens.success} />
          <Text style={styles.trustText}>{t("app.delivery.encryptedAndSecureTransactionRazorpay")}</Text>
        </View>
      )}
      <TouchableOpacity style={[styles.payBtn, (isProcessing || stops.length === 0) && { opacity: 0.6 }]} onPress={handleConfirm} disabled={isProcessing || stops.length === 0}>
        {isProcessing ? (
          <ActivityIndicator size="small" color={accent.on} />
        ) : (
          <>
            <Text style={styles.payBtnText}>{isOnline ? t("app.delivery.paySecurely") : t("app.food.placeOrder")}</Text>
            <Text style={styles.payBtnPrice}>· ₹{price?.total ?? 0}</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}
