import { Text, View } from "react-native";
import Animated from "react-native-reanimated";
import { type ThemeTokens } from "@/constants/colors";
import { fadeInUp } from "@/motion/presets";
import { type RestaurantDetailsStyles } from "../restaurant-details.styles";
import { type VendorDetails } from "../vendor-details.types";

// Name, badge row (veg / rating / open-closed) and cuisine line at the top of
// the vendor detail screen. Moved verbatim out of app/restaurant-details.tsx.
//
// `vendor` is passed whole rather than picked apart into flags, so the markup
// keeps its original optional-chaining and cannot drift from the screen.

interface Props {
  vendor: VendorDetails | null;
  displayName: string;
  displayRating?: number;
  displayReviews?: string;
  isOpenNow: boolean;
  openLabel: string;
  tokens: ThemeTokens;
  styles: RestaurantDetailsStyles;
}

export function VendorIdentityCard({
  vendor,
  displayName,
  displayRating,
  displayReviews,
  isOpenNow,
  openLabel,
  tokens,
  styles,
}: Props) {
  return (
    <Animated.View entering={fadeInUp(0)} style={styles.section}>
      <Text style={styles.name}>{displayName}</Text>
      <View style={styles.badgeRow}>
        {vendor?.isPureVeg && (
          <View style={styles.vegBadge}>
            <View style={styles.vegIconBox}><View style={styles.vegDot} /></View>
            <Text style={styles.vegBadgeText}>Pure veg</Text>
          </View>
        )}
        {displayRating != null && (
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingBadgeText}>
              {displayRating} ★{displayReviews ? ` · ${displayReviews}` : ""}
            </Text>
          </View>
        )}
        {vendor && (
          <View style={[styles.statusBadge, { backgroundColor: isOpenNow ? tokens.successSkin : tokens.errorSkin }]}>
            <Text style={[styles.statusBadgeText, { color: isOpenNow ? tokens.success : tokens.error }]}>
              {openLabel}
            </Text>
          </View>
        )}
      </View>
      {!!vendor?.categories?.length && (
        <Text style={styles.cuisineLine}>{vendor.categories.join(" · ")}</Text>
      )}
    </Animated.View>
  );
}
