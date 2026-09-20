import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { type ThemeTokens } from "@/constants/colors";
import { type HomeStyles } from "@/features/home/home.styles";

// Moved out of app/(tabs)/index.tsx. The JSX is unchanged; every value it used to read from
// the screen's scope is now a prop of the same name, so the markup did not
// have to be touched.

interface Props {
  handleUseCurrentLocation: () => void;
  styles: HomeStyles;
  tokens: ThemeTokens;
}

export function NoRidersState({
  handleUseCurrentLocation,
  styles,
  tokens,
}: Props) {
  return (
    <View style={styles.noServiceContainer}>
      <View style={[styles.emptyIconCircle, { backgroundColor: tokens.warningSkin }]}>
        <Ionicons name="location-sharp" size={26} color={tokens.warning} />
      </View>
      <Text style={styles.noServiceTitle}>No location selected</Text>
      <Text style={styles.noServiceSubtitle}>We need an address to show prices, ETAs and who&apos;s open near you.</Text>
      <TouchableOpacity style={styles.noServiceButton} onPress={handleUseCurrentLocation}>
        <Text style={styles.noServiceButtonText}>Use my current location</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.noServiceSecondaryButton} onPress={() => router.push("/delivery/saved-addresses")}>
        <Text style={styles.noServiceSecondaryButtonText}>Enter address manually</Text>
      </TouchableOpacity>
    </View>
  );
}
