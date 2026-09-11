import { Text, View } from "react-native";

// Moved out of app/tracking.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  accent: any;
  deliveryOtp: any;
  styles: any;
}

export function TrackingPinCard2({
  accent,
  deliveryOtp,
  styles,
}: Props) {
  return (
    <View style={[styles.pinCard, { backgroundColor: accent.skin, borderColor: accent.accent }]}>
      <Text style={[styles.pinLabel, { color: accent.accent }]}>End ride PIN</Text>
      <View style={styles.pinBoxes}>
        {String(deliveryOtp).split("").map((digit, i) => (
          <View key={i} style={[styles.pinBox, { borderColor: accent.accent }]}>
            <Text style={styles.pinDigit}>{digit}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
