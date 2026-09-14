import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { fadeInUp } from "@/motion/presets";

// Moved out of app/helper-task.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  accent: any;
  calculatedFare: any;
  currentTaskPrice: any;
  offer: any;
  styles: any;
}

export function HelperTaskCheckRow({
  accent,
  calculatedFare,
  currentTaskPrice,
  offer,
  styles,
}: Props) {
  const { t } = useTranslation();
  return (
    <Animated.View style={styles.checkRow} entering={fadeInUp(60)}>
      <View style={styles.checkDone}><Ionicons name="checkmark" size={13} color={accent.on} /></View>
      <Text style={styles.checkText}>{t("app.delivery.taskPublished")}{currentTaskPrice ?? offer ?? calculatedFare}</Text>
    </Animated.View>
  );
}
