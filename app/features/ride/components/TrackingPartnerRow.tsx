import { Text, View } from "react-native";
import { TouchableOpacity } from "@/components/ui/TrackedTouchable";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { moderateScale } from "react-native-size-matters";
import { type ThemeTokens, type ServiceTokens } from "@/constants/colors";
import { type TrackingStyles } from "@/features/ride/tracking.styles";
import type { Driver } from "@/types/models";

// Moved out of app/tracking.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  Linking: any;
  accent: ServiceTokens;
  /** `rating` is sent by the server but not (yet) on the shared Driver model. */
  driver: Driver & { rating?: number | null };
  isHelper: boolean;
  styles: TrackingStyles;
  tokens: ThemeTokens;
  unreadCount: number;
}

export function TrackingPartnerRow({
  Linking,
  accent,
  driver,
  isHelper,
  styles,
  tokens,
  unreadCount,
}: Props) {
  const { t } = useTranslation();
  return (
    <View style={styles.partnerRow}>
      <View style={styles.partnerAvatar}>
        <Ionicons name="person" size={22} color={tokens.sec} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={styles.partnerNameRow}>
          <Text style={styles.partnerName} numberOfLines={1}>{driver.name || "Assigned partner"}</Text>
          {/* A driver with no reviews yet reads as "New" — never as a 0-star score. */}
          <View style={styles.partnerRatingPill}>
            <Ionicons name="star" size={moderateScale(11)} color={accent.accent} />
            <Text style={[styles.partnerRatingText, { color: accent.accent }]}>
              {driver.rating != null ? Number(driver.rating).toFixed(1) : t("app.ride.newDriverRating")}
            </Text>
          </View>
        </View>
        <Text style={styles.partnerMeta}>{driver.vehicle && driver.vehicle !== "unknown" ? driver.vehicle.charAt(0).toUpperCase() + driver.vehicle.slice(1) : isHelper ? "Helper" : "Delivery partner"}</Text>
      </View>
      <TouchableOpacity style={[styles.circleBtn, { backgroundColor: accent.accent }]} onPress={() => Linking.openURL(`tel:${driver.phone || ""}`)}>
        <Ionicons name="call" size={17} color={accent.on} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.circleBtnOutline} onPress={() => router.push("/chat")}>
        <Ionicons name="chatbubble-outline" size={17} color={tokens.text} />
        {unreadCount > 0 && (
          <View style={[styles.badge, { backgroundColor: tokens.error }]}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}
