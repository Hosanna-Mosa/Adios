import { Platform, Text, View } from "react-native";
import { TouchableOpacity } from "@/components/ui/TrackedTouchable";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { moderateScale } from "react-native-size-matters";
import { type ThemeTokens, type ServiceTokens } from "@/constants/colors";
import { type EdgeInsets } from "react-native-safe-area-context";
import { type TrackingStyles } from "@/features/ride/tracking.styles";

// Moved out of app/tracking.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  bannerText: string;
  accent: ServiceTokens;
  eta: number;
  insets: EdgeInsets;
  status: string;
  styles: TrackingStyles;
  tokens: ThemeTokens;
}

export function TrackingTopBar({
  bannerText,
  accent,
  eta,
  insets,
  status,
  styles,
  tokens,
}: Props) {
  return (
    <View style={[styles.topBar, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) + 12 }]} pointerEvents="box-none">
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={moderateScale(20)} color={tokens.text} />
      </TouchableOpacity>
      <View style={[styles.etaChip, { backgroundColor: accent.accent }]}>
        <Text style={[styles.etaChipText, { color: accent.on }]}>{status === "arrived_pickup" || status === "arrived_delivery" ? bannerText : `${bannerText} · ${eta} min`}</Text>
      </View>
      <View style={{ width: moderateScale(40) }} />
    </View>
  );
}
