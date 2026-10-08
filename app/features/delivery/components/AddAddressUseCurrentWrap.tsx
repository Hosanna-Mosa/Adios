import { Text } from "react-native";
import { TouchableOpacity } from "@/components/ui/TrackedTouchable";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { fadeIn } from "@/motion/presets";
import { type ServiceTokens } from "@/constants/colors";
import { type AddAddressStyles } from "@/features/delivery/add-address.styles";

// Moved out of app/delivery/add-address.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  accent: ServiceTokens;
  handleUseCurrentLocation: () => void;
  styles: AddAddressStyles;
}

export function AddAddressUseCurrentWrap({
  accent,
  handleUseCurrentLocation,
  styles,
}: Props) {
  return (
    <Animated.View style={styles.useCurrentWrap} entering={fadeIn(120)}>
      <TouchableOpacity style={styles.useCurrentBtn} onPress={handleUseCurrentLocation}>
        <Ionicons name="locate" size={15} color={accent.accent} />
        <Text style={styles.useCurrentText}>Use current location</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}
