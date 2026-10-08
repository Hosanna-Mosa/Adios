import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { ChipRow } from "@/components/ui/ChipRow";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { ScreenTitle } from "@/components/ui/ScreenTitle";
import { TextField } from "@/components/ui/TextField";
import { DishList } from "@/features/menu/components/DishList";
import { MenuTitleActions } from "@/features/menu/components/MenuTitleActions";
import { ALL, SOLD_OUT, useFoodMenuScreen } from "@/features/menu/useFoodMenuScreen";

/** Restaurant Menu tab — the web panel's /vendor/menu: search, filter, stock, edit, delete, add. */
export default function MenuScreen() {
  const { t } = useTranslation();
  const m = useFoodMenuScreen();
  const hasMenu = m.menu.length > 0;

  return (
    <ScreenShell style={{ paddingTop: m.insets.top + 12 }}>
      <ScreenTitle
        title={t("menu.title")}
        subtitle={t("menu.summary", { total: m.menu.length, inStock: m.inStockCount })}
        right={<MenuTitleActions onAddDish={m.addDish} onBulkUpload={m.bulkUpload} styles={m.styles} tokens={m.tokens} />}
      />
      {hasMenu ? (
        <TextField
          placeholder={t("menu.searchPlaceholder")}
          value={m.search}
          onChangeText={m.setSearch}
          returnKeyType="search"
          containerStyle={m.styles.search}
          icon={<Ionicons name="search" size={18} color={m.tokens.muted} />}
        />
      ) : null}
      {hasMenu ? (
        <ChipRow
          value={m.category}
          onChange={m.setCategory}
          options={[
            { key: ALL, label: t("menu.all") },
            ...(m.soldOutCount ? [{ key: SOLD_OUT, label: t("menu.soldOutCount", { count: m.soldOutCount }) }] : []),
            ...m.categories.map((c) => ({ key: c, label: c })),
          ]}
        />
      ) : null}
      <DishList
        dishes={m.visible}
        menuSize={m.menu.length}
        loading={m.loading}
        error={m.error}
        togglingId={m.togglingId}
        toggleAvailability={m.toggleAvailability}
        editDish={m.editDish}
        confirmDelete={m.confirmDelete}
        addDish={m.addDish}
        refreshing={m.refreshing}
        refresh={m.refresh}
        bottomInset={m.tabBarHeight}
        styles={m.styles}
        tokens={m.tokens}
      />
    </ScreenShell>
  );
}
