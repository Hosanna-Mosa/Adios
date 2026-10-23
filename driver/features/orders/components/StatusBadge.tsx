import React from "react";
import { useTranslation } from "react-i18next";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";
import { styles } from "../orders.styles";
import { orderStatusView, toneColors } from "../utils/orderView";

/** A small pill: coloured dot and word ("Completed", "Ongoing", "Cancelled"). */
export function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation();
  const view = orderStatusView(status);
  const color = toneColors(view.tone);
  return (
    <Box style={[styles.badge, { backgroundColor: color.bg }]}>
      <Box style={[styles.badgeDot, { backgroundColor: color.fg }]} />
      <AppText style={[styles.badgeText, { color: color.fg }]}>
        {t(view.labelKey, { defaultValue: view.fallback })}
      </AppText>
    </Box>
  );
}
