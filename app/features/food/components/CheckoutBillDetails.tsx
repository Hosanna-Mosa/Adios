import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import Animated from "react-native-reanimated";
import { fadeInUp } from "@/motion/presets";

// Section of CheckoutBody, split out to keep every file under 150 lines.
// The JSX is unchanged and the props keep the parent's types.

interface Props {
  activeTip: any;
  appliedPromo: any;
  deliveryFee: any;
  styles: any;
  subtotal: any;
  tokens: any;
  total: any;
}

export function CheckoutBillDetails({
  activeTip,
  appliedPromo,
  deliveryFee,
  styles,
  subtotal,
  tokens,
  total,
}: Props) {
  const { t } = useTranslation();
  return (
    <Animated.View entering={fadeInUp(240)} style={styles.section}>
      <Text style={styles.sectionLabel}>{t("app.food.billDetails")}</Text>
      <View style={styles.billCard}>
        <View style={styles.billRow}>
          <Text style={styles.billLabel}>{t("app.food.itemTotal")}</Text>
          <Text style={styles.billValue}>₹{subtotal}</Text>
        </View>
        {deliveryFee != null ? (
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>{t("app.food.deliveryFee")}</Text>
            <Text style={styles.billValue}>{deliveryFee === 0 ? t("app.food.free") : `₹${deliveryFee}`}</Text>
          </View>
        ) : (
          <Text style={styles.billNote}>{t("app.food.deliveryFeeIsConfirmedWithYour")}</Text>
        )}
        {activeTip > 0 && (
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>{t("app.food.deliveryTip")}</Text>
            <Text style={styles.billValue}>₹{activeTip}</Text>
          </View>
        )}
        {appliedPromo && (
          <View style={styles.billRow}>
            <Text style={[styles.billLabel, { color: tokens.success }]}>{t("app.food.coupon")} {appliedPromo.code}</Text>
            <Text style={[styles.billValue, { color: tokens.success }]}>−₹{appliedPromo.discountAmount}</Text>
          </View>
        )}
        <View style={styles.billDivider} />
        <View style={styles.billRow}>
          <Text style={styles.billTotalLabel}>{t("app.food.toPay")}</Text>
          <Text style={styles.billTotalValue}>₹{total}</Text>
        </View>
      </View>
    </Animated.View>
  );
}
