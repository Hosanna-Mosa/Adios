import React from "react";

import { styles } from "../home.styles";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

/** "Active Tasks", "Scheduled Rides (2)" — the heading above a home section. */
export function SectionHeading({ title }: { title: React.ReactNode }) {
  return (
    <Box style={styles.sectionHeader}>
      <AppText style={styles.sectionTitle}>{title}</AppText>
    </Box>
  );
}
