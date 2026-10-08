import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { FullScreenLoader } from "@/components/ui/FullScreenLoader";
import { Header } from "@/components/ui/Header";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { DayHoursCard } from "@/features/account/hours/components/DayHoursCard";
import { HoursIntro } from "@/features/account/hours/components/HoursIntro";
import { TimePickerSheet } from "@/features/account/hours/components/TimePickerSheet";
import { todayKey } from "@/features/account/hours/time";
import { useOpeningHours } from "@/features/account/hours/useOpeningHours";
import { DAY_KEYS } from "@/types/hours";

/** Opening hours: the days and times customers can order from the outlet. */
export default function OpeningHoursScreen() {
  const { t } = useTranslation();
  const h = useOpeningHours();
  const header = <Header title={t("hours.title")} subtitle={t("hours.subtitle")} onBack={() => router.back()} backDisabled={h.saving} />;

  if (h.loading) {
    return (
      <ScreenShell style={{ paddingTop: h.insets.top + 8 }} header={header}>
        <FullScreenLoader color={h.tokens.brand} style={{ flex: 1 }} />
      </ScreenShell>
    );
  }

  const today = todayKey();
  const picking = h.picker;

  return (
    <ScreenShell
      style={{ paddingTop: h.insets.top + 8 }}
      header={header}
      scroll
      contentStyle={h.styles.content}
      footer={<Button title={t("hours.save")} onPress={h.submit} loading={h.saving} fullWidth />}
    >
      <HoursIntro status={h.openState?.label} unscheduled={h.unscheduled} styles={h.styles} />
      {DAY_KEYS.map((day) => (
        <DayHoursCard
          key={day}
          day={day}
          hours={h.week[day]}
          isToday={day === today}
          onToggleOpen={(open) => h.toggleOpen(day, open)}
          onToggleAllDay={() => h.toggleAllDay(day)}
          onPick={(edge) => h.openPicker({ day, edge })}
          onCopyToAll={() => h.copyToAll(day)}
          styles={h.styles}
          tokens={h.tokens}
        />
      ))}
      <TimePickerSheet
        visible={!!picking}
        title={picking ? t(picking.edge === "open" ? "hours.pickOpen" : "hours.pickClose", { day: t(`hours.days.${picking.day}`) }) : ""}
        value={picking ? h.week[picking.day][picking.edge] : "09:00"}
        onClose={h.closePicker}
        onSelect={h.pickTime}
        styles={h.styles}
      />
    </ScreenShell>
  );
}
