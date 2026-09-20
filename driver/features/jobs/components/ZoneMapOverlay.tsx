import React from "react";

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
  return (
    <Box style={styles.headerOverlay}>
      <Touchable style={styles.roundBackBtn} onPress={onBack}>
        <Feather name="arrow-left" size={24} color={Colors.text} />
      </Touchable>
      <Box style={styles.titleContainer}>
        <AppText style={styles.headerTitle}>{name}</AppText>
        <AppText style={styles.headerSubtitle} numberOfLines={2}>
          {description || "Operational geofence coverage area."}
        </AppText>
      </Box>
    </Box>
  );
}
