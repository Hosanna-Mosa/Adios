import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Header } from "@/components/ui/Header";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { PayoutsBody } from "@/features/payouts/components/PayoutsBody";
import { RequestPayoutSheet } from "@/features/payouts/components/RequestPayoutSheet";
import { usePayouts } from "@/features/payouts/usePayouts";

/** Earnings available to withdraw, the bank account they go to, and every payout so far. */
export default function PayoutsScreen() {
  const { t } = useTranslation();
  const p = usePayouts();

  return (
    <ScreenShell
      style={{ paddingTop: p.insets.top + 8 }}
      header={<Header title={t("payouts.title")} subtitle={t("payouts.subtitle")} onBack={() => router.back()} />}
      scroll
      refreshing={p.refreshing}
      onRefresh={p.refresh}
      contentStyle={[p.styles.content, { paddingBottom: p.insets.bottom + 32 }]}
    >
      <PayoutsBody
        summary={p.summary}
        loading={p.loading}
        error={p.error}
        retry={p.retry}
        inTransit={p.inTransit}
        blocker={p.blocker}
        openRequest={p.openRequest}
        styles={p.styles}
        tokens={p.tokens}
      />
      <RequestPayoutSheet
        visible={p.sheet.visible}
        available={p.available}
        value={p.sheet.value}
        onChange={p.sheet.changeAmount}
        error={p.sheet.error}
        parsedAmount={p.sheet.parsedAmount}
        sending={p.sheet.sending}
        onWithdrawAll={p.sheet.withdrawAll}
        onSubmit={p.sheet.submit}
        onClose={p.sheet.close}
        styles={p.styles}
      />
    </ScreenShell>
  );
}
