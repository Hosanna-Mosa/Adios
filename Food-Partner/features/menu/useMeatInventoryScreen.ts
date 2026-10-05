import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePartnerTabBarHeight } from "@/components/PartnerTabBar";
import { useToast } from "@/components/ui/Toast";
import { useTokens } from "@/contexts/themeStore";
import { isInStock, useMeatInventory, useSetMeatPrice, useToggleMeatAvailability } from "@/queries/menu.queries";
import type { MeatItem } from "@/types/models";
import { errorMessage } from "@/utils/errorMessage";
import { createStyles } from "./meat.styles";

export const ALL_MEAT = "__all__";

/**
 * The meat centre's inventory — the web panel's VendorMeatMenu: the items
 * themselves are managed by the admin; the centre controls stock and its own
 * selling price.
 */
export function useMeatInventoryScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const tabBarHeight = usePartnerTabBarHeight();
  const tokens = useTokens();
  const styles = useMemo(() => createStyles(tokens), [tokens]);
  const toast = useToast();
  const query = useMeatInventory();
  const toggle = useToggleMeatAvailability();
  const setPrice = useSetMeatPrice();
  const [category, setCategory] = useState(ALL_MEAT);
  const [editing, setEditing] = useState<MeatItem | null>(null);
  const [priceInput, setPriceInput] = useState("");
  const [priceError, setPriceError] = useState<string | undefined>();
  const [refreshing, setRefreshing] = useState(false);

  const items = useMemo(() => query.data ?? [], [query.data]);
  const categories = useMemo(() => Array.from(new Set(items.map((i) => i.category).filter(Boolean))), [items]);
  const visible = category === ALL_MEAT ? items : items.filter((i) => i.category === category);

  const toggleAvailability = (item: MeatItem, isAvailable: boolean) =>
    toggle.mutate(
      { id: item._id, isAvailable },
      {
        onSuccess: () => toast.show(t("meat.availabilityUpdated"), "success"),
        onError: (error) => toast.show(errorMessage(error, t("menu.availabilityFailed")), "error"),
      },
    );

  const startEditing = (item: MeatItem) => {
    setEditing(item);
    setPriceInput(String(item.price ?? ""));
    setPriceError(undefined);
  };

  const savePrice = () => {
    if (!editing) return;
    const price = parseFloat(priceInput);
    if (!Number.isFinite(price) || price <= 0) {
      setPriceError(t("meat.enterValidPrice"));
      return;
    }
    setPrice.mutate(
      { id: editing._id, price },
      {
        onSuccess: () => {
          toast.show(t("meat.priceUpdated"), "success");
          setEditing(null);
        },
        onError: (error) => setPriceError(errorMessage(error, t("meat.priceFailed"))),
      },
    );
  };

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
    items,
    visible,
    categories,
    category,
    setCategory,
    inStockCount: items.filter(isInStock).length,
    loading: query.isLoading,
    error: query.isError && items.length === 0,
    togglingId: toggle.isPending ? toggle.variables?.id : undefined,
    toggleAvailability,
    editing,
    startEditing,
    cancelEditing: () => setEditing(null),
    priceInput,
    setPriceInput: (value: string) => {
      setPriceInput(value.replace(/[^0-9.]/g, ""));
      setPriceError(undefined);
    },
    priceError,
    savingPrice: setPrice.isPending,
    savePrice,
    refreshing,
    refresh,
  };
}
