import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePartnerTabBarHeight } from "@/components/PartnerTabBar";
import { router } from "expo-router";
import { showAlert } from "@/components/ui/AppAlert";
import { useToast } from "@/components/ui/Toast";
import { useTokens } from "@/contexts/themeStore";
import { isInStock, useDeleteFoodItem, useFoodMenu, useToggleFoodAvailability } from "@/queries/menu.queries";
import type { FoodItem } from "@/types/models";
import { errorMessage } from "@/utils/errorMessage";
import { createStyles } from "./menu.styles";

export const ALL = "__all__";
export const SOLD_OUT = "__sold_out__";

/** The restaurant menu tab — the web panel's VendorMenu page, plus search and category filters. */
export function useFoodMenuScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const tabBarHeight = usePartnerTabBarHeight();
  const tokens = useTokens();
  const styles = useMemo(() => createStyles(tokens), [tokens]);
  const toast = useToast();
  const query = useFoodMenu();
  const toggle = useToggleFoodAvailability();
  const remove = useDeleteFoodItem();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>(ALL);
  const [refreshing, setRefreshing] = useState(false);

  const menu = useMemo(() => query.data ?? [], [query.data]);
  const categories = useMemo(
    () => Array.from(new Set(menu.map((item) => item.category?.trim()).filter(Boolean))) as string[],
    [menu],
  );
  const soldOutCount = menu.filter((item) => !isInStock(item)).length;

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return menu.filter((item) => {
      if (category === SOLD_OUT && isInStock(item)) return false;
      if (category !== ALL && category !== SOLD_OUT && item.category?.trim() !== category) return false;
      if (!term) return true;
      return item.name.toLowerCase().includes(term) || item.description?.toLowerCase().includes(term);
    });
  }, [menu, search, category]);

  const toggleAvailability = (item: FoodItem, isAvailable: boolean) =>
    toggle.mutate(
      { id: item._id, isAvailable },
      {
        onSuccess: () => toast.show(isAvailable ? t("menu.backInStock", { name: item.name }) : t("menu.markedSoldOut", { name: item.name }), "success"),
        onError: (error) => toast.show(errorMessage(error, t("menu.availabilityFailed")), "error"),
      },
    );

  const confirmDelete = (item: FoodItem) =>
    showAlert(
      t("menu.deleteTitle"),
      t("menu.deleteMessage", { name: item.name }),
      [
        { text: t("actions.cancel"), style: "cancel" },
        {
          text: t("actions.delete"),
          style: "destructive",
          onPress: () =>
            remove.mutate(item._id, {
              onSuccess: () => toast.show(t("menu.deleted"), "success"),
              onError: (error) => toast.show(errorMessage(error, t("menu.deleteFailed")), "error"),
            }),
        },
      ],
      "warning",
    );

  const refresh = async () => {
    setRefreshing(true);
    await query.refetch().catch(() => {});
    setRefreshing(false);
  };

  return {
    insets,
    tabBarHeight,
    tokens,
    styles,
    menu,
    visible,
    categories,
    soldOutCount,
    inStockCount: menu.length - soldOutCount,
    search,
    setSearch,
    category,
    setCategory,
    loading: query.isLoading,
    error: query.isError && menu.length === 0,
    togglingId: toggle.isPending ? toggle.variables?.id : undefined,
    toggleAvailability,
    confirmDelete,
    addDish: () => router.push("/dish-form"),
    bulkUpload: () => router.push("/menu-bulk-upload"),
    editDish: (item: FoodItem) => router.push({ pathname: "/dish-form", params: { id: item._id } }),
    refreshing,
    refresh,
  };
}
