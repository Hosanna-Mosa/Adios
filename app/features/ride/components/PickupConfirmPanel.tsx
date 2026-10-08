import { ActivityIndicator, Text, View } from "react-native";
import { TouchableOpacity } from "@/components/ui/TrackedTouchable";
import { useTranslation } from "react-i18next";
import Animated from "react-native-reanimated";
import { modalSlideUp } from "@/motion/presets";
import { type ThemeTokens } from "@/constants/colors";
import { type PickupConfirmationStyles } from "@/features/ride/pickup-confirmation.styles";

// Moved out of app/pickup-confirmation.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  firstLine: any;
  confirmedPickup: any;
  estimate: any;
  loadingEstimate: any;
  params: any;
  recenter: any;
  styles: PickupConfirmationStyles;
  tokens: ThemeTokens;
  updatePickup: any;
}

export function PickupConfirmPanel({
  firstLine,
  confirmedPickup,
  estimate,
  loadingEstimate,
  params,
  recenter,
  styles,
  tokens,
  updatePickup,
}: Props) {
  const { t } = useTranslation();
  return (
    <Animated.View entering={modalSlideUp} style={styles.panel}>
      <View style={styles.handle} />
      <Text style={styles.title}>{t("app.ride.doubleCheckPickupPoint")}</Text>

      <TouchableOpacity style={styles.addressCard} onPress={recenter} activeOpacity={0.85}>
        <Text style={styles.addressTitle} numberOfLines={1}>
          {firstLine(confirmedPickup.name)}
        </Text>
        <Text style={styles.addressSubtitle} numberOfLines={1}>
          {confirmedPickup.name}
        </Text>
      </TouchableOpacity>

      <View style={styles.metaRow}>
        <Text style={styles.metaText}>{params.rideName || "Ride"}</Text>
        <View style={styles.metaValue}>
          {loadingEstimate ? (
            <ActivityIndicator size="small" color={tokens.sec} />
          ) : (
            <Text style={styles.metaText}>
              {estimate ? `₹${estimate.fareBreakdown.total.toFixed(2)}` : params.ridePrice}
            </Text>
          )}
        </View>
      </View>

      <TouchableOpacity style={styles.updateButton} onPress={updatePickup}>
        <Text style={styles.updateButtonText}>{t("app.ride.updatePickup")}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}
