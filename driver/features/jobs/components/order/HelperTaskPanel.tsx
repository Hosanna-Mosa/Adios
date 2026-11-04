import React from "react";
import { useTranslation } from "react-i18next";

import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { helperTaskStyles as styles } from "./HelperTaskPanel.styles";
import { Touchable } from "@/components/ui/Touchable";
import { ScrollBox } from "@/components/ui/ScrollBox";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

/** Elapsed time on a helper booking, red once it runs over. */
export function TaskTimerDisplay({
  time,
  isOvertime,
}: {
  time: string;
  isOvertime: boolean;
}) {
  return (
    <Box style={styles.timerRow}>
      <Ionicons name="time" size={28} color={isOvertime ? Colors.error : Colors.success} />
      <AppText style={[styles.timerText, { color: isOvertime ? Colors.error : Colors.text }]}>
        {time}
      </AppText>
    </Box>
  );
}

/** Progress against the hours booked, with elapsed/overtime labels. */
export function TaskProgressBar({
  progress,
  isOvertime,
  overtimeMinutes,
  hoursBooked,
}: {
  progress: number;
  isOvertime: boolean;
  /** Minutes past the booked hours, shown as "+15 min over". */
  overtimeMinutes?: number;
  hoursBooked: string | number;
}) {
  const { t } = useTranslation();
  return (
    <>
      <Box style={styles.progressTrack}>
        <Box
          style={{
            flex: Math.round(progress),
            backgroundColor: isOvertime ? Colors.error : Colors.success,
          }}
        />
        <Box style={[{ flex: Math.max(0, 100 - Math.round(progress)) }, styles.progressRest]} />
      </Box>
      <Box style={styles.progressLabels}>
        <AppText style={styles.progressLabel}>{isOvertime
            ? overtimeMinutes && overtimeMinutes > 0
              ? t("jobs.overtimeByMin", { value: overtimeMinutes })
              : t("jobs.overtime")
            : t("jobs.elapsed")}</AppText>
        <AppText style={styles.progressLabel}>{t("jobs.hoursBookedN", { value: hoursBooked, defaultValue: "{{value}} Hours Booked" })}</AppText>
      </Box>
    </>
  );
}

/** Canned status messages the driver can send mid-task. */
export function QuickUpdateChips({
  heading,
  updates,
  onSend,
}: {
  heading: string;
  updates: string[];
  onSend: (text: string) => void;
}) {
  return (
    <>
      <AppText style={styles.updatesHeading}>{heading}</AppText>
      <ScrollBox horizontal showsHorizontalScrollIndicator={false} style={styles.updatesScroll}>
        {updates.map((text, idx) => (
          <Touchable key={idx} style={styles.updateChip} onPress={() => onSend(text)}>
            <AppText style={styles.updateChipText}>{text}</AppText>
          </Touchable>
        ))}
      </ScrollBox>
    </>
  );
}
