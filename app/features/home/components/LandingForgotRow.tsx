import { Text, TouchableOpacity, View } from "react-native";
import { type LandingStyles } from "@/features/home/index.styles";

// Moved out of app/index.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  handleForgotPassword: () => void;
  styles: LandingStyles;
}

export function LandingForgotRow({
  handleForgotPassword,
  styles,
}: Props) {
  return (
    <View style={styles.forgotRow}>
      <TouchableOpacity onPress={handleForgotPassword} activeOpacity={0.7}>
        <Text style={styles.forgotText}>Forgot?</Text>
      </TouchableOpacity>
    </View>
  );
}
