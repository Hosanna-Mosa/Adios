import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { fadeInUp } from "@/motion/presets";
import { moderateScale } from "react-native-size-matters";

// Two options shown, only one actually selectable: Cash on Delivery is the
// only way this order can be placed (see useFoodCheckoutPlaceOrder), so it's
// permanently selected. Pay Online is shown disabled rather than left off the
// screen entirely, so it reads as "coming soon" instead of "doesn't exist" —
// removing it outright would just prompt "where's the online payment option"
// the next time someone looks. Reuses the exact selected/locked row styling
// the Offers & coupons section above already established (couponOptionRow /
// couponOptionRowLocked / radioSelected / radioDot), rather than a new pattern.

interface Props {
  accent: any;
  tokens: any;
  styles: any;
}

export function CheckoutPaymentMethod({ accent, tokens, styles }: Props) {
  return (
    <Animated.View entering={fadeInUp(150)} style={styles.section}>
      <Text style={styles.sectionLabel}>Payment method</Text>
      <View style={{ gap: 8 }}>
        <View style={[styles.couponOptionRow, { borderColor: accent.accent, backgroundColor: accent.skin }]}>
          <View style={styles.radioSelected}>
            <View style={[styles.radioDot, { backgroundColor: accent.accent }]} />
          </View>
          <View style={styles.couponIconCircle}>
            <Ionicons name="cash-outline" size={moderateScale(15)} color={accent.accent} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.couponCode}>Cash on Delivery</Text>
            <Text style={styles.couponDesc}>Pay the delivery partner when your order arrives</Text>
          </View>
        </View>

        <View style={[styles.couponOptionRow, styles.couponOptionRowLocked]}>
          <View style={[styles.radioSelected, { borderColor: tokens.border }]} />
          <View style={[styles.couponIconCircle, { backgroundColor: tokens.sunken }]}>
            <Ionicons name="card-outline" size={moderateScale(15)} color={tokens.sec} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={styles.couponCode}>Pay Online</Text>
            <Text style={styles.couponDesc}>Coming soon</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}
