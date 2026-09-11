import { Text } from "react-native";
import Animated from "react-native-reanimated";
import { fadeInUp } from "@/motion/presets";

// Moved out of app/helper-task.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  calculatedFare: any;
  offer: any;
  styles: any;
  totalHours: any;
}

export function HelperTaskOfferBlock({
  calculatedFare,
  offer,
  styles,
  totalHours,
}: Props) {
  return (
    <Animated.View style={styles.offerBlock} entering={fadeInUp(0)}>
      <Text style={styles.offerEyebrow}>Current offer</Text>
      <Text style={styles.offerAmount}>₹{offer ?? calculatedFare}</Text>
      <Text style={styles.offerSub}>
        for {Math.floor(totalHours)}h {Math.round((totalHours % 1) * 60)}m · about ₹{Math.round((offer ?? calculatedFare) / totalHours)}/hour
      </Text>
    </Animated.View>
  );
}
