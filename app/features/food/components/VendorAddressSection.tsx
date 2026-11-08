import { Text, View } from "react-native";
import { TouchableOpacity } from "@/components/ui/TrackedTouchable";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  if (!vendor?.address) return null;

  return (
    <Animated.View entering={fadeInUp(60)} style={styles.section}>
      <Text style={styles.sectionLabel}>{t("app.food.address")}</Text>
      <View style={styles.card}>
        <Text style={styles.addressText}>
          {vendor.address}
          {vendor.detailedAddress?.landmark ? ` · ${t("app.delivery.near")} ${vendor.detailedAddress.landmark}` : ""}
        </Text>
        <TouchableOpacity style={styles.navigateBtn} activeOpacity={0.85} onPress={onNavigate}>
          <Text style={styles.navigateBtnText}>{t("app.food.navigateInGoogleMaps")}</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}
