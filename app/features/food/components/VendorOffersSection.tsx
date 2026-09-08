import { Text, View } from "react-native";
import Animated from "react-native-reanimated";
import { fadeInUp } from "@/motion/presets";
import { type RestaurantDetailsStyles } from "../restaurant-details.styles";
import { type VendorOffer } from "../vendor-details.types";

// Applicable coupons for this vendor. Renders nothing when there are none,
// which is the `offers.length > 0` guard the screen used to carry.

interface Props {
  offers: VendorOffer[];
  styles: RestaurantDetailsStyles;
}

export function VendorOffersSection({ offers, styles }: Props) {
  if (offers.length === 0) return null;

  return (
    <Animated.View entering={fadeInUp(30)} style={styles.section}>
      <Text style={styles.sectionLabel}>Offers</Text>
      <View style={styles.card}>
        {offers.map((offer, index) => (
          <View key={offer.code} style={[styles.offerRow, index > 0 && styles.offerRowDivider]}>
            <View style={styles.offerCodeChip}>
              <Text style={styles.offerCodeText}>{offer.code}</Text>
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.offerTitle}>{offer.title}</Text>
              <Text style={styles.offerDescription}>{offer.description}</Text>
            </View>
          </View>
        ))}
      </View>
    </Animated.View>
  );
}
