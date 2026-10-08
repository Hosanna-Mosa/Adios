import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Chip } from "@/components/ui/Badge";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import type { HoursStyles } from "../hours.styles";
import { fromParts, timeLabel, toParts, type TimeParts } from "../time";

const HOURS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const MINUTES = [0, 15, 30, 45];

interface Props {
  visible: boolean;
  title: string;
  value: string;
  onClose: () => void;
  onSelect: (hhmm: string) => void;
  styles: HoursStyles;
}

/** Hour, minute (quarter hours) and AM/PM as tap targets, so no native picker is needed. */
export function TimePickerSheet({ visible, title, value, onClose, onSelect, styles }: Props) {
  const { t } = useTranslation();
  const [parts, setParts] = useState<TimeParts>(() => toParts(value));
  useEffect(() => {
    if (visible) setParts(toParts(value));
  }, [visible, value]);

  const set = (patch: Partial<TimeParts>) => setParts((prev) => ({ ...prev, ...patch }));
  const chosen = fromParts(parts);
  // A saved time off the quarter hour (e.g. from onboarding) stays selectable.
  const minutes = MINUTES.includes(parts.minute) ? MINUTES : [...MINUTES, parts.minute].sort((a, b) => a - b);

  return (
    <BottomSheet visible={visible} onClose={onClose} title={title}>
      <View style={styles.pickerBody}>
        <Text style={styles.preview}>{timeLabel(chosen)}</Text>
        <Text style={styles.pickerLabel}>{t("hours.hour")}</Text>
        <View style={styles.grid}>
          {HOURS.map((h) => (
            <Chip key={h} label={String(h)} selected={parts.hour12 === h} onPress={() => set({ hour12: h })} />
          ))}
        </View>
        <Text style={styles.pickerLabel}>{t("hours.minute")}</Text>
        <View style={styles.grid}>
          {minutes.map((m) => (
            <Chip key={m} label={`:${String(m).padStart(2, "0")}`} selected={parts.minute === m} onPress={() => set({ minute: m })} />
          ))}
        </View>
        <View style={styles.grid}>
          <Chip label="AM" selected={!parts.pm} onPress={() => set({ pm: false })} />
          <Chip label="PM" selected={parts.pm} onPress={() => set({ pm: true })} />
        </View>
        <View style={styles.pickerActions}>
          <Button title={t("actions.cancel")} variant="secondary" onPress={onClose} style={styles.pickerAction} />
          <Button title={t("hours.setTime")} onPress={() => onSelect(chosen)} style={styles.pickerAction} />
        </View>
      </View>
    </BottomSheet>
  );
}
