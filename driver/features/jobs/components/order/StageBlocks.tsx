import React from "react";

import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { styles } from "../../active-order.styles";
import { Touchable } from "@/components/ui/Touchable";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

/** Surge hotspots suggested after a job completes. */
export function HighDemandZones({ title, zones }: { title: string; zones: string[] }) {
  return (
    <Box style={styles.heatmapZones}>
      <AppText style={styles.checklistHeader}>{title}</AppText>
      {zones.map((zone) => (
        <Box key={zone} style={styles.hotspotItem}>
          <Ionicons name="flame" size={16} color={Colors.brand} />
          <AppText style={styles.hotspotText}>{zone}</AppText>
        </Box>
      ))}
    </Box>
  );
}

/** Segmented picker — door / gate / contactless. */
export function OptionPicker<T extends string>({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string;
  options: readonly T[];
  selected: T;
  onSelect: (value: T) => void;
}) {
  return (
    <Box style={styles.optionsBlock}>
      <AppText style={styles.blockLabel}>{label}</AppText>
      <Box style={styles.optionsRow}>
        {options.map((opt) => {
          const active = selected === opt;
          return (
            <Touchable
              key={opt}
              style={[styles.optionBtn, active ? styles.optionBtnSelected : null]}
              onPress={() => onSelect(opt)}
            >
              <AppText style={[styles.optionBtnText, active ? styles.optionBtnTextSelected : null]}>
                {opt.toUpperCase()}
              </AppText>
            </Touchable>
          );
        })}
      </Box>
    </Box>
  );
}

/** Report-an-issue and confirm buttons side by side at pickup. */
export function PickupActionRow({
  onReportIssue,
  onConfirm,
  confirmLabel,
}: {
  onReportIssue: () => void;
  onConfirm: () => void;
  confirmLabel: string;
}) {
  return (
    <Box style={styles.pickupActionRow}>
      <Touchable style={styles.issueBtn} onPress={onReportIssue}>
        <Ionicons name="warning-outline" size={20} color={Colors.error} />
        <AppText style={styles.issueBtnText}>Issue</AppText>
      </Touchable>
      <Touchable style={[styles.pickupConfirmBtn]} onPress={onConfirm}>
        <AppText style={styles.actionBtnText}>{confirmLabel}</AppText>
      </Touchable>
    </Box>
  );
}

/** Stage title with contact buttons on the same line. */
export function StageTitleRow({ title, actions }: { title: string; actions: React.ReactNode }) {
  return (
    <Box style={styles.stepTitleRow}>
      <AppText style={[styles.stepTitle, styles.stepTitleInRow]}>{title}</AppText>
      {actions}
    </Box>
  );
}
