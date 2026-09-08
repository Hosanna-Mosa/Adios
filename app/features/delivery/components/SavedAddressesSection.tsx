import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

// Moved out of app/delivery/saved-addresses.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  accent: any;
  currentLocLoading: any;
  handleUseCurrentLocation: any;
  selectingId: any;
  styles: any;
}

export function SavedAddressesSection({
  accent,
  currentLocLoading,
  handleUseCurrentLocation,
  selectingId,
  styles,
}: Props) {
  return (
    <View style={styles.section}>
      <TouchableOpacity style={styles.addBtn} onPress={() => router.push("/delivery/add-address")} disabled={selectingId !== null}>
        <Text style={styles.addBtnText}>+ Add new address</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.currentLocRow} onPress={handleUseCurrentLocation} disabled={selectingId !== null || currentLocLoading}>
        {currentLocLoading ? <ActivityIndicator size="small" color={accent.accent} /> : <Ionicons name="locate" size={15} color={accent.accent} />}
        <Text style={styles.currentLocText}>{currentLocLoading ? "Fetching location…" : "Use current location"}</Text>
      </TouchableOpacity>
    </View>
  );
}
