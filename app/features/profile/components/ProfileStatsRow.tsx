import { Text, View } from "react-native";
import Animated from "react-native-reanimated";
import { fadeInUp } from "@/motion/presets";

// Moved out of app/(tabs)/profile.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  memberSinceYear: any;
  styles: any;
}

export function ProfileStatsRow({
  memberSinceYear,
  styles,
}: Props) {
  return (
    <Animated.View style={styles.statsRow} entering={fadeInUp(70)}>
      <View style={styles.statTile}>
        <Text style={styles.statValue}>{memberSinceYear || "—"}</Text>
        <Text style={styles.statLabel}>member since</Text>
      </View>
    </Animated.View>
  );
}
