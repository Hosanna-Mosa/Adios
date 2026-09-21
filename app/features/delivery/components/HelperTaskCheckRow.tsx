import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { fadeInUp } from "@/motion/presets";

// One row in the helper-task progress list. Replaces HelperTaskCheckRow{,2,3},
// which were the same row in two states: a completed step (tick, default text
// colour) and a still-waiting step (hollow marker, accent text).
//
// `delay` stays a prop because the three rows stagger in at 60/0/100ms.

interface Props {
  state: "done" | "pending";
  label: string;
  delay: number;
  accent: { on: string; accent: string };
  styles: {
    checkRow: object;
    checkDone: object;
    checkPending: object;
    checkText: object;
  };
}

export function HelperTaskCheckRow({ state, label, delay, accent, styles }: Props) {
  const isDone = state === "done";
  return (
    <Animated.View style={styles.checkRow} entering={fadeInUp(delay)}>
      {isDone ? (
        <View style={styles.checkDone}><Ionicons name="checkmark" size={13} color={accent.on} /></View>
      ) : (
        <View style={styles.checkPending} />
      )}
      <Text style={isDone ? styles.checkText : [styles.checkText, { color: accent.accent }]}>{label}</Text>
    </Animated.View>
  );
}
