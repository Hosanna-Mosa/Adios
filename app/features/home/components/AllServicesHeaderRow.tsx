import { Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { moderateScale } from "react-native-size-matters";

// Moved out of app/all-services.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  insets: any;
  styles: any;
  tokens: any;
}

export function AllServicesHeaderRow({
  insets,
  styles,
  tokens,
}: Props) {
  const { t } = useTranslation();
  return (
    <View style={[styles.headerRow, { paddingTop: insets.top + 4 }]}>
      <TouchableOpacity style={styles.backBtn} onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)"))} activeOpacity={0.7}>
        <Ionicons name="chevron-back" size={moderateScale(22)} color={tokens.text} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{t("app.home.allServices")}</Text>
    </View>
  );
}
