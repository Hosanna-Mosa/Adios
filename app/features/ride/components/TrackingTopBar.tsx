import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { MapBackButton, mapControlTop } from "@/components/ui/MapBackButton";
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
  const { t } = useTranslation();
  return (
    <View style={[styles.topBar, { paddingTop: mapControlTop(insets) }]} pointerEvents="box-none">
      <MapBackButton onPress={goHomeFromTracking} />
      {/* Shrinks and stays on one line: long or translated banner text wrapped onto
          several lines or ran into the back button. "min" was hardcoded English. */}
      <View style={[styles.etaChip, { backgroundColor: accent.accent, flexShrink: 1, marginHorizontal: 8 }]}>
        <Text style={[styles.etaChipText, { color: accent.on }]} numberOfLines={1}>
          {status === "arrived_pickup" || status === "arrived_delivery" || eta == null ? bannerText : `${bannerText} · ${t("app.ride.etaMinutes", { min: eta })}`}
        </Text>
      </View>
      {/* Balances the 44pt back button so the chip stays centred. */}
      <View style={{ width: 44 }} />
    </View>
  );
}
