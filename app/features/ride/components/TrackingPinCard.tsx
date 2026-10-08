import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// The PIN block on the tracking sheet. Replaces TrackingPinCard{,2,3}, which
// were the same card with a different label, a different OTP source, and — for
// the end-of-ride variant — no hint line at all. `hint` stays optional so that
// variant renders exactly as before, with nothing below the digits.

interface Props {
  accent: { skin: string; accent: string };
  otp: string | number;
  label: string;
  hint?: string;
  /** Shows a share button under the digits (package delivery: send the OTP to the receiver). */
  onShare?: () => void;
  shareLabel?: string;
  styles: {
    pinCard: object;
    pinLabel: object;
    pinBoxes: object;
    pinBox: object;
    pinDigit: object;
    pinHint: object;
    pinShareBtn?: object;
    pinShareText?: object;
  };
}

export function TrackingPinCard({ accent, otp, label, hint, onShare, shareLabel, styles }: Props) {
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
      {onShare && shareLabel ? (
        <TouchableOpacity
          style={[styles.pinShareBtn, { borderColor: accent.accent }]}
          onPress={onShare}
          activeOpacity={0.85}
          accessibilityRole="button"
        >
          <Ionicons name="share-social-outline" size={16} color={accent.accent} />
          <Text style={[styles.pinShareText, { color: accent.accent }]}>{shareLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
