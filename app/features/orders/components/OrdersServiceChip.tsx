import { Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";
import { TouchableOpacity } from "@/components/ui/TrackedTouchable";
import { type ThemeTokens } from "@/constants/colors";
import { type OrdersStyles } from "../orders.styles";
import { toggleChipKeys } from "../useOrders.shared";

// The service keys arrive as `serviceKeys`, NOT `key`: React reserves `key` for
// reconciliation and never forwards it to the component.
//
// One chip can stand for several stored service types (the four ride types are a
// single "Ride" chip), so it toggles all of its keys together - see SERVICE_CHIPS.

interface Props {
  label: string;
  icon: string;
  serviceKeys: string[];
  isActive: boolean;
  setServiceFilters: (updater: (prev: Set<string>) => Set<string>) => void;
  styles: OrdersStyles;
  tokens: ThemeTokens;
}

export function OrdersServiceChip({ label, icon, serviceKeys, isActive, setServiceFilters, styles, tokens }: Props) {
  return (
    <TouchableOpacity
      style={[styles.chip, isActive && styles.chipActive]}
      onPress={() => setServiceFilters((prev) => toggleChipKeys(prev, serviceKeys))}
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
    >
      <Ionicons name={icon as any} size={moderateScale(20)} color={isActive ? tokens.onBrand : tokens.brand} />
      <Text style={[styles.chipText, isActive && styles.chipTextActive]} numberOfLines={1}>{label}</Text>
    </TouchableOpacity>
  );
}
