import { useTranslation } from "react-i18next";
import { ChipRow } from "@/components/ui/ChipRow";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { ScreenTitle } from "@/components/ui/ScreenTitle";
import { MeatList } from "@/features/menu/components/MeatList";
import { MeatPriceSheet } from "@/features/menu/components/MeatPriceSheet";
import { ALL_MEAT, useMeatInventoryScreen } from "@/features/menu/useMeatInventoryScreen";

/** Meat centre Inventory tab — the web panel's /vendor/meat-menu: stock on/off and selling prices. */
export default function InventoryScreen() {
  const { t } = useTranslation();
  const m = useMeatInventoryScreen();

  return (
    <ScreenShell style={{ paddingTop: m.insets.top + 12 }}>
      <ScreenTitle title={t("meat.title")} subtitle={t("meat.summary", { total: m.items.length, inStock: m.inStockCount })} />
      {m.categories.length > 1 ? (
        <ChipRow
          topGap={0}
          value={m.category}
          onChange={m.setCategory}
          accent={m.tokens.services.meat}
          options={[{ key: ALL_MEAT, label: t("menu.all") }, ...m.categories.map((c) => ({ key: c, label: c }))]}
        />
      ) : null}
      <MeatList
        items={m.visible}
        hasItems={m.items.length > 0}
        loading={m.loading}
        error={m.error}
        togglingId={m.togglingId}
        toggleAvailability={m.toggleAvailability}
        startEditing={m.startEditing}
        refreshing={m.refreshing}
        refresh={m.refresh}
        bottomInset={m.tabBarHeight}
        styles={m.styles}
        tokens={m.tokens}
      />
      <MeatPriceSheet
        item={m.editing}
        value={m.priceInput}
        onChange={m.setPriceInput}
        error={m.priceError}
        saving={m.savingPrice}
        onSave={m.savePrice}
        onClose={m.cancelEditing}
        styles={m.styles}
      />
    </ScreenShell>
  );
}
