import React, { useMemo, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import * as WebBrowser from "expo-web-browser";
import { Feather } from "@expo/vector-icons";

import { Colors, radius } from "@/constants/colors";
import { typography } from "@/constants/typography";
import { useDriverStore } from "@/store/driverStore";
import { API_URL } from "@/utils/apiUrl";
import { AppText } from "@/components/ui/AppText";
import { Box } from "@/components/ui/Box";
import { PressBox } from "@/components/ui/PressBox";
import { styles as earningsStyles } from "../earnings.styles";

const MONTHS_SHOWN = 6;

/** "YYYY-MM" for this month and the five before it, newest first. */
function recentMonths(now = new Date()) {
  return Array.from({ length: MONTHS_SHOWN }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    return { key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`, date: d };
  });
}

/**
 * Monthly earnings statement for tax / ITR records: pick a month and it opens in the
 * in-app browser, which can share, print or save it as a PDF. Earnings were only ever
 * shown on screen, with nothing to download.
 */
export function StatementSection() {
  const { t, i18n } = useTranslation();
  const [openingMonth, setOpeningMonth] = useState<string | null>(null);
  const months = useMemo(() => recentMonths(), []);

  const open = async (month: string) => {
    const token = useDriverStore.getState().token;
    if (!token) return;
    setOpeningMonth(month);
    try {
      const res = await fetch(`${API_URL}/drivers/earnings-statement-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ month }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body?.url) throw new Error(body?.message);
      await WebBrowser.openBrowserAsync(body.url);
    } catch (error: any) {
      Alert.alert(t("earnings.statementUnavailable"), error?.message || t("earnings.statementTryAgain"));
    } finally {
      setOpeningMonth(null);
    }
  };

  return (
    <Box style={local.wrap}>
      <AppText style={earningsStyles.sectionTitle}>{t("earnings.monthlyStatement")}</AppText>
      <AppText style={local.hint}>{t("earnings.monthlyStatementHint")}</AppText>
      <Box style={local.row}>
        {months.map(({ key, date }) => (
          <PressBox
            key={key}
            style={local.chip}
            onPress={() => open(key)}
            disabled={openingMonth !== null}
            accessibilityRole="button"
          >
            {openingMonth === key ? (
              <ActivityIndicator size="small" color={Colors.brand} />
            ) : (
              <>
                <Feather name="file-text" size={14} color={Colors.brand} />
                <AppText style={local.chipText}>
                  {date.toLocaleDateString(i18n.language || "en", { month: "short", year: "numeric" })}
                </AppText>
              </>
            )}
          </PressBox>
        ))}
      </Box>
    </Box>
  );
}

const local = StyleSheet.create({
  wrap: { marginTop: 8, gap: 6 },
  hint: { fontSize: typography.sizes.small, color: Colors.textMuted },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minHeight: 40,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  chipText: { fontSize: typography.sizes.medium, color: Colors.text },
});
