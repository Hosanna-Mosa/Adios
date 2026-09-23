import React from "react";
import { useTranslation } from "react-i18next";

import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { staggerListItem } from "@/motion/presets";
import { declineStyles as styles } from "./DeclineReasonList.styles";
import { typography } from "@/constants/typography";
import { Touchable } from "@/components/ui/Touchable";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";
import { AnimatedBox } from "@/components/ui/AnimatedBox";

// `value` is the stable reason sent with the rejection — kept in English so
// backend records stay consistent regardless of the driver's language.
const REASONS = [
  { value: "Fare is too low", labelKey: "jobs.declineReasonFareTooLow" },
  { value: "Distance is too long", labelKey: "jobs.declineReasonDistanceTooLong" },
  { value: "Pickup is too far", labelKey: "jobs.declineReasonPickupTooFar" },
  { value: "Not interested right now", labelKey: "jobs.declineReasonNotInterested" },
];

/** Why the driver is turning an offer down. */
export function DeclineReasonList({
  onDecline,
  onBack,
}: {
  onDecline: (reason: string) => void;
  onBack: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Box style={styles.wrap}>
      <AppText style={styles.heading}>{t("jobs.whyAreYouDeclining")}</AppText>
      {REASONS.map((reason, idx) => (
        <AnimatedBox key={reason.value} entering={staggerListItem(idx)}>
          <Touchable style={styles.row} onPress={() => onDecline(reason.value)}>
            <AppText style={styles.rowText}>{t(reason.labelKey)}</AppText>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </Touchable>
        </AnimatedBox>
      ))}
      <Touchable style={styles.back} onPress={onBack}>
        <AppText style={{ fontSize: typography.sizes.large, fontWeight: "700", color: Colors.textSecondary }}>
          {t("jobs.backToOrder")}
        </AppText>
      </Touchable>
    </Box>
  );
}
