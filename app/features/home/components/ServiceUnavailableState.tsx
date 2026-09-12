import { Alert, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { type ThemeTokens } from "@/constants/colors";
import { type HomeStyles } from "@/features/home/home.styles";

// Moved out of app/(tabs)/index.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  serviceName: string;
  styles: HomeStyles;
  tokens: ThemeTokens;
}

export function ServiceUnavailableState({
  serviceName,
  styles,
  tokens,
}: Props) {
  return (
    <View style={styles.noServiceContainer}>
      <View style={styles.emptyIconCircle}>
        <Ionicons name="map-outline" size={26} color={tokens.sec} />
      </View>
      <Text style={styles.noServiceTitle}>Services aren&apos;t available in this location</Text>
      <Text style={styles.noServiceSubtitle}>We don&apos;t have {serviceName} outlets or delivery services here yet. Try another location, or let us know you&apos;re waiting.</Text>
      <TouchableOpacity style={styles.noServiceButton} onPress={() => router.push("/delivery/saved-addresses")}>
        <Text style={styles.noServiceButtonText}>Change location</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.noServiceSecondaryButton}
        onPress={() => Alert.alert("Thanks!", "We'll notify you when we launch in your area.")}
      >
        <Text style={styles.noServiceSecondaryButtonText}>Notify me when you launch</Text>
      </TouchableOpacity>
    </View>
  );
}
