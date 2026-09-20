import React from "react";

import { Feather } from "@expo/vector-icons";
import { styles } from "../profile-tab.styles";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

/** One document tile: icon, name, and a validity pill. */
export function DocumentStatusCard({
  icon,
  title,
  status,
  tone,
  toneSurface,
}: {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  status: string;
  tone: string;
  toneSurface: string;
}) {
  return (
    <Box style={[styles.docCard, { backgroundColor: toneSurface }]}>
      <Box style={styles.docIconWrap}>
        <Feather name={icon} size={24} color={tone} />
      </Box>
      <AppText style={styles.docTitle}>{title}</AppText>
      <Box style={[styles.statusPill, { backgroundColor: toneSurface }]}>
        <AppText style={[styles.statusPillText, { color: tone }]}>{status}</AppText>
      </Box>
    </Box>
  );
}
