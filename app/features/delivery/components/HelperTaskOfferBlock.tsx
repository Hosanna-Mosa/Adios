import { Text } from "react-native";
import { useTranslation } from "react-i18next";
import Animated from "react-native-reanimated";
import { fadeInUp } from "@/motion/presets";

// Moved out of app/helper-task.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  calculatedFare: any;
  offer: any;
  styles: any;
  totalHours: any;
}

export function HelperTaskOfferBlock({
  calculatedFare,
  offer,
  styles,
  totalHours,
}: Props) {
  const { t } = useTranslation();
  return (
    <Animated.View style={styles.offerBlock} entering={fadeInUp(0)}>
      <Text style={styles.offerEyebrow}>{t("app.delivery.currentOffer")}</Text>
      <Text style={styles.offerAmount}>₹{offer ?? calculatedFare}</Text>
      <Text style={styles.offerSub}>
        for {Math.floor(totalHours)}h {Math.round((totalHours % 1) * 60)}{t("app.delivery.mAbout")}{Math.round((offer ?? calculatedFare) / totalHours)}/hour
      </Text>
    </Animated.View>
  );
}
