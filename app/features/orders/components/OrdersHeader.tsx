import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import Animated from "react-native-reanimated";
import { fadeInDown } from "@/motion/presets";
import { OrdersFilterButton } from "@/features/orders/components/OrdersFilterButton";
import type { ThemeTokens } from "@/constants/colors";
import type { OrdersStyles } from "@/features/orders/orders.styles";

// The "My orders" title row and its filter button. Moved out of the screen
// unchanged — same animation, same padding, same styles.

interface Props {
  insets: { top: number };
  /** e.g. "2 active · 14 past"; hidden while loading or when there are no orders. */
  summary?: string;
  openFilterSheet: () => void;
  styles: OrdersStyles;
  tokens: ThemeTokens;
}

export function OrdersHeader({ insets, summary, openFilterSheet, styles, tokens }: Props) {
  const { t } = useTranslation();
  return (
    <Animated.View style={[styles.header, { paddingTop: insets.top + 14 }]} entering={fadeInDown(0)}>
      <View>
        <Text style={styles.headline}>{t("app.profile.menuItems.myOrders")}</Text>
        {!!summary && <Text style={styles.headerSub}>{summary}</Text>}
      </View>
      <OrdersFilterButton openFilterSheet={openFilterSheet} styles={styles} tokens={tokens} />
    </Animated.View>
  );
}
