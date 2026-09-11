import { Text, View } from "react-native";

// Moved out of app/tracking.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  accent: any;
  startOtp: any;
  styles: any;
}

export function TrackingPinCard({
  accent,
  startOtp,
  styles,
}: Props) {
  return (
    <View style={[styles.pinCard, { backgroundColor: accent.skin, borderColor: accent.accent }]}>
      <Text style={[styles.pinLabel, { color: accent.accent }]}>Start ride PIN</Text>
      <View style={styles.pinBoxes}>
        {String(startOtp).split("").map((digit, i) => (
          <View key={i} style={[styles.pinBox, { borderColor: accent.accent }]}>
            <Text style={styles.pinDigit}>{digit}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.pinHint}>Give this to your captain to start the trip.</Text>
    </View>
  );
}
