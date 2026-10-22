import { Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { fadeIn } from "@/motion/presets";
import { type ServiceTokens } from "@/constants/colors";
import { type AddAddressStyles } from "@/features/delivery/add-address.styles";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  return (
    <Animated.View style={styles.useCurrentWrap} entering={fadeIn(120)}>
      <TouchableOpacity style={styles.useCurrentBtn} onPress={handleUseCurrentLocation}>
        <Ionicons name="locate" size={15} color={accent.accent} />
        <Text style={styles.useCurrentText}>{t("app.LocationPickerSheet.useCurrentLocation")}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}
