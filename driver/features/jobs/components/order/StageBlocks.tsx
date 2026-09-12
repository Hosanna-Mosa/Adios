import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { styles } from "../../active-order.styles";

/** Surge hotspots suggested after a job completes. */
export function HighDemandZones({ title, zones }: { title: string; zones: string[] }) {
  return (
    <View style={styles.heatmapZones}>
      <Text style={styles.checklistHeader}>{title}</Text>
      {zones.map((zone) => (
        <View key={zone} style={styles.hotspotItem}>
          <Ionicons name="flame" size={16} color={Colors.brand} />
          <Text style={styles.hotspotText}>{zone}</Text>
        </View>
      ))}
    </View>
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
    <View style={styles.optionsBlock}>
      <Text style={styles.blockLabel}>{label}</Text>
      <View style={styles.optionsRow}>
        {options.map((opt) => {
          const active = selected === opt;
          return (
            <TouchableOpacity
              key={opt}
              style={[styles.optionBtn, active ? styles.optionBtnSelected : null]}
              onPress={() => onSelect(opt)}
            >
              <Text style={[styles.optionBtnText, active ? styles.optionBtnTextSelected : null]}>
                {opt.toUpperCase()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
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
    <View style={styles.pickupActionRow}>
      <TouchableOpacity style={styles.issueBtn} onPress={onReportIssue}>
        <Ionicons name="warning-outline" size={20} color={Colors.error} />
        <Text style={styles.issueBtnText}>Issue</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.pickupConfirmBtn]} onPress={onConfirm}>
        <Text style={styles.actionBtnText}>{confirmLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

/** Stage title with contact buttons on the same line. */
export function StageTitleRow({ title, actions }: { title: string; actions: React.ReactNode }) {
  return (
    <View style={styles.stepTitleRow}>
      <Text style={[styles.stepTitle, styles.stepTitleInRow]}>{title}</Text>
      {actions}
    </View>
  );
}
