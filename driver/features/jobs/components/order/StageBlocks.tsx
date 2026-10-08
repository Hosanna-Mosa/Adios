import React from "react";

import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { styles } from "../../active-order.styles";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";
import type { Hotspot } from "../HighDemandAreas";

/** Surge hotspots suggested after a job completes (the backend's high-demand areas). */
export function HighDemandZones({ title, zones }: { title: string; zones: Hotspot[] }) {
  return (
    <Box style={styles.heatmapZones}>
      <AppText style={styles.checklistHeader}>{title}</AppText>
      {zones.map((zone) => (
        <Box key={zone.id} style={styles.hotspotItem}>
          <Ionicons name="flame" size={16} color={Colors.brand} />
          <AppText style={styles.hotspotText}>
            {zone.surge ? `${zone.name} (${zone.surge})` : zone.name}
          </AppText>
        </Box>
      ))}
    </Box>
  );
}

/** Stage title with contact buttons on the same line. */
export function StageTitleRow({ title, actions }: { title: string; actions: React.ReactNode }) {
  return (
    <Box style={styles.stepTitleRow}>
      <AppText style={[styles.stepTitle, styles.stepTitleInRow]}>{title}</AppText>
      {actions}
    </Box>
  );
}
