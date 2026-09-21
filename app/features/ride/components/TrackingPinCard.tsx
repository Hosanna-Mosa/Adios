import { Text, View } from "react-native";

// The PIN block on the tracking sheet. Replaces TrackingPinCard{,2,3}, which
// were the same card with a different label, a different OTP source, and — for
// the end-of-ride variant — no hint line at all. `hint` stays optional so that
// variant renders exactly as before, with nothing below the digits.

interface Props {
  accent: { skin: string; accent: string };
  otp: string | number;
  label: string;
  hint?: string;
  styles: {
    pinCard: object;
    pinLabel: object;
    pinBoxes: object;
    pinBox: object;
    pinDigit: object;
    pinHint: object;
  };
}

export function TrackingPinCard({ accent, otp, label, hint, styles }: Props) {
  return (
    <View style={[styles.pinCard, { backgroundColor: accent.skin, borderColor: accent.accent }]}>
      <Text style={[styles.pinLabel, { color: accent.accent }]}>{label}</Text>
      <View style={styles.pinBoxes}>
        {String(otp).split("").map((digit, i) => (
          <View key={i} style={[styles.pinBox, { borderColor: accent.accent }]}>
            <Text style={styles.pinDigit}>{digit}</Text>
          </View>
        ))}
      </View>
      {hint ? <Text style={styles.pinHint}>{hint}</Text> : null}
    </View>
  );
}
