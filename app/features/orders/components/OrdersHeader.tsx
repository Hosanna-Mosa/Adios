import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import Animated from "react-native-reanimated";
import { fadeInDown } from "@/motion/presets";
import { OrdersFilterButton } from "@/features/orders/components/OrdersFilterButton";
import { RefreshButton } from "@/components/ui/RefreshButton";
import type { ThemeTokens } from "@/constants/colors";
import type { OrdersStyles } from "@/features/orders/orders.styles";

// The "My orders" title row with its refresh and filter buttons. Moved out of the screen
// unchanged — same animation, same padding, same styles.

interface Props {
  insets: { top: number };
  /** e.g. "2 active · 14 past"; hidden while loading or when there are no orders. */
  summary?: string;
  openFilterSheet: () => void;
  styles: OrdersStyles;
  tokens: ThemeTokens;
  onRefresh: () => void;
  refreshing: boolean;
}

export function OrdersHeader({ insets, summary, openFilterSheet, styles, tokens, onRefresh, refreshing }: Props) {
  const { t } = useTranslation();
  return (
    <Animated.View style={[styles.header, { paddingTop: insets.top + 14 }]} entering={fadeInDown(0)}>
      <View>
        <Text style={styles.headline}>{t("app.profile.menuItems.myOrders")}</Text>
        {!!summary && <Text style={styles.headerSub}>{summary}</Text>}
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <RefreshButton onPress={onRefresh} refreshing={refreshing} accessibilityLabel={t("actions.refresh")} />
        <OrdersFilterButton openFilterSheet={openFilterSheet} styles={styles} tokens={tokens} />
      </View>
    </Animated.View>
  );
}
