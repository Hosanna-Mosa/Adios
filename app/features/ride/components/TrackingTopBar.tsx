import { Platform, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { TouchableOpacity } from "@/components/ui/TrackedTouchable";
import { RefreshButton } from "@/components/ui/RefreshButton";
import { Ionicons } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";
import { goHomeFromTracking } from "../useTrackingHandleBack";
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
  onRefresh: () => void;
  refreshing: boolean;
}

export function TrackingTopBar({
  bannerText,
  accent,
  eta,
  insets,
  status,
  styles,
  tokens,
  onRefresh,
  refreshing,
}: Props) {
  const { t } = useTranslation();
  return (
    <View style={[styles.topBar, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) + 12 }]} pointerEvents="box-none">
      <TouchableOpacity style={styles.backBtn} onPress={goHomeFromTracking}>
        <Ionicons name="chevron-back" size={moderateScale(20)} color={tokens.text} />
      </TouchableOpacity>
      <View style={[styles.etaChip, { backgroundColor: accent.accent }]}>
        <Text style={[styles.etaChipText, { color: accent.on }]}>{status === "arrived_pickup" || status === "arrived_delivery" ? bannerText : `${bannerText} · ${eta} min`}</Text>
      </View>
      <RefreshButton onPress={onRefresh} refreshing={refreshing} accessibilityLabel={t("actions.refresh")} />
    </View>
  );
}
