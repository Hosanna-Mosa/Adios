import { Text, View } from "react-native";

// Moved out of app/payment.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  couponCode: any;
  deliveryFee: any;
  discount: any;
  styles: any;
  subtotal: any;
  tip: any;
  tokens: any;
  total: any;
}

export function PaymentBillCard({
  couponCode,
  deliveryFee,
  discount,
  styles,
  subtotal,
  tip,
  tokens,
  total,
}: Props) {
  return (
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
      {tip > 0 && (
        <View style={styles.billRow}>
          <Text style={styles.billLabel}>Delivery tip</Text>
          <Text style={styles.billValue}>₹{tip}</Text>
        </View>
      )}
      {discount > 0 && (
        <View style={styles.billRow}>
          <Text style={[styles.billLabel, { color: tokens.success }]}>Coupon {couponCode}</Text>
          <Text style={[styles.billValue, { color: tokens.success }]}>−₹{discount}</Text>
        </View>
      )}
      <View style={styles.billDivider} />
      <View style={styles.billRow}>
        <Text style={styles.billTotalLabel}>To pay</Text>
        <Text style={styles.billTotalValue}>₹{total}</Text>
      </View>
    </View>
  );
}
