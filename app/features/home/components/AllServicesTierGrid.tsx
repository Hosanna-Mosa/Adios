import { Text, TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { staggerListItem } from "@/motion/presets";
import { moderateScale } from "react-native-size-matters";
import { type ServiceTokens } from "@/constants/colors";

/** One card in the All services grid: a ride tier, Hire a helper, or Package delivery. */
export interface ServiceCardItem {
  id: string;
  name: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  description: string;
  accent: ServiceTokens;
  onPress: () => void;
  /** Small tag in the card's corner, e.g. "Beta". */
  badge?: string;
}

interface Props {
  services: ServiceCardItem[];
  styles: any;
}

/** Two-column grid of equally sized service cards. */
export function AllServicesTierGrid({ services, styles }: Props) {
  return (
    <View style={styles.tierGrid}>
      {services.map((service, idx) => (
        <Animated.View key={service.id} entering={staggerListItem(idx)} style={styles.tierCard}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={service.onPress}
            style={styles.tierCardTouchable}
            accessibilityRole="button"
            accessibilityLabel={`${service.name}. ${service.description}`}
          >
            {service.badge ? (
              <View style={styles.tierBadge}>
                <Text style={styles.tierBadgeText}>{service.badge}</Text>
              </View>
            ) : null}
            <View style={[styles.tierIconCircle, { backgroundColor: service.accent.skin }]}>
              <MaterialCommunityIcons name={service.icon} size={moderateScale(24)} color={service.accent.accent} />
            </View>
            <Text style={styles.tierName} numberOfLines={1}>{service.name}</Text>
            <Text style={styles.tierDescription} numberOfLines={2}>{service.description}</Text>
          </TouchableOpacity>
        </Animated.View>
      ))}
    </View>
  );
}
