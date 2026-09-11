import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

// Moved out of app/payment.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  accent: any;
  handlePayment: any;
  insets: any;
  processing: any;
  styles: any;
  total: any;
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
