import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useToast } from "@/components/ui/Toast";
import { useTokens } from "@/contexts/themeStore";
import { usePartnerProfile, useUpdateProfile } from "@/queries/profile.queries";
import { DAY_KEYS, type DayHours, type DayKey, type WeekHours } from "@/types/hours";
import { errorMessage } from "@/utils/errorMessage";
import { createHoursStyles } from "./hours.styles";
import { ALL_DAY, DEFAULT_DAY, defaultWeek, isAllDay } from "./time";

/** Which time of which day the picker is open for. */
export type PickerTarget = { day: DayKey; edge: "open" | "close" };

/**
 * Opening hours: the outlet's week, one window per day — PUT /vendors/me
 * { openingHours }. Customers see the outlet closed outside these hours even
 * when "Accepting orders" is on.
 */
export function useOpeningHours() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const tokens = useTokens();
  const styles = useMemo(() => createHoursStyles(tokens), [tokens]);
  const toast = useToast();
  const { profile, loaded, failed } = usePartnerProfile();
  const save = useUpdateProfile();
  const [week, setWeek] = useState<WeekHours>(defaultWeek);
  const [initial, setInitial] = useState<string>("");
  /** The outlet had no schedule at all (open whenever the switch is on). */
  const [unscheduled, setUnscheduled] = useState(false);
  const [picker, setPicker] = useState<PickerTarget | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Fill once from the server profile, so the minute's refresh never undoes edits.
  useEffect(() => {
    if (hydrated || !(loaded || failed)) return;
    const saved = profile?.openingHours ?? null;
    const next = saved ? ({ ...defaultWeek(), ...saved } as WeekHours) : defaultWeek();
    setWeek(next);
    setInitial(JSON.stringify(next));
    setUnscheduled(!saved);
    setHydrated(true);
  }, [hydrated, loaded, failed, profile]);

  const setDay = (day: DayKey, patch: Partial<DayHours>) => setWeek((prev) => ({ ...prev, [day]: { ...prev[day], ...patch } }));

  const toggleOpen = (day: DayKey, open: boolean) =>
    setDay(day, open ? { closed: false, ...(week[day].open ? {} : DEFAULT_DAY) } : { closed: true });

  const toggleAllDay = (day: DayKey) =>
    setDay(day, isAllDay(week[day]) ? { open: DEFAULT_DAY.open, close: DEFAULT_DAY.close } : { ...ALL_DAY, closed: false });

  const copyToAll = (from: DayKey) => {
    setWeek((prev) => Object.fromEntries(DAY_KEYS.map((day) => [day, { ...prev[from] }])) as WeekHours);
    toast.show(t("hours.copied"), "success");
  };

  const pickTime = (value: string) => {
    if (!picker) return;
    const { day, edge } = picker;
    const other = edge === "open" ? week[day].close : week[day].open;
    // Picking the same time for both ends would silently mean "24 hours".
    if (value === other) {
      toast.show(t("hours.sameTime"), "error");
      return;
    }
    setDay(day, { [edge]: value });
    setPicker(null);
  };

  const openDays = DAY_KEYS.filter((day) => !week[day].closed).length;
  const dirty = unscheduled || JSON.stringify(week) !== initial;

  const submit = () => {
    if (!openDays) {
      toast.show(t("hours.noOpenDays"), "error");
      return;
    }
    if (!dirty) return router.back();
    save.mutate(
      { openingHours: week },
      {
        onSuccess: () => {
          toast.show(t("hours.saved"), "success");
          router.back();
        },
        onError: (error) => toast.show(errorMessage(error, t("hours.saveFailed")), "error"),
      },
    );
  };

  return {
    insets,
    tokens,
    styles,
    loading: !hydrated,
    week,
    unscheduled,
    openState: profile?.openState,
    toggleOpen,
    toggleAllDay,
    copyToAll,
    picker,
    openPicker: setPicker,
    closePicker: () => setPicker(null),
    pickTime,
    saving: save.isPending,
    submit,
  };
}
