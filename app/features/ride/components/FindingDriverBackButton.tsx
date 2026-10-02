import { TouchableOpacity } from "@/components/ui/TrackedTouchable";
import { Ionicons } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";
import type { ThemeTokens } from "@/constants/colors";
import type { FindingDriverStyles } from "@/features/ride/finding-driver.styles";

// Floating back control over the map. It opens the cancel sheet rather than
// popping the stack — leaving this screen means abandoning the search.

interface Props {
  insets: { top: number };
  onPress: () => void;
  styles: FindingDriverStyles;
  tokens: ThemeTokens;
}

export function FindingDriverBackButton({ insets, onPress, styles, tokens }: Props) {
  return (
    <TouchableOpacity style={[styles.backBtn, { top: insets.top + 10 }]} onPress={onPress}>
      <Ionicons name="chevron-back" size={moderateScale(20)} color={tokens.text} />
    </TouchableOpacity>
  );
}
