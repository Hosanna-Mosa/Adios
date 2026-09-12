import { Text, View } from "react-native";
import { type ServiceTokens } from "@/constants/colors";
import { type TrackingStyles } from "@/features/ride/tracking.styles";

// Moved out of app/tracking.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  accent: ServiceTokens;
  helperStatus: any;
  styles: TrackingStyles;
}

export function TrackingHelperUpdate({
  accent,
  helperStatus,
  styles,
}: Props) {
  return (
    <View style={[styles.helperUpdate, { backgroundColor: accent.skin }]}>
      <Text style={[styles.helperUpdateLabel, { color: accent.accent }]}>Helper update</Text>
      <Text style={styles.helperUpdateText}>{helperStatus}</Text>
    </View>
  );
}
