import { Text } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";
import { TouchableOpacity } from "@/components/ui/TrackedTouchable";
import { type ThemeTokens } from "@/constants/colors";
import { type OrdersStyles } from "../orders.styles";

interface Props {
  serviceFilters: any;
  setServiceFilters: any;
  styles: OrdersStyles;
  tokens: ThemeTokens;
}

export function OrdersAllChip({ serviceFilters, setServiceFilters, styles, tokens }: Props) {
  const { t } = useTranslation();
  const isActive = serviceFilters.size === 0;
  return (
    <TouchableOpacity
      style={[styles.chip, isActive && styles.chipActive]}
      onPress={() => setServiceFilters(new Set())}
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
    >
      <Ionicons name="cube-outline" size={moderateScale(20)} color={isActive ? tokens.onBrand : tokens.brand} />
      <Text style={[styles.chipText, isActive && styles.chipTextActive]} numberOfLines={1}>{t("app.orders.all")}</Text>
    </TouchableOpacity>
  );
}
