import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { ListGroup } from "@/components/ui/ListGroup";
import { ListRow } from "@/components/ui/ListRow";
import type { ThemeTokens } from "@/constants/colors";

/** Shortcuts to the outlet's scheduled orders, opening hours, payouts and menu / inventory. */
export function BusinessSection({ isMeat, tokens }: { isMeat: boolean; tokens: ThemeTokens }) {
  const { t } = useTranslation();
  return (
    <ListGroup title={t("account.business")} delay={60}>
      <ListRow
        icon="calendar-outline"
        iconColor={tokens.info}
        iconBackground={tokens.infoSkin}
        label={t("account.scheduledOrders")}
        description={t("account.scheduledOrdersHint")}
        onPress={() => router.push("/scheduled-orders")}
        divider
      />
      <ListRow
        icon="time-outline"
        iconColor={tokens.warning}
        iconBackground={tokens.warningSkin}
        label={t("account.openingHours")}
        description={t("account.openingHoursHint")}
        onPress={() => router.push("/opening-hours")}
        divider
      />
      <ListRow
        icon="wallet-outline"
        iconColor={tokens.success}
        iconBackground={tokens.successSkin}
        label={t("account.payouts")}
        description={t("account.payoutsHint")}
        onPress={() => router.push("/payouts")}
        divider
      />
      <ListRow
        icon={isMeat ? "file-tray-stacked-outline" : "restaurant-outline"}
        iconColor={tokens.brand}
        iconBackground={tokens.brandSkin}
        label={isMeat ? t("account.meatInventory") : t("account.menuItems")}
        description={isMeat ? t("account.meatInventoryHint") : t("account.menuItemsHint")}
        onPress={() => router.navigate(isMeat ? "/(tabs)/inventory" : "/(tabs)/menu")}
      />
    </ListGroup>
  );
}
