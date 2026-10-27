import React, { useState } from "react";
import { Platform, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import DateTimePicker, { type DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Feather } from "@expo/vector-icons";

import { Colors } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";
import { AppText } from "@/components/ui/AppText";
import { Box } from "@/components/ui/Box";
import { Button } from "@/components/ui/Button";
import { PressBox } from "@/components/ui/PressBox";
import { styles as earningsStyles } from "../earnings.styles";
import { formatDay, useStatement } from "../hooks/useStatement";
import { fromYmd } from "../utils/statementDates";
import { StatementView } from "./StatementView";

type Picking = "from" | "to" | null;

function DateField({ label, value, placeholder, onPress }: { label: string; value: string; placeholder: string; onPress: () => void }) {
  return (
    <PressBox style={local.field} onPress={onPress} accessibilityRole="button" accessibilityLabel={label}>
      <AppText style={local.fieldLabel}>{label}</AppText>
      <Box style={local.fieldValueRow}>
        <Feather name="calendar" size={16} color={Colors.brand} />
        <AppText style={[local.fieldValue, !value && local.placeholder]} numberOfLines={1}>
          {value || placeholder}
        </AppText>
      </Box>
    </PressBox>
  );
}

/**
 * Statements: the driver picks a start and an end date; the dates are checked against the day they
 * started working. Up to a year the statement shows here with a PDF to download; longer than a
 * year it is emailed to them.
 */
export function StatementSection() {
  const { t, i18n } = useTranslation();
  const s = useStatement();
  const [picking, setPicking] = useState<Picking>(null);

  const onPick = (which: "from" | "to") => (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === "android") setPicking(null);
    if (event.type === "dismissed" || !date) return;
    (which === "from" ? s.setFrom : s.setTo)(date);
  };

  const max = s.bounds ? fromYmd(s.bounds.maxDate) : new Date();
  const min = s.bounds ? fromYmd(s.bounds.minDate) : undefined;
  const fmt = (d: Date | null) => (d ? formatDay(d, i18n.language) : "");

  return (
    <Box style={[earningsStyles.sectionCard, local.wrap]}>
      <AppText style={earningsStyles.sectionTitle}>{t("earnings.statements", { defaultValue: "Statements" })}</AppText>
      <AppText style={local.hint}>
        {s.bounds
          ? t("earnings.statementsHint", {
              defaultValue: "Choose the dates you need, from {{start}} (the day you started) to today.",
              start: formatDay(min!, i18n.language),
            })
          : t("earnings.statementsHintPlain", { defaultValue: "Choose the dates you need a statement for." })}
      </AppText>

      {s.boundsError ? (
        <Box style={local.retryRow}>
          <AppText style={local.error}>{t("earnings.statementBoundsFailed", { defaultValue: "Couldn't load your dates." })}</AppText>
          <Button title={t("orders.retry", { defaultValue: "Try again" })} size="sm" variant="secondary" onPress={s.loadBounds} />
        </Box>
      ) : (
        <>
          <Box style={local.fields}>
            <DateField
              label={t("earnings.statementFrom", { defaultValue: "From" })}
              value={fmt(s.from)}
              placeholder={t("earnings.statementPickDate", { defaultValue: "Select date" })}
              onPress={() => setPicking("from")}
            />
            <DateField
              label={t("earnings.statementTo", { defaultValue: "To" })}
              value={fmt(s.to)}
              placeholder={t("earnings.statementPickDate", { defaultValue: "Select date" })}
              onPress={() => setPicking("to")}
            />
          </Box>

          {picking ? (
            <Box>
              <DateTimePicker
                value={(picking === "from" ? s.from : s.to) ?? max}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                minimumDate={min}
                maximumDate={max}
                onChange={onPick(picking)}
              />
              {Platform.OS === "ios" ? (
                <Button title={t("actions.done", { defaultValue: "Done" })} size="sm" variant="secondary" onPress={() => setPicking(null)} />
              ) : null}
            </Box>
          ) : null}

          {s.error ? <AppText style={local.error}>{s.error}</AppText> : null}

          {s.willEmail ? (
            <Box style={local.notice}>
              <Feather name="mail" size={16} color={Colors.primaryDark} />
              <AppText style={local.noticeText}>
                {t("earnings.statementOverYear", {
                  defaultValue: "That's more than a year. We'll send this statement to your email instead of showing it here.",
                })}
              </AppText>
            </Box>
          ) : null}

          <Button
            title={
              s.willEmail
                ? t("earnings.statementEmailMe", { defaultValue: "Email me the statement" })
                : t("earnings.statementView", { defaultValue: "View statement" })
            }
            onPress={s.generate}
            loading={s.isLoading}
            disabled={!s.bounds}
            fullWidth
          />

          {s.result ? <StatementView result={s.result} onDownload={s.downloadPdf} isMakingPdf={s.isMakingPdf} /> : null}
        </>
      )}
    </Box>
  );
}

const local = StyleSheet.create({
  wrap: { gap: 10 },
  hint: { fontSize: typography.sizes.small, color: Colors.textMuted },
  fields: { flexDirection: "row", gap: 10 },
  field: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: Colors.surface,
  },
  fieldLabel: { fontSize: typography.sizes.small, color: Colors.textMuted },
  fieldValueRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  fieldValue: { flexShrink: 1, fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: Colors.text },
  placeholder: { color: Colors.textMuted, fontFamily: fontFamilies.body.regular },
  error: { fontSize: typography.sizes.medium, color: Colors.error },
  retryRow: { gap: 8, alignItems: "flex-start" },
  notice: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
    padding: 12,
    borderRadius: 10,
    backgroundColor: Colors.brandSkin,
  },
  noticeText: { flex: 1, fontSize: typography.sizes.medium, color: Colors.primaryDark },
});
