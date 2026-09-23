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

export function PaymentTrustNote({
  styles,
  tokens,
}: Props) {
  const { t } = useTranslation();
  return (
    <View style={styles.trustRow}>
      <Ionicons name="lock-closed" size={moderateScale(14)} color={tokens.success} />
      <Text style={styles.trustText}>
        {t("app.food.encryptedAndSecureTransactionFlavourNever")}
      </Text>
    </View>
  );
}
