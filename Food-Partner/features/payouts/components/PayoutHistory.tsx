import { View } from "react-native";
import { useTranslation } from "react-i18next";
import Animated from "react-native-reanimated";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { fadeInUp, staggerListItem } from "@/motion/presets";
import type { Payout } from "@/types/models";
import type { PayoutsStyles } from "../payouts.styles";
import { PayoutRow } from "./PayoutRow";

/** Every payout requested, newest first. */
export function PayoutHistory({ payouts, styles }: { payouts: Payout[]; styles: PayoutsStyles }) {
  const { t } = useTranslation();
  return (
    <Animated.View entering={fadeInUp(160)} style={styles.section}>
      <SectionHeader title={t("payouts.history")} />
      {payouts.length === 0 ? (
        <Card bordered elevationLevel="none" padding={0}>
          <EmptyState compact icon="receipt-outline" title={t("payouts.emptyTitle")} subtitle={t("payouts.emptySubtitle")} />
        </Card>
      ) : (
        <View style={styles.list}>
          {payouts.map((payout, index) => (
            <Animated.View key={payout._id} entering={staggerListItem(index)}>
              <PayoutRow payout={payout} styles={styles} />
            </Animated.View>
          ))}
        </View>
      )}
    </Animated.View>
  );
}
