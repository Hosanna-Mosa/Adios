import { Text, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { type OrdersStyles } from "@/features/orders/orders.styles";

// Moved out of app/(tabs)/orders.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  serviceFilters: any;
  setServiceFilters: any;
  styles: OrdersStyles;
}

export function OrdersAllChip({
  serviceFilters,
  setServiceFilters,
  styles,
}: Props) {
  const { t } = useTranslation();
  return (
    <TouchableOpacity
      style={[styles.chip, serviceFilters.size === 0 && styles.chipActive]}
      onPress={() => setServiceFilters(new Set())}
      accessibilityRole="button"
      accessibilityState={{ selected: serviceFilters.size === 0 }}
    >
      <Text style={[styles.chipText, serviceFilters.size === 0 && styles.chipTextActive]}>{t("app.orders.all")}</Text>
    </TouchableOpacity>
  );
}
