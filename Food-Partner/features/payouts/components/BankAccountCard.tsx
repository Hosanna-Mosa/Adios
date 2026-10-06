import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import Animated from "react-native-reanimated";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ListRow } from "@/components/ui/ListRow";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { ThemeTokens } from "@/constants/colors";
import { fadeInUp } from "@/motion/presets";
import type { PayoutSummary } from "@/types/models";
import type { PayoutsStyles } from "../payouts.styles";

type BankAccount = Extract<PayoutSummary, { payoutsEnabled: true }>["bankAccount"];

/**
 * Where payouts go: the account verified during onboarding, masked to its last
 * four digits. It can't be changed in the app — that goes through support.
 */
export function BankAccountCard({ account, styles, tokens }: { account: BankAccount; styles: PayoutsStyles; tokens: ThemeTokens }) {
  const { t } = useTranslation();
  return (
    <Animated.View entering={fadeInUp(100)} style={styles.section}>
      <SectionHeader title={t("payouts.paidTo")} />
      {account ? (
        <ListRow
          card
          icon="business-outline"
          iconColor={tokens.brand}
          iconBackground={tokens.brandSkin}
          label={t("payouts.accountNumber", { last4: account.accountLast4 })}
          description={[t("payouts.ifsc", { ifsc: account.ifsc }), account.accountType === "current" ? t("payouts.current") : t("payouts.savings")].join(" · ")}
          right={account.verified ? <Badge label={t("payouts.verified")} tone="success" icon="shield-checkmark" /> : null}
        />
      ) : (
        <Card bordered elevationLevel="none" padding={0}>
          <EmptyState
            compact
            icon="card-outline"
            title={t("payouts.noBankTitle")}
            subtitle={t("payouts.noBankHint")}
            actionLabel={t("payouts.contactSupport")}
            onAction={() => router.push("/support")}
          />
        </Card>
      )}
    </Animated.View>
  );
}
