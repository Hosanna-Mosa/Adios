import { Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { fadeInUp } from "@/motion/presets";
import { router } from "expo-router";
import { moderateScale } from "react-native-size-matters";
import { type ServiceTokens } from "@/constants/colors";
import { type EdgeInsets } from "react-native-safe-area-context";
import { type Store149Styles } from "@/features/food/149-store.styles";

// Moved out of app/149-store.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  accent: ServiceTokens;
  areaLabel: string;
  areaLine: any;
  farthestKm: any;
  insets: EdgeInsets;
  outletCount: number;
  store149Items: any;
  styles: Store149Styles;
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
  return (
    <Animated.View entering={fadeInUp(0)} style={[styles.heroHeader, { paddingTop: insets.top + 4 }]}>
      <TouchableOpacity style={styles.backBtn} onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)"))}>
        <Ionicons name="chevron-back" size={moderateScale(20)} color={accent.on} />
      </TouchableOpacity>
      <Text style={styles.heroEyebrow}>Craving? Any dish</Text>
      <Text style={styles.heroHeadline}>Everything{"\n"}at ₹149</Text>
      <TouchableOpacity style={styles.heroLocationRow} activeOpacity={0.8} onPress={() => router.push("/delivery/saved-addresses")}>
        <Ionicons name="location-sharp" size={moderateScale(13)} color={accent.on} />
        <Text style={styles.heroLocationText} numberOfLines={1}>Near {areaLabel} · {areaLine}</Text>
        <Ionicons name="chevron-forward" size={moderateScale(13)} color={accent.on} />
      </TouchableOpacity>
      <Text style={styles.heroSubtext}>
        {store149Items.length} dishes{outletCount > 0 ? ` · ${outletCount} outlets` : ""}{farthestKm ? ` within ${farthestKm} km` : ""}
      </Text>
    </Animated.View>
  );
}
