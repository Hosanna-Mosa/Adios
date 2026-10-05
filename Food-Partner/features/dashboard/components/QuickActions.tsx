import { View } from "react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import Animated from "react-native-reanimated";
import { ActionTile } from "@/components/ui/ActionTile";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { ThemeTokens } from "@/constants/colors";
import { fadeInUp } from "@/motion/presets";
import type { DashboardStyles } from "../dashboard.styles";

interface Props {
  pendingScheduled: number;
  isMeat: boolean;
  styles: DashboardStyles;
  tokens: ThemeTokens;
}

/** Shortcuts to the screens a partner opens most after the order list. */
export function QuickActions({ pendingScheduled, isMeat, styles, tokens }: Props) {
  const { t } = useTranslation();
  return (
    <Animated.View entering={fadeInUp(120)} style={styles.section}>
      <SectionHeader title={t("dashboard.quickActions")} />
      <View style={styles.row}>
        <ActionTile
          icon="calendar"
          label={t("dashboard.scheduledOrders")}
          color={tokens.info}
          background={tokens.infoSkin}
          badge={pendingScheduled}
          onPress={() => router.push("/scheduled-orders")}
        />
        <ActionTile
          icon={isMeat ? "file-tray-stacked" : "restaurant"}
          label={isMeat ? t("dashboard.manageInventory") : t("dashboard.manageMenu")}
          onPress={() => router.navigate(isMeat ? "/(tabs)/inventory" : "/(tabs)/menu")}
        />
        <ActionTile
          icon="wallet"
          label={t("dashboard.payouts")}
          color={tokens.warning}
          background={tokens.warningSkin}
          onPress={() => router.push("/payouts")}
        />
        <ActionTile
          icon="chatbubbles"
          label={t("dashboard.getHelp")}
          color={tokens.success}
          background={tokens.successSkin}
          onPress={() => router.push("/support")}
        />
      </View>
    </Animated.View>
  );
}
