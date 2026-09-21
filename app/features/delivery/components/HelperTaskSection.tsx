import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import Animated from "react-native-reanimated";
import { fadeInUp } from "@/motion/presets";
import { type ServiceTokens } from "@/constants/colors";
import { type HelperTaskStyles } from "@/features/delivery/helper-task.styles";

// Moved out of app/helper-task.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  accent: ServiceTokens;
  calculatedFare: number;
  setOffer: React.Dispatch<React.SetStateAction<number | null>>;
  styles: HelperTaskStyles;
}

export function HelperTaskSection({
  accent,
  calculatedFare,
  setOffer,
  styles,
}: Props) {
  const { t } = useTranslation();
  return (
    <Animated.View style={styles.section} entering={fadeInUp(80)}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <TouchableOpacity style={styles.offerStepBtn} onPress={() => setOffer((o) => Math.max(0, (o ?? calculatedFare) - 20))}>
          <Text style={styles.offerStepBtnText}>−</Text>
        </TouchableOpacity>
        <View style={styles.offerStepsMid}>
          <Text style={styles.offerStepsMidText}>{t("app.delivery.20Steps")}</Text>
        </View>
        <TouchableOpacity style={[styles.offerStepBtn, { backgroundColor: accent.accent, borderWidth: 0 }]} onPress={() => setOffer((o) => (o ?? calculatedFare) + 20)}>
          <Text style={[styles.offerStepBtnText, { color: accent.on }]}>+</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}
