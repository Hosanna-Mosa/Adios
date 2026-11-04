import React from "react";
import { useTranslation } from "react-i18next";

import type { StyleProp, ViewStyle } from "react-native";
import { Colors } from "@/constants/colors";
import { styles } from "./IncomingOrderModal.styles";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";
import { AnimatedBox } from "@/components/ui/AnimatedBox";

/** Job title, payout, and the sub-line that differs for scheduled and
 * helper offers. The payout is labelled "You earn" and, for a cash job, sits
 * over the amount to collect — the two used to show as one bare ₹ figure each,
 * which read as a fare mismatch against the customer's price. */
export function OfferHeader({
  title,
  earnings,
  isReserved,
  scheduledFor,
  isHelper,
  bookedHoursLabel,
  paymentMethod,
  payableAmount,
}: {
  title: string;
  earnings: React.ReactNode;
  isReserved?: boolean;
  scheduledFor: string;
  isHelper: boolean;
  /** Helper offers: "2 hrs", from the booked hours. */
  bookedHoursLabel?: string | null;
  paymentMethod?: "cash" | "online";
  /** What the customer pays — the cash to collect on a cash job. */
  payableAmount?: number;
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
          isHelper && (
            <AppText style={styles.subtitle}>
              {bookedHoursLabel
                ? t("jobs.helperTaskBookedFor", { value: bookedHoursLabel })
                : t("jobs.hoursBookTaskSpecialist")}
            </AppText>
          )
        )}
      </Box>
      <Box style={{ alignItems: "flex-end" }}>
        <AppText style={styles.subtitle}>{t("jobs.youEarn")}</AppText>
        <AppText style={styles.earnings}>₹{earnings}</AppText>
        {paymentMethod ? (
          <AppText style={styles.subtitle}>
            {paymentMethod === "cash" ? t("jobs.cashToCollect", { amount: payableAmount ?? 0 }) : t("jobs.paidOnline")}
          </AppText>
        ) : null}
      </Box>
    </Box>
  );
}

/** In place of the countdown on a food offer: when the food is ready and how far
 * away the rider is. The offer has no timer — the first rider to accept gets it. */
export function OfferReadyInfo({
  readyAt,
  etaMinutes,
}: {
  readyAt?: string | null;
  etaMinutes?: number;
}) {
  const { t } = useTranslation();
  const readyIn = readyAt ? Math.round((new Date(readyAt).getTime() - Date.now()) / 60000) : null;
  const readyLine =
    readyIn !== null && readyIn > 0
      ? t("jobs.foodReadyIn", { value: readyIn })
      : t("jobs.foodReadyNow");
  return (
    <Box style={styles.timerContainer}>
      <AppText style={[styles.timerText, { color: Colors.brand }]}>
        {etaMinutes !== undefined ? `${readyLine} · ${t("jobs.youAreMinAway", { value: Math.max(1, etaMinutes) })}` : readyLine}
      </AppText>
      <AppText style={[styles.subtitle, { marginTop: 4 }]}>{t("jobs.firstToAcceptGetsIt")}</AppText>
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
