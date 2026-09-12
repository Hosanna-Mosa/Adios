import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { moderateScale } from "react-native-size-matters";
import { type ServiceTokens } from "@/constants/colors";
import { type SavedAddressesStyles } from "@/features/delivery/saved-addresses.styles";

// Moved out of app/delivery/saved-addresses.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  accent: ServiceTokens;
  addresses: any;
  currentLocLoading: any;
  handleUseCurrentLocation: () => void;
  styles: SavedAddressesStyles;
}

export function SavedAddressesEmptyWrap({
  accent,
  addresses,
  currentLocLoading,
  handleUseCurrentLocation,
  styles,
}: Props) {
  return (
    <View style={styles.emptyWrap}>
      <View style={styles.emptyIconCircle}>
        <Ionicons name="location" size={moderateScale(28)} color={accent.accent} />
      </View>
      <Text style={styles.emptyTitle}>No saved places</Text>
      <Text style={styles.emptySubtitle}>
        Save the addresses you use often — home, work, your parents&apos; place — and every flow in Flavour gets one tap shorter.
      </Text>
      <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push("/delivery/add-address")}>
        <Text style={styles.primaryBtnText}>Add your first address</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.secondaryBtn} onPress={handleUseCurrentLocation} disabled={currentLocLoading}>
        {currentLocLoading ? <ActivityIndicator size="small" color={accent.accent} /> : <Text style={styles.secondaryBtnText}>Use current location</Text>}
      </TouchableOpacity>
    </View>
  );
}
