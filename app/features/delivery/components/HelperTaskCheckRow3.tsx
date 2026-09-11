import { Text, View } from "react-native";
import Animated from "react-native-reanimated";
import { fadeInUp } from "@/motion/presets";

// Moved out of app/helper-task.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  accent: any;
  styles: any;
}

export function HelperTaskCheckRow3({
  accent,
  styles,
}: Props) {
  return (
    <Animated.View style={styles.checkRow} entering={fadeInUp(100)}>
      <View style={styles.checkPending} />
      <Text style={[styles.checkText, { color: accent.accent }]}>Waiting for the first acceptance</Text>
    </Animated.View>
  );
}
