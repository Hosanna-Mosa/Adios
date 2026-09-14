import React from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import Colors from "@/constants/colors";
import { useThemeStore } from "@/contexts/themeStore";
import { createStyles } from "./ScheduleDateTimeSheet.styles";
import { useScheduleDateTimeSheet } from "./useScheduleDateTimeSheet";

type Props = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (date: Date) => void;
  title?: string;
  subtitle?: string;
  confirmLabel?: string;
  loading?: boolean;
  initialDate?: Date;
  /** Service accent of the screen presenting the sheet. Falls back to the brand colour. */
  accent?: string;
};

const HOUR_OPTIONS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
const MINUTE_OPTIONS = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];



export function ScheduleDateTimeSheet({
  visible, onClose, onConfirm, title,
  subtitle, confirmLabel,
  loading = false, initialDate, accent,
}: Props) {
  const {
  insets, styles, dateOptions, selectedDate, setSelectedDate, hour, setHour, minute, setMinute,
  ampm, setAmpm, previewText, handleConfirm
  } = useScheduleDateTimeSheet(visible, onClose, onConfirm, initialDate, accent);
  const { t } = useTranslation();
  const resolvedTitle = title ?? t("app.checkout.scheduleDelivery");
  const resolvedSubtitle = subtitle ?? t("app.ScheduleDateTimeSheet.selectYourPreferredDeliveryDay");
  const resolvedConfirmLabel = confirmLabel ?? t("app.ScheduleDateTimeSheet.ok");

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.scrim} activeOpacity={1} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + (Platform.OS === "ios" ? 16 : 20) }]}>
          <View style={styles.handle} />
          <Text style={styles.title}>{resolvedTitle}</Text>
          <Text style={styles.subtitle}>{resolvedSubtitle}</Text>

          <View style={styles.previewCard}>
            <Text style={styles.previewLabel}>{t("app.ScheduleDateTimeSheet.selectedSlot")}</Text>
            <Text style={styles.previewValue}>{previewText}</Text>
          </View>

          <Text style={styles.sectionLabel}>{t("app.ScheduleDateTimeSheet.selectDate")}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.datesContainer}
            contentContainerStyle={styles.datesContent}
          >
            {dateOptions.map((date, idx) => {
              const isSelected = selectedDate.toDateString() === date.toDateString();
              const dayName = idx === 0 ? t("app.ride.today") : idx === 1 ? t("app.ScheduleDateTimeSheet.tomorrow") : date.toLocaleDateString([], { weekday: "short" });
              const dateStr = date.toLocaleDateString([], { month: "short", day: "numeric" });
              return (
                <TouchableOpacity
                  key={date.toISOString()}
                  style={[styles.dateCard, isSelected && styles.dateCardActive]}
                  onPress={() => setSelectedDate(date)}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.dateDayText, isSelected && styles.dateDayTextActive]}>{dayName}</Text>
                  <Text style={[styles.dateValText, isSelected && styles.dateValTextActive]}>{dateStr}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Text style={styles.sectionLabel}>{t("app.ScheduleDateTimeSheet.hour")}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.timeRow}>
            {HOUR_OPTIONS.map((hr) => {
              const isSelected = hour === hr;
              return (
                <TouchableOpacity
                  key={hr}
                  style={[styles.timeChip, isSelected && styles.timeChipActive]}
                  onPress={() => setHour(hr)}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.timeChipText, isSelected && styles.timeChipTextActive]}>{hr}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Text style={styles.sectionLabel}>{t("app.ScheduleDateTimeSheet.minute")}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.timeRow}>
            {MINUTE_OPTIONS.map((min) => {
              const isSelected = minute === min;
              return (
                <TouchableOpacity
                  key={min}
                  style={[styles.timeChip, isSelected && styles.timeChipActive]}
                  onPress={() => setMinute(min)}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.timeChipText, isSelected && styles.timeChipTextActive]}>{min}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.ampmRow}>
            {(["AM", "PM"] as const).map((period) => {
              const isSelected = ampm === period;
              return (
                <TouchableOpacity
                  key={period}
                  style={[styles.ampmBtn, isSelected && styles.ampmBtnActive]}
                  onPress={() => setAmpm(period)}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.ampmBtnText, isSelected && styles.ampmBtnTextActive]}>{period}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={[styles.confirmBtn, loading && styles.confirmBtnDisabled]}
            onPress={handleConfirm}
            disabled={loading}
            activeOpacity={0.9}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmBtnText}>{resolvedConfirmLabel}</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
