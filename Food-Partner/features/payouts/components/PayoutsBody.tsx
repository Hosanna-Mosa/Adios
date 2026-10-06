import { View } from "react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { InfoNote } from "@/components/ui/InfoNote";
import { Skeleton } from "@/components/ui/Skeleton";
import type { ThemeTokens } from "@/constants/colors";
import type { PayoutSummary } from "@/types/models";
import type { PayoutsStyles } from "../payouts.styles";
import { BalanceCard } from "./BalanceCard";
import { BankAccountCard } from "./BankAccountCard";
import { PayoutHistory } from "./PayoutHistory";

interface Props {
  summary: PayoutSummary | undefined;
  loading: boolean;
  error: boolean;
  retry: () => void;
  inTransit: number;
  blocker: string | null;
  openRequest: () => void;
  styles: PayoutsStyles;
  tokens: ThemeTokens;
}

/** The Payouts screen below its header: loading, failed, not available for this account, or the real thing. */
export function PayoutsBody({ summary, loading, error, retry, inTransit, blocker, openRequest, styles, tokens }: Props) {
  const { t } = useTranslation();

  if (loading) {
    return (
      <View style={styles.skeleton}>
        <Skeleton width="100%" height={168} radius={16} />
        <Skeleton width="100%" height={96} radius={16} />
        <Skeleton width="100%" height={72} radius={16} />
      </View>
    );
  }

  if (error || !summary) {
    return (
      <Card bordered elevationLevel="none" padding={0} style={styles.balanceCard}>
        <EmptyState icon="cloud-offline-outline" title={t("errors.loadFailed")} subtitle={t("errors.checkConnection")} actionLabel={t("actions.tryAgain")} onAction={retry} />
      </Card>
    );
  }

  if (!summary.payoutsEnabled) {
    return (
      <Card bordered elevationLevel="none" padding={0} style={styles.balanceCard}>
        <EmptyState
          icon="people-outline"
          title={t("payouts.unavailableTitle")}
          subtitle={t("payouts.unavailableHint")}
          actionLabel={t("payouts.contactSupport")}
          onAction={() => router.push("/support")}
        />
      </Card>
    );
  }

  return (
    <>
      <BalanceCard
        available={summary.balance.availableBalance}
        earned={summary.balance.earnedShare}
        paidOut={summary.balance.paidOut}
        inTransit={inTransit}
        commissionRate={summary.commissionRate}
        blocker={blocker}
        onRequest={openRequest}
        styles={styles}
      />
      <BankAccountCard account={summary.bankAccount} styles={styles} tokens={tokens} />
      <InfoNote lead={t("payouts.howItWorksTitle")} text={t("payouts.howItWorks")} style={styles.note} />
      <PayoutHistory payouts={summary.payouts} styles={styles} />
    </>
  );
}
