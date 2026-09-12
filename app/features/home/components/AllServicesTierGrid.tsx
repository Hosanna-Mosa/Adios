import { Text, TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { staggerListItem } from "@/motion/presets";
import { moderateScale } from "react-native-size-matters";
import { type ServiceTokens } from "@/constants/colors";

// Moved out of app/all-services.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  RIDE_TIERS: any[];
  accent: ServiceTokens;
  selectTier: any;
  styles: any;
}

export function AllServicesTierGrid({
  RIDE_TIERS,
  accent,
  selectTier,
  styles,
}: Props) {
  return (
    <View style={styles.tierGrid}>
      {RIDE_TIERS.map((tier, idx) => (
        <Animated.View key={tier.id} entering={staggerListItem(idx)} style={styles.tierCard}>
          <TouchableOpacity activeOpacity={0.85} onPress={() => selectTier(tier)}>
            <View style={styles.tierIconCircle}>
              <MaterialCommunityIcons name={tier.icon} size={moderateScale(24)} color={accent.accent} />
            </View>
            <Text style={styles.tierName}>{tier.name}</Text>
            <Text style={styles.tierDescription}>{tier.description}</Text>
          </TouchableOpacity>
        </Animated.View>
      ))}
    </View>
  );
}
