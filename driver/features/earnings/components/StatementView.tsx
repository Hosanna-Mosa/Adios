import React from "react";
import { StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { Feather } from "@expo/vector-icons";

import { Colors } from "@/constants/colors";
import { fontFamilies, typography } from "@/constants/typography";
import { formatCurrency } from "@/utils/format";
import { AppText } from "@/components/ui/AppText";
import { Box } from "@/components/ui/Box";
import { Button } from "@/components/ui/Button";
import type { StatementResult } from "../types";

/** Longer lists stay readable here; the PDF always has every row. */
const ROWS_SHOWN = 15;

const rupees = (value: number) => formatCurrency(value, { decimals: false });
const shortDay = (iso: string, locale?: string) =>
  new Date(iso).toLocaleDateString(locale || "en", { day: "2-digit", month: "short" });

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <Box style={s.tile}>
      <AppText style={s.tileLabel}>{label}</AppText>
      <AppText style={s.tileValue}>{value}</AppText>
    </Box>
  );
}

function Row({ left, sub, right }: { left: string; sub: string; right: string }) {
  return (
    <Box style={s.row}>
      <Box style={s.rowText}>
        <AppText style={s.rowLeft} numberOfLines={1}>{left}</AppText>
        <AppText style={s.rowSub} numberOfLines={1}>{sub}</AppText>
      </Box>
      <AppText style={s.rowRight}>{right}</AppText>
    </Box>
  );
}

/** The statement, laid out for a phone: totals, then trips and cash-outs, then the PDF button. */
export function StatementView({
  result,
  onDownload,
  isMakingPdf,
}: {
  result: StatementResult;
  onDownload: () => void;
  isMakingPdf: boolean;
}) {
  const { t, i18n } = useTranslation();
  const { totals, trips, payouts } = result;
  const hiddenTrips = Math.max(0, trips.length - ROWS_SHOWN);

  return (
    <Box style={s.wrap}>
      <AppText style={s.period}>{result.label}</AppText>

      <Box style={s.tiles}>
        <Tile label={t("earnings.statementTrips", { defaultValue: "Completed trips" })} value={String(totals.trips)} />
        <Tile label={t("earnings.statementEarnings", { defaultValue: "Your earnings" })} value={rupees(totals.earningsTotal)} />
        <Tile label={t("earnings.statementFares", { defaultValue: "Customer fares" })} value={rupees(totals.fareTotal)} />
        <Tile label={t("earnings.statementCash", { defaultValue: "Cash you collected" })} value={rupees(totals.cashCollectedTotal)} />
        <Tile label={t("earnings.statementPaidToBank", { defaultValue: "Paid to your bank" })} value={rupees(totals.payoutsTotal)} />
      </Box>

      <AppText style={s.heading}>{t("earnings.statementTripsHeading", { defaultValue: "Trips" })}</AppText>
      {trips.length === 0 ? (
        <AppText style={s.empty}>{t("earnings.statementNoTrips", { defaultValue: "No completed trips in this period." })}</AppText>
      ) : (
        trips.slice(0, ROWS_SHOWN).map((trip) => (
          <Row
            key={trip.orderId}
            left={trip.service}
            sub={`${shortDay(trip.date, i18n.language)} · ${trip.paymentMethod === "cash" ? t("orders.cash", { defaultValue: "Cash" }) : t("orders.paidOnline", { defaultValue: "Paid online" })}`}
            right={rupees(trip.earning)}
          />
        ))
      )}
      {hiddenTrips > 0 ? (
        <AppText style={s.more}>
          {t("earnings.statementMoreInPdf", { count: hiddenTrips, defaultValue: "+{{count}} more trips in the PDF" })}
        </AppText>
      ) : null}

      <AppText style={s.heading}>{t("earnings.statementCashOutsHeading", { defaultValue: "Cash-outs" })}</AppText>
      {payouts.length === 0 ? (
        <AppText style={s.empty}>{t("earnings.statementNoCashOuts", { defaultValue: "No cash-outs in this period." })}</AppText>
      ) : (
        payouts.map((payout, i) => (
          <Row
            key={`${payout.date}-${i}`}
            left={rupees(payout.amount)}
            sub={`${shortDay(payout.date, i18n.language)}${payout.reference ? ` · ${payout.reference}` : ""}`}
            right={payout.status}
          />
        ))
      )}

      <Button
        title={t("earnings.statementDownloadPdf", { defaultValue: "Download PDF" })}
        icon={<Feather name="download" size={18} color={Colors.onBrand} />}
        onPress={onDownload}
        loading={isMakingPdf}
        fullWidth
        style={s.download}
      />
    </Box>
  );
}

const s = StyleSheet.create({
  wrap: { gap: 8, marginTop: 8 },
  period: { fontFamily: fontFamilies.heading.semibold, fontSize: typography.sizes.large, color: Colors.text },
  tiles: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  tile: {
    flexGrow: 1,
    flexBasis: "45%",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 12,
    backgroundColor: Colors.surfaceContainerLow,
  },
  tileLabel: { fontSize: typography.sizes.small, color: Colors.textMuted },
  tileValue: { fontFamily: fontFamilies.heading.semibold, fontSize: typography.sizes.large, color: Colors.text, marginTop: 2 },
  heading: {
    fontFamily: fontFamilies.body.semibold,
    fontSize: typography.sizes.medium,
    color: Colors.text,
    marginTop: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  rowText: { flex: 1, minWidth: 0 },
  rowLeft: { fontFamily: fontFamilies.body.medium, fontSize: typography.sizes.medium, color: Colors.text },
  rowSub: { fontSize: typography.sizes.small, color: Colors.textMuted, marginTop: 2 },
  rowRight: { fontFamily: fontFamilies.body.semibold, fontSize: typography.sizes.medium, color: Colors.text },
  empty: { fontSize: typography.sizes.medium, color: Colors.textMuted, paddingVertical: 8 },
  more: { fontSize: typography.sizes.small, color: Colors.textMuted, paddingTop: 8 },
  download: { marginTop: 16 },
});
