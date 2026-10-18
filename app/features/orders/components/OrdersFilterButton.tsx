import { TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";
import { type ThemeTokens } from "@/constants/colors";
import { type OrdersStyles } from "@/features/orders/orders.styles";

// Moved out of app/(tabs)/orders.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  hasActiveFilters?: boolean;
  openFilterSheet: () => void;
  styles: OrdersStyles;
  tokens: ThemeTokens;
}

export function OrdersFilterButton({
  hasActiveFilters,
  openFilterSheet,
  styles,
  tokens,
}: Props) {
  const { t } = useTranslation();
  return (
    <TouchableOpacity
      style={styles.filterBtn}
      onPress={openFilterSheet}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      accessibilityRole="button"
      accessibilityLabel={hasActiveFilters ? t("app.orders.filtersActiveAccessibilityLabel") : t("app.orders.filtersAccessibilityLabel")}
    >
      <Ionicons name="options-outline" size={moderateScale(17)} color={tokens.text} />
      {hasActiveFilters && <View style={[styles.filterActiveDot, { backgroundColor: tokens.brand }]} />}
    </TouchableOpacity>
  );
}
