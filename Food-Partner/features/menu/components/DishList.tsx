import { useTranslation } from "react-i18next";
import { EmptyState } from "@/components/ui/EmptyState";
import { FullScreenLoader } from "@/components/ui/FullScreenLoader";
import { RefreshList } from "@/components/ui/RefreshList";
import type { ThemeTokens } from "@/constants/colors";
import type { FoodItem } from "@/types/models";
import type { MenuStyles } from "../menu.styles";
import { DishCard } from "./DishCard";

interface Props {
  dishes: FoodItem[];
  menuSize: number;
  loading: boolean;
  error: boolean;
  togglingId?: string;
  toggleAvailability: (item: FoodItem, isAvailable: boolean) => void;
  editDish: (item: FoodItem) => void;
  confirmDelete: (item: FoodItem) => void;
  addDish: () => void;
  refreshing: boolean;
  refresh: () => void;
  bottomInset: number;
  styles: MenuStyles;
  tokens: ThemeTokens;
}

/** The filtered dishes, or the right empty state: load failed, empty menu, or no search match. */
export function DishList(p: Props) {
  const { t } = useTranslation();
  if (p.loading) return <FullScreenLoader color={p.tokens.brand} style={{ flex: 1 }} />;
  const empty = p.error ? (
    <EmptyState icon="cloud-offline-outline" title={t("errors.loadFailed")} subtitle={t("errors.checkConnection")} actionLabel={t("actions.tryAgain")} onAction={p.refresh} />
  ) : p.menuSize === 0 ? (
    <EmptyState icon="restaurant-outline" title={t("menu.emptyTitle")} subtitle={t("menu.emptySubtitle")} actionLabel={t("menu.addFirstDish")} onAction={p.addDish} />
  ) : (
    <EmptyState icon="search-outline" title={t("menu.noMatchesTitle")} subtitle={t("menu.noMatchesSubtitle")} />
  );

  return (
    <RefreshList
      data={p.dishes}
      keyExtractor={(item) => item._id}
      refreshing={p.refreshing}
      onRefresh={p.refresh}
      bottomInset={p.bottomInset}
      renderItem={(item) => (
        <DishCard
          item={item}
          toggling={p.togglingId === item._id}
          onToggle={(value) => p.toggleAvailability(item, value)}
          onEdit={() => p.editDish(item)}
          onDelete={() => p.confirmDelete(item)}
          styles={p.styles}
          tokens={p.tokens}
        />
      )}
      ListEmptyComponent={empty}
    />
  );
}
