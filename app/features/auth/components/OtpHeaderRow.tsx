import { TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { moderateScale } from "react-native-size-matters";
import { type ThemeTokens } from "@/constants/colors";
import { type EdgeInsets } from "react-native-safe-area-context";
import { type OtpStyles } from "@/features/auth/otp.styles";

// Moved out of app/otp.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  insets: EdgeInsets;
  name: string | undefined;
  styles: OtpStyles;
  tokens: ThemeTokens;
}

export function OtpHeaderRow({
  insets,
  name,
  styles,
  tokens,
}: Props) {
  return (
    <View style={[styles.headerRow, { paddingTop: insets.top + 4 }]}>
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))}
        activeOpacity={0.7}
      >
        <Ionicons name="chevron-back" size={moderateScale(22)} color={tokens.text} />
      </TouchableOpacity>
    </View>
  );
}
