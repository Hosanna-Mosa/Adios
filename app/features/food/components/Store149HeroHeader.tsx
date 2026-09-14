import { Text, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { fadeInUp } from "@/motion/presets";
import { router } from "expo-router";
import { moderateScale } from "react-native-size-matters";

// Moved out of app/149-store.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  accent: any;
  areaLabel: any;
  areaLine: any;
  farthestKm: any;
  insets: any;
  outletCount: any;
  store149Items: any;
  styles: any;
}

export function Store149HeroHeader({
  accent,
  areaLabel,
  areaLine,
  farthestKm,
  insets,
  outletCount,
  store149Items,
  styles,
}: Props) {
  const { t } = useTranslation();
  return (
    <Animated.View entering={fadeInUp(0)} style={[styles.heroHeader, { paddingTop: insets.top + 4 }]}>
      <TouchableOpacity style={styles.backBtn} onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)"))}>
        <Ionicons name="chevron-back" size={moderateScale(20)} color={accent.on} />
      </TouchableOpacity>
      <Text style={styles.heroEyebrow}>{t("app.food.cravingAnyDish")}</Text>
      <Text style={styles.heroHeadline}>{t("app.food.everything")}{"\n"}{t("app.food.at149")}</Text>
      <TouchableOpacity style={styles.heroLocationRow} activeOpacity={0.8} onPress={() => router.push("/delivery/saved-addresses")}>
        <Ionicons name="location-sharp" size={moderateScale(13)} color={accent.on} />
        <Text style={styles.heroLocationText} numberOfLines={1}>{t("app.food.near")} {areaLabel} · {areaLine}</Text>
        <Ionicons name="chevron-forward" size={moderateScale(13)} color={accent.on} />
      </TouchableOpacity>
      <Text style={styles.heroSubtext}>
        {t("app.food.dishesCount", { count: store149Items.length })}{outletCount > 0 ? ` · ${t("app.food.outletsCount", { count: outletCount })}` : ""}{farthestKm ? ` ${t("app.food.withinKm", { km: farthestKm })}` : ""}
      </Text>
    </Animated.View>
  );
}
