import { Text, TouchableOpacity, View, useWindowDimensions } from "react-native";
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

// Matches the screen's scrollContent padding and the grid's gap.
const SIDE_PADDING = 16;
const GAP = 12;

/**
 * Grid of equally sized service cards: two columns on phones, three or four on
 * tablets. Widths come from the window, so the columns are exactly even; a fixed
 * 47% stretched into huge cards on tablets and left uneven gaps at some widths.
 */
export function AllServicesTierGrid({ services, styles }: Props) {
  const { width } = useWindowDimensions();
  const columns = width >= 900 ? 4 : width >= 600 ? 3 : 2;
  const cardWidth = Math.floor((width - SIDE_PADDING * 2 - GAP * (columns - 1)) / columns);
  return (
    <View style={styles.tierGrid}>
      {services.map((service, idx) => (
        <Animated.View key={service.id} entering={staggerListItem(idx)} style={[styles.tierCard, { width: cardWidth }]}>
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
