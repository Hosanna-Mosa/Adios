import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { moderateScale } from "react-native-size-matters";
import { fadeInDown } from "@/motion/presets";
import type { ThemeTokens } from "@/constants/colors";
import type { OrdersStyles } from "../orders.styles";

// The "My Orders" title row with a search button that opens a search field below it.

interface Props {
  insets: { top: number };
  searchOpen: boolean;
  query: string;
  onToggleSearch: () => void;
  onChangeQuery: (value: string) => void;
  styles: OrdersStyles;
  tokens: ThemeTokens;
}

export function OrdersHeader({ insets, searchOpen, query, onToggleSearch, onChangeQuery, styles, tokens }: Props) {
  const { t } = useTranslation();
  return (
    <>
      <Animated.View style={[styles.header, { paddingTop: insets.top + 14 }]} entering={fadeInDown(0)}>
        <Text style={styles.headline}>{t("app.profile.menuItems.myOrders")}</Text>
        <TouchableOpacity
          onPress={onToggleSearch}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel={t("app.orders.search", "Search orders")}
        >
          <Ionicons name={searchOpen ? "close" : "search"} size={moderateScale(22)} color={tokens.brand} />
        </TouchableOpacity>
      </Animated.View>
      {searchOpen && (
        <View style={styles.searchBar}>
          <Ionicons name="search" size={moderateScale(16)} color={tokens.muted} />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={onChangeQuery}
            placeholder={t("app.orders.searchPlaceholder", "Search restaurant, item or address")}
            placeholderTextColor={tokens.muted}
            autoFocus
            autoCorrect={false}
            autoCapitalize="none"
            accessibilityLabel={t("app.orders.search", "Search orders")}
            returnKeyType="search"
            selectionColor={tokens.brand}
          />
        </View>
      )}
    </>
  );
}
