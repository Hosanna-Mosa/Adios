import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useThemeStore } from "@/contexts/themeStore";
import { createStyles } from "./ScheduleDateTimeSheet.styles";
import { getDefaultTimeParts, timePartsOf } from "./ScheduleDateTimeSheet.helpers";
import { showAlert } from "@/components/ui/AppAlert";

// State and animation wiring for ScheduleDateTimeSheet, moved out so both files stay
// under 150 lines. The statements keep their original order.

export function useScheduleDateTimeSheet(visible: any, onClose: any, onConfirm: any, initialDate: any, accent: any) {
  const insets = useSafeAreaInsets();
  const { theme } = useThemeStore();
  const colors = Colors[theme];
  const primary = accent || colors.primary;
  const styles = React.useMemo(() => createStyles(colors, primary), [theme, primary]);

  const dateOptions = React.useMemo(() => {
    const arr: Date[] = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      arr.push(d);
    }
    return arr;
  }, []);

  const [selectedDate, setSelectedDate] = React.useState<Date>(initialDate || new Date());
  const [hour, setHour] = React.useState("12");
  const [minute, setMinute] = React.useState("00");
  const [ampm, setAmpm] = React.useState<"AM" | "PM">("PM");

  React.useEffect(() => {
    if (!visible) return;
    // Reopening with a slot already chosen must show THAT slot — deriving the
    // time from `now + 45` here silently moved every re-edit forward.
    if (initialDate) {
      const parts = timePartsOf(initialDate);
      setSelectedDate(initialDate);
      setHour(parts.hour);
      setMinute(parts.minute);
      setAmpm(parts.ampm);
      return;
    }
    const defaults = getDefaultTimeParts();
    setSelectedDate(defaults.date);
    setHour(defaults.hour);
    setMinute(defaults.minute);
    setAmpm(defaults.ampm);
  }, [visible, initialDate]);

  const buildSelectedDateTime = () => {
    const finalDate = new Date(selectedDate);
    let hr = parseInt(hour, 10);
    if (ampm === "PM" && hr < 12) hr += 12;
    if (ampm === "AM" && hr === 12) hr = 0;
    finalDate.setHours(hr, parseInt(minute, 10), 0, 0);
    return finalDate;
  };

  const previewText = buildSelectedDateTime().toLocaleString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  const handleConfirm = () => {
    const selected = buildSelectedDateTime();
    if (selected.getTime() <= Date.now()) {
      showAlert("Invalid time", "Please choose a future delivery time.");
      return;
    }
    onConfirm(selected);
  };


  return {
  insets, styles, dateOptions, selectedDate, setSelectedDate, hour, setHour, minute, setMinute,
  ampm, setAmpm, previewText, handleConfirm
  };
}
