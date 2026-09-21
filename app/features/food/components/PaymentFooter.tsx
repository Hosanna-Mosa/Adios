import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { type ServiceTokens } from "@/constants/colors";
import { type EdgeInsets } from "react-native-safe-area-context";
import { type PaymentStyles } from "@/features/food/usePayment.shared";

// Moved out of app/payment.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  accent: ServiceTokens;
  handlePayment: () => void;
  insets: EdgeInsets;
  processing: any;
  styles: PaymentStyles;
  total: number;
}

export function PaymentFooter({
  accent,
  handlePayment,
  insets,
  processing,
  styles,
  total,
}: Props) {
  return (
    <View style={[styles.footer, { paddingBottom: insets.bottom + 14 }]}>
      <TouchableOpacity style={styles.payBtn} activeOpacity={0.9} onPress={handlePayment} disabled={processing}>
        {processing ? (
          <ActivityIndicator size="small" color={accent.on} />
        ) : (
          <>
            <Text style={styles.payBtnText}>Pay securely</Text>
            <Text style={styles.payBtnPrice}>· ₹{total}</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}
