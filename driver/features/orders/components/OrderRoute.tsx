import React from "react";
import { useTranslation } from "react-i18next";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";
import { styles } from "../orders.styles";

/** Pickup and drop-off as a vertical timeline. Either may be missing (a helper task has one stop). */
export function OrderRoute({ pickup, drop, lines = 1 }: { pickup: string; drop: string; lines?: number }) {
  const { t } = useTranslation();
  if (!pickup && !drop) return null;
  const both = !!pickup && !!drop;
  return (
    <Box style={styles.route}>
      <Box style={styles.rail}>
        <Box style={[styles.dot, styles.dotPickup]} />
        {both ? <Box style={styles.railLine} /> : null}
        {both ? <Box style={[styles.dot, styles.dotDrop]} /> : null}
      </Box>
      <Box style={styles.routeText}>
        {pickup ? (
          <Box>
            <AppText style={styles.routeLabel}>{t("jobs.pickup")}</AppText>
            <AppText style={styles.routeAddress} numberOfLines={lines}>{pickup}</AppText>
          </Box>
        ) : null}
        {drop ? (
          <Box>
            <AppText style={styles.routeLabel}>{t("orders.drop", { defaultValue: "Drop-off" })}</AppText>
            <AppText style={styles.routeAddress} numberOfLines={lines}>{drop}</AppText>
          </Box>
        ) : null}
      </Box>
    </Box>
  );
}
