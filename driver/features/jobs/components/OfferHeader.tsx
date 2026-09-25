import React from "react";
import { useTranslation } from "react-i18next";

import type { StyleProp, ViewStyle } from "react-native";
import { Colors } from "@/constants/colors";
import { styles } from "./IncomingOrderModal.styles";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";
import { AnimatedBox } from "@/components/ui/AnimatedBox";

/** Job title, payout, and the sub-line that differs for scheduled and
 * helper offers. */
export function OfferHeader({
  title,
  earnings,
  isReserved,
  scheduledFor,
  isHelper,
}: {
  title: string;
  earnings: React.ReactNode;
  isReserved?: boolean;
  scheduledFor: string;
  isHelper: boolean;
}) {
  const { t } = useTranslation();
  return (
    <Box style={styles.header}>
      <Box style={styles.headerCopy}>
        <AppText style={styles.title}>{title}</AppText>
        {isReserved ? (
          <AppText style={[styles.subtitle, { color: Colors.brand, fontWeight: "700" }]}>
            {t("jobs.scheduledColon", { value: scheduledFor, defaultValue: "Scheduled: {{value}}" })}
          </AppText>
        ) : (
          isHelper && <AppText style={styles.subtitle}>{t("jobs.hoursBookTaskSpecialist")}</AppText>
        )}
      </Box>
      <AppText style={styles.earnings}>₹{earnings}</AppText>
    </Box>
  );
}

/** Bar that drains while the offer is live. */
export function OfferCountdown({
  secondsLeft,
  barStyle,
}: {
  secondsLeft: number;
  barStyle: StyleProp<ViewStyle>;
}) {
  const { t } = useTranslation();
  return (
    <Box style={styles.timerContainer}>
      <Box style={styles.timerBarBg}>
        <AnimatedBox style={[styles.timerBar, barStyle]} />
      </Box>
      <AppText style={styles.timerText}>
        {t("jobs.declineAutoTriggersIn", { value: secondsLeft, defaultValue: "Decline auto-triggers in {{value}} seconds" })}
      </AppText>
    </Box>
  );
}
