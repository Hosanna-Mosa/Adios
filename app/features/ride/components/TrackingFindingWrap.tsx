import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { type ServiceTokens } from "@/constants/colors";
import { type TrackingStyles } from "@/features/ride/tracking.styles";

// Moved out of app/tracking.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  accent: ServiceTokens;
  isHelper: boolean;
  isRide: boolean;
  pulse1Style: any;
  pulse2Style: any;
  styles: TrackingStyles;
}

export function TrackingFindingWrap({
  accent,
  isHelper,
  isRide,
  pulse1Style,
  pulse2Style,
  styles,
}: Props) {
  return (
    <View style={styles.findingWrap}>
      <View style={styles.radarWrap}>
        <Animated.View style={[styles.radarRing, { borderColor: accent.accent }, pulse1Style]} />
        <Animated.View style={[styles.radarRing, { borderColor: accent.accent }, pulse2Style]} />
        <View style={[styles.radarCenter, { backgroundColor: accent.accent }]}>
          <Ionicons name="search" size={22} color={accent.on} />
        </View>
      </View>
      <Text style={styles.findingTitle}>{isRide ? "Finding your captain…" : isHelper ? "Finding your helper…" : "Finding your delivery partner…"}</Text>
      <Text style={styles.findingSubtitle}>This usually takes under a minute.</Text>
    </View>
  );
}
