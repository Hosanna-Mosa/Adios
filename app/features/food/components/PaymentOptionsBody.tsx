import { ScrollView, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { moderateScale } from "react-native-size-matters";
import { type EdgeInsets } from "react-native-safe-area-context";
import { type ServiceTokens, type ThemeTokens } from "@/constants/colors";
import { type PaymentMethod } from "@/contexts/paymentMethodStore";
import { fadeInUp } from "@/motion/presets";
import { type PaymentOptionsStyles } from "../paymentOptions.styles";
import { type PendingFoodPayment } from "../foodPaymentStore";
import { PaymentOrderSummary } from "./PaymentOrderSummary";
import { PaymentOptionCard } from "./PaymentOptionCard";

// Everything below the header on the Payment options screen: the order, then cash on
// delivery or online (Razorpay), then how online money is handled.

interface Props {
  pending: PendingFoodPayment;
  method: PaymentMethod;
  setMethod: (method: PaymentMethod) => void;
  processing: boolean;
  pay: () => void;
  insets: EdgeInsets;
  styles: PaymentOptionsStyles;
  tokens: ThemeTokens;
  accent: ServiceTokens;
}

export function PaymentOptionsBody({ pending, method, setMethod, processing, pay, insets, styles, tokens, accent }: Props) {
  const { t } = useTranslation();
  const amount = pending.total;

  return (
    <ScrollView
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={fadeInUp(0)}>
        <PaymentOrderSummary pending={pending} styles={styles} />
      </Animated.View>

      <Animated.View entering={fadeInUp(80)} style={styles.section}>
        <Text style={styles.sectionLabel}>{t("app.payment.method")}</Text>
        <View style={styles.optionList} accessibilityRole="radiogroup" accessibilityLabel={t("app.payment.method")}>
          <PaymentOptionCard
            icon="cash-outline"
            title={t("app.payment.payOnDelivery")}
            hint={t("app.payment.payOnDeliveryHint")}
            payLabel={t("app.payment.payWithCash", { amount })}
            selected={method === "cash"}
            processing={processing}
            onSelect={() => setMethod("cash")}
            onPay={pay}
            styles={styles}
            tokens={tokens}
            accent={accent}
          />
          <PaymentOptionCard
            icon="card-outline"
            title={t("app.payment.payOnline")}
            hint={t("app.payment.payOnlineHint")}
            payLabel={t("app.payment.payAmountOnline", { amount })}
            selected={method === "online"}
            processing={processing}
            onSelect={() => setMethod("online")}
            onPay={pay}
            styles={styles}
            tokens={tokens}
            accent={accent}
          />
        </View>
      </Animated.View>

      <Animated.View entering={fadeInUp(160)} style={styles.section}>
        <View style={styles.trustRow}>
          <Ionicons name="shield-checkmark" size={moderateScale(14)} color={tokens.success} />
          <Text style={styles.trustText}>{t("app.payment.securedByRazorpay")}</Text>
        </View>
      </Animated.View>
    </ScrollView>
  );
}
