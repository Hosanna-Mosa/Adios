import React from "react";
import { useTranslation } from "react-i18next";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { styles } from "../zone-map.styles";
import { Touchable } from "@/components/ui/Touchable";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

/** Floating card over the map naming the zone being viewed. */
export function ZoneMapOverlay({
  name,
  description,
  onBack,
}: {
  name: string;
  description?: string | null;
  onBack: () => void;
}) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  return (
    // Was a hardcoded top: 48, which is under the status bar on any device
    // with a taller inset (notch/punch-hole) now that the bar is translucent.
    <Box style={[styles.headerOverlay, { top: insets.top + 12 }]}>
      <Touchable style={styles.roundBackBtn} onPress={onBack}>
        <Feather name="arrow-left" size={24} color={Colors.text} />
      </Touchable>
      <Box style={styles.titleContainer}>
        <AppText style={styles.headerTitle}>{name}</AppText>
        <AppText style={styles.headerSubtitle} numberOfLines={2}>
          {description || t("jobs.operationalGeofenceCoverageArea")}
        </AppText>
      </Box>
    </Box>
  );
}
