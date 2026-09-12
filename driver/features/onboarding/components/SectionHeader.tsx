import React from "react";

import { Colors } from "@/constants/colors";
import { typography } from "@/constants/typography";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

/** Title + optional subtitle above a form section.
 * Was defined identically in both onboarding.tsx and identity-verify.tsx. */
export function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <Box style={{ marginBottom: 16 }}>
      <AppText style={{ fontSize: typography.sizes.extraLarge, fontWeight: "700", color: Colors.text }}>{title}</AppText>
      {subtitle && (
        <AppText style={{ fontSize: typography.sizes.medium, color: Colors.textSecondary, marginTop: 4, lineHeight: typography.lineHeights.medium }}>
          {subtitle}
        </AppText>
      )}
    </Box>
  );
}
