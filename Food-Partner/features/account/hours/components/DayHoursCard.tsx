import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { Chip } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import type { ThemeTokens } from "@/constants/colors";
import type { DayHours, DayKey } from "@/types/hours";
import type { HoursStyles } from "../hours.styles";
import { closesNextDay, isAllDay, timeLabel } from "../time";

interface Props {
  day: DayKey;
  hours: DayHours;
  isToday: boolean;
  onToggleOpen: (open: boolean) => void;
  onToggleAllDay: () => void;
  onPick: (edge: "open" | "close") => void;
  onCopyToAll: () => void;
  styles: HoursStyles;
  tokens: ThemeTokens;
}

/** One day: open/closed switch, opening and closing time, "24 hours", and "Copy to all days". */
export function DayHoursCard({ day, hours, isToday, onToggleOpen, onToggleAllDay, onPick, onCopyToAll, styles, tokens }: Props) {
  const { t } = useTranslation();
  const dayName = t(`hours.days.${day}`);
  const allDay = isAllDay(hours);
  const summary = hours.closed ? t("hours.closed") : allDay ? t("hours.open24") : `${timeLabel(hours.open)} – ${timeLabel(hours.close)}`;

  const timeBox = (edge: "open" | "close") => {
    const label = edge === "open" ? t("hours.opens") : t("hours.closes");
    return (
      <View style={styles.time}>
        <Text style={styles.timeLabel}>{label}</Text>
        <Button
          title={timeLabel(hours[edge])}
          variant="secondary"
          onPress={() => onPick(edge)}
          icon={<Ionicons name="time-outline" size={16} color={tokens.text} />}
          accessibilityLabel={`${dayName} ${label} ${timeLabel(hours[edge])}`}
          fullWidth
        />
      </View>
    );
  };

  return (
    <Card bordered elevationLevel="none" style={styles.day}>
      <View style={styles.dayHead}>
        <View style={styles.dayTexts}>
          <Text style={styles.dayName}>
            {dayName}
            {isToday ? <Text style={styles.todayTag}>{`  ·  ${t("hours.today")}`}</Text> : null}
          </Text>
          <Text style={styles.daySummary}>{summary}</Text>
        </View>
        <ToggleSwitch value={!hours.closed} onValueChange={onToggleOpen} accessibilityLabel={t("hours.openOn", { day: dayName })} />
      </View>
      {!hours.closed ? (
        <>
          {!allDay ? (
            <View style={styles.times}>
              {timeBox("open")}
              {timeBox("close")}
            </View>
          ) : null}
          {closesNextDay(hours) ? <Text style={styles.nextDay}>{t("hours.nextDay")}</Text> : null}
          <View style={styles.dayActions}>
            <Chip
              label={t("hours.open24")}
              selected={allDay}
              onPress={onToggleAllDay}
              icon={<Ionicons name="time-outline" size={14} color={allDay ? tokens.onBrand : tokens.sec} />}
            />
            <Button title={t("hours.copyToAll")} variant="link" size="sm" onPress={onCopyToAll} />
          </View>
        </>
      ) : null}
    </Card>
  );
}
