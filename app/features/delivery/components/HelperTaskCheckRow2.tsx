import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { fadeInUp } from "@/motion/presets";

// Moved out of app/helper-task.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  accent: any;
  styles: any;
  totalContacted: any;
}

export function HelperTaskCheckRow2({
  accent,
  styles,
  totalContacted,
}: Props) {
  const { t } = useTranslation();
  return (
    <Animated.View style={styles.checkRow} entering={fadeInUp(0)}>
      <View style={styles.checkDone}><Ionicons name="checkmark" size={13} color={accent.on} /></View>
      <Text style={styles.checkText}>{totalContacted} {t("app.delivery.helpersNotified")}</Text>
    </Animated.View>
  );
}
