import { Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Feather, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { moderateScale } from "react-native-size-matters";
import { type ThemeTokens } from "@/constants/colors";
import { type EdgeInsets } from "react-native-safe-area-context";
import { type CartStyles } from "@/features/food/cart.styles";

// Moved out of app/cart.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  confirmClearCart: () => void;
  displayVendorName: string;
  insets: EdgeInsets;
  styles: CartStyles;
  tokens: ThemeTokens;
}

export function CartVendorHeader({
  confirmClearCart,
  displayVendorName,
  insets,
  styles,
  tokens,
}: Props) {
  const { t } = useTranslation();
  return (
    <View style={[styles.header, { paddingTop: insets.top + 6 }]}>
      <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={moderateScale(20)} color={tokens.text} />
      </TouchableOpacity>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.headerEyebrow}>{t("app.food.yourCartFrom")}</Text>
        <Text style={styles.headerTitle} numberOfLines={1}>{displayVendorName}</Text>
      </View>
      <TouchableOpacity style={styles.iconBtn} onPress={confirmClearCart}>
        <Feather name="trash-2" size={moderateScale(17)} color={tokens.sec} />
      </TouchableOpacity>
    </View>
  );
}
