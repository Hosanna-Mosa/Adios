import { Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";
import { router } from "expo-router";
import { type ThemeTokens } from "@/constants/colors";

// Moved out of app/(tabs)/index.tsx. The JSX is unchanged; what it used to read from
// the screen's scope is now passed in as props.

interface Props {
  styles: any;
  insets: { top: number };
  tokens: ThemeTokens;
  areaLabel: string;
  areaLine: string;
  setIsDistanceSheetOpen: (v: boolean) => void;
}

export function HomeTopBar({
  styles,
  insets,
  tokens,
  areaLabel,
  areaLine,
  setIsDistanceSheetOpen,
}: Props) {
  const { t } = useTranslation();
  return (
    <View style={[styles.topRow, { paddingTop: insets.top + 6 }]}>
      <TouchableOpacity style={styles.addressBlock} activeOpacity={0.7} onPress={() => router.push("/delivery/saved-addresses")}>
        <Text style={styles.addressEyebrow}>{t("app.home.deliveryTo")}</Text>
        <View style={styles.addressLabelRow}>
          <Text style={styles.addressLabel} numberOfLines={1}>{areaLabel}</Text>
          <Ionicons name="chevron-down" size={moderateScale(12)} color={tokens.sec} />
        </View>
        <Text style={styles.addressLine} numberOfLines={1}>{areaLine}</Text>
      </TouchableOpacity>
      <View style={styles.topRowActions}>
        <TouchableOpacity style={styles.iconBtnCircle} onPress={() => setIsDistanceSheetOpen(true)}>
          <MaterialCommunityIcons name="radius-outline" size={moderateScale(18)} color={tokens.sec} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.avatarBtn} onPress={() => router.push("/(tabs)/profile")}>
          <Ionicons name="person-outline" size={moderateScale(18)} color={tokens.sec} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
