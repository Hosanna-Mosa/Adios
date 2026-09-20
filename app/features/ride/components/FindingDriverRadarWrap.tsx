import { View } from "react-native";
import Animated from "react-native-reanimated";
import { type FindingDriverStyles } from "@/features/ride/finding-driver.styles";

// Moved out of app/finding-driver.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  ring1Style: any;
  ring2Style: any;
  styles: FindingDriverStyles;
}

export function FindingDriverRadarWrap({
  ring1Style,
  ring2Style,
  styles,
}: Props) {
  return (
    <View style={styles.radarWrap} pointerEvents="none">
      <Animated.View style={[styles.radarRing, ring1Style]} />
      <Animated.View style={[styles.radarRing, ring2Style]} />
      <View style={styles.radarDot} />
    </View>
  );
}
