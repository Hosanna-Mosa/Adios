import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Moved out of app/delivery/checkout.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  accent: any;
  handleConfirm: any;
  insets: any;
  isProcessing: any;
  price: any;
  stops: any;
  styles: any;
  tokens: any;
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
