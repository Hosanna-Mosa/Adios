import { Text, TouchableOpacity } from "react-native";
import { type OtpStyles } from "@/features/auth/otp.styles";

// Moved out of app/otp.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  handleCallInstead: () => void;
  styles: OtpStyles;
}

export function OtpCallRow({
  handleCallInstead,
  styles,
}: Props) {
  return (
    <TouchableOpacity style={styles.callRow} onPress={handleCallInstead} activeOpacity={0.7}>
      <Text style={styles.callText}>
        Didn&apos;t get it? <Text style={styles.callHighlight}>Get a call instead</Text>
      </Text>
    </TouchableOpacity>
  );
}
