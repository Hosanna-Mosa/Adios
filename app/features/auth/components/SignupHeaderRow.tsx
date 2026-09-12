import { TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";
import { type ThemeTokens } from "@/constants/colors";
import { type EdgeInsets } from "react-native-safe-area-context";
import { type SignupStyles } from "@/features/auth/signup.styles";

// Moved out of app/signup.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  handleBack: () => void;
  insets: EdgeInsets;
  name: string;
  styles: SignupStyles;
  tokens: ThemeTokens;
}

export function SignupHeaderRow({
  handleBack,
  insets,
  name,
  styles,
  tokens,
}: Props) {
  return (
    <View style={[styles.headerRow, { paddingTop: insets.top + 4 }]}>
      <TouchableOpacity
        style={styles.backBtn}
        onPress={handleBack}
        activeOpacity={0.7}
      >
        <Ionicons name="chevron-back" size={moderateScale(22)} color={tokens.text} />
      </TouchableOpacity>
    </View>
  );
}
