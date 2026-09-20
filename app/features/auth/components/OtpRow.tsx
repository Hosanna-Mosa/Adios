import { TextInput, View } from "react-native";
import Animated from "react-native-reanimated";
import { staggerListItem } from "@/motion/presets";
import { type ServiceTokens } from "@/constants/colors";
import { type OtpStyles } from "@/features/auth/otp.styles";

// Moved out of app/otp.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  accent: ServiceTokens;
  focusedIndex: number;
  handleChange: any;
  handleKeyPress: any;
  inputs: any;
  otp: any[];
  setFocusedIndex: any;
  styles: OtpStyles;
}

export function OtpRow({
  accent,
  focusedIndex,
  handleChange,
  handleKeyPress,
  inputs,
  otp,
  setFocusedIndex,
  styles,
}: Props) {
  return (
    <View style={styles.otpRow}>
      {otp.map((digit, i) => (
        <Animated.View key={i} style={{ flex: 1 }} entering={staggerListItem(i)}>
          <TextInput
            ref={(ref) => {
              inputs.current[i] = ref;
            }}
            style={[
              styles.otpCell,
              (digit.length > 0 || focusedIndex === i) && styles.otpCellActive,
            ]}
            value={digit}
            onChangeText={(text) => handleChange(text, i)}
            onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
            onFocus={() => setFocusedIndex(i)}
            keyboardType="number-pad"
            // No maxLength: the platform enforces it before onChangeText
            // runs, so a pasted/autofilled code would arrive here already
            // cut to one digit. The controlled `value` above is what keeps
            // each box showing a single character.
            textContentType="oneTimeCode"
            // Android only forwards autoComplete; hinting just the first box
            // keeps the SMS autofill from firing into all six at once.
            autoComplete={i === 0 ? "one-time-code" : "off"}
            selectTextOnFocus
            textAlign="center"
            selectionColor={accent.accent}
          />
        </Animated.View>
      ))}
    </View>
  );
}
