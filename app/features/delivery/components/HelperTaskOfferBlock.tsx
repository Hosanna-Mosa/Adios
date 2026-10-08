import { Text } from "react-native";
import { useTranslation } from "react-i18next";
import Animated from "react-native-reanimated";
import { fadeInUp } from "@/motion/presets";
import { type HelperTaskStyles } from "../helper-task.styles";
import type { HelperQuote } from "@/services/orders.service";

// The offer as it stands, with the server's recommended price beneath it.

interface Props {
  calculatedFare: number;
  offer: number | null;
  quote: HelperQuote | null;
  styles: HelperTaskStyles;
  totalHours: number;
}

export function HelperTaskOfferBlock({
  calculatedFare,
  offer,
  quote,
  styles,
  totalHours,
}: Props) {
  const { t } = useTranslation();
  const amount = offer ?? calculatedFare;
  return (
    <Animated.View style={styles.offerBlock} entering={fadeInUp(0)}>
      <Text style={styles.offerEyebrow}>{t("app.delivery.yourOffer")}</Text>
      <Text style={styles.offerAmount}>₹{amount}</Text>
      <Text style={styles.offerSub}>
        {t("app.delivery.offerForDuration", {
          hours: Math.floor(totalHours),
          minutes: Math.round((totalHours % 1) * 60),
          perHour: Math.round(amount / totalHours),
        })}
      </Text>
      {quote && (
        <Text style={styles.offerSub}>{t("app.delivery.recommendedPrice", { amount: quote.total })}</Text>
      )}
    </Animated.View>
  );
}
