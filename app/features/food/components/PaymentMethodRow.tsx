import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";
import { type ThemeTokens } from "@/constants/colors";
import { type PaymentStyles } from "@/features/food/usePayment.shared";

// Moved out of app/payment.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  styles: PaymentStyles;
  tokens: ThemeTokens;
}

export function PaymentMethodRow({
  styles,
  tokens,
}: Props) {
  const { t } = useTranslation();
  return (
    <View style={styles.methodRow}>
      <View style={styles.methodIcon}>
        <Ionicons name="card-outline" size={moderateScale(18)} color={tokens.sec} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.methodTitle}>{t("app.delivery.razorpay")}</Text>
        <Text style={styles.methodSub}>{t("app.food.upiCardsWalletsAndNetBanking")}</Text>
      </View>
    </View>
  );
}
