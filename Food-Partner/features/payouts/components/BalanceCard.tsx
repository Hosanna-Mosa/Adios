import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import Animated from "react-native-reanimated";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { fadeInDown, fadeInUp } from "@/motion/presets";
import { formatCurrency } from "@/utils/format";
import type { PayoutsStyles } from "../payouts.styles";

interface Props {
  available: number;
  earned: number;
  paidOut: number;
  inTransit: number;
  commissionRate: number;
  /** Why a payout can't be requested right now, or null. */
  blocker: string | null;
  onRequest: () => void;
  styles: PayoutsStyles;
}

/** What the outlet can withdraw now, how that was worked out, and the button to withdraw it. */
export function BalanceCard({ available, earned, paidOut, inTransit, commissionRate, blocker, onRequest, styles }: Props) {
  const { t } = useTranslation();
  return (
    <>
      <Animated.View entering={fadeInDown(0)}>
        <Card bordered elevationLevel="none" style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>{t("payouts.available")}</Text>
          <Text style={styles.balanceValue} accessibilityRole="header">
            {formatCurrency(available)}
          </Text>
          {inTransit > 0 ? (
            <View style={styles.transit}>
              <Badge tone="info" icon="time-outline" label={t("payouts.inTransit", { amount: formatCurrency(inTransit) })} />
            </View>
          ) : null}
          <Button title={t("payouts.request")} onPress={onRequest} disabled={!!blocker} fullWidth style={styles.requestButton} />
          {blocker ? <Text style={styles.blocker}>{blocker}</Text> : null}
        </Card>
      </Animated.View>
      <Animated.View entering={fadeInUp(60)} style={styles.statsRow}>
        <StatCard
          icon="trending-up"
          tone="success"
          label={t("payouts.earned")}
          value={formatCurrency(earned)}
          hint={t("payouts.earnedHint", { rate: commissionRate })}
          style={styles.flex}
        />
        <StatCard icon="wallet-outline" tone="info" label={t("payouts.paidOut")} value={formatCurrency(paidOut)} style={styles.flex} />
      </Animated.View>
    </>
  );
}
