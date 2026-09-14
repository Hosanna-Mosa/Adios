import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Moved out of app/tracking.tsx. What it read from the screen's scope is now a prop of the
// same name. The pulsing radar rings that used to surround the center icon were removed —
// a static "searching" badge, same as every other empty/loading state in the app.

interface Props {
  accent: any;
  isHelper: any;
  isRide: any;
  styles: any;
}

export function TrackingFindingWrap({
  accent,
  isHelper,
  isRide,
  styles,
}: Props) {
  return (
    <View style={styles.findingWrap}>
      <View style={styles.radarWrap}>
        <View style={[styles.radarCenter, { backgroundColor: accent.accent }]}>
          <Ionicons name="search" size={22} color={accent.on} />
        </View>
      </View>
      <Text style={styles.findingTitle}>{isRide ? "Finding your captain…" : isHelper ? "Finding your helper…" : "Finding your delivery partner…"}</Text>
      <Text style={styles.findingSubtitle}>This usually takes under a minute.</Text>
    </View>
  );
}
