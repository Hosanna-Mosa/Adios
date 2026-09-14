import { Text, View } from "react-native";

// Moved out of app/tracking.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  accent: any;
  deliveryOtp: any;
  isHelper?: boolean;
  styles: any;
}

export function TrackingPinCard3({
  accent,
  deliveryOtp,
  isHelper = false,
  styles,
}: Props) {
  return (
    <View style={[styles.pinCard, { backgroundColor: accent.skin, borderColor: accent.accent }]}>
      <Text style={[styles.pinLabel, { color: accent.accent }]}>{isHelper ? "Completion PIN" : "Delivery PIN"}</Text>
      <View style={styles.pinBoxes}>
        {String(deliveryOtp).split("").map((digit, i) => (
          <View key={i} style={[styles.pinBox, { borderColor: accent.accent }]}>
            <Text style={styles.pinDigit}>{digit}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.pinHint}>
        {isHelper
          ? "Give this to your helper only once the work is finished."
          : "Only give this code when your items are safely received."}
      </Text>
    </View>
  );
}
