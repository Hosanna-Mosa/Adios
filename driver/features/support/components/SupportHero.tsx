import React from "react";

import { styles } from "../support.styles";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

/** Badge, headline and blurb at the top of the support screen. */
export function SupportHero({
  badge,
  title,
  subtitle,
}: {
  badge: string;
  title: string;
  subtitle: string;
}) {
  return (
    <Box style={styles.heroSection}>
      <Box style={styles.heroBadge}>
        <AppText style={styles.heroBadgeText}>{badge}</AppText>
      </Box>
      <AppText style={styles.heroTitle}>{title}</AppText>
      <AppText style={styles.heroSubtitle}>{subtitle}</AppText>
    </Box>
  );
}
