import { Text, TouchableOpacity, View } from "react-native";
import Animated from "react-native-reanimated";
import { fadeInUp } from "@/motion/presets";
import { type RestaurantDetailsStyles } from "../restaurant-details.styles";
import { type VendorDetails } from "../vendor-details.types";

// Street address plus the button that hands the destination to Google Maps.
// The screen owns the deep-link logic and passes it in as `onNavigate`.

interface Props {
  vendor: VendorDetails | null;
  onNavigate: () => void;
  styles: RestaurantDetailsStyles;
}

export function VendorAddressSection({ vendor, onNavigate, styles }: Props) {
  if (!vendor?.address) return null;

  return (
    <Animated.View entering={fadeInUp(60)} style={styles.section}>
      <Text style={styles.sectionLabel}>Address</Text>
      <View style={styles.card}>
        <Text style={styles.addressText}>
          {vendor.address}
          {vendor.detailedAddress?.landmark ? ` · Near ${vendor.detailedAddress.landmark}` : ""}
        </Text>
        <TouchableOpacity style={styles.navigateBtn} activeOpacity={0.85} onPress={onNavigate}>
          <Text style={styles.navigateBtnText}>Navigate in Google Maps</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}
