import { Text, View } from "react-native";
import { TouchableOpacity } from "@/components/ui/TrackedTouchable";
import { useTranslation } from "react-i18next";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { type RideSearchingStyles } from "@/features/ride/ride-searching.styles";

// Section of BookAgainOverlay, split out to keep every file under 150 lines.
// The JSX is unchanged and the props keep the parent's types.

interface Props {
  colors: any;
  dropTitle: string;
  fare: number;
  params: any;
  pickupTitle: string;
  setTripDetailsVisible: React.Dispatch<React.SetStateAction<any>>;
  showCancelReasons: any;
  styles: RideSearchingStyles;
}

export function BookAgainOverlayBike({
  colors,
  dropTitle,
  fare,
  params,
  pickupTitle,
  setTripDetailsVisible,
  showCancelReasons,
  styles,
}: Props) {
  const { t } = useTranslation();
  return (
    <>
    <TouchableOpacity
      style={styles.bookAgainBackFloating}
      onPress={() => setTripDetailsVisible(false)}
    >
      <Ionicons name="arrow-back" size={24} color={colors.text} />
    </TouchableOpacity>

    <View style={styles.bookAgainSheet}>
      <Text style={styles.bookAgainTitle}>{t("app.ride.searchingForBelowServices")}</Text>

      <View style={styles.serviceSummaryCard}>
        <View style={styles.serviceLeft}>
          <View style={styles.serviceBikeBadge}>
            <MaterialCommunityIcons name="motorbike" size={30} color={colors.text} />
          </View>
          <Text style={styles.serviceName}>{t("app.rideTierNames.bike")}</Text>
        </View>
        <Text style={styles.serviceFare}>₹{fare}</Text>
      </View>

      <View style={styles.bookDashedLine} />

      <Text style={styles.locationTitle}>{t("app.ride.locationDetails")}</Text>
      <View style={styles.locationRows}>
        <View style={styles.locationRail}>
          <View style={styles.pickupSmallDot} />
          <View style={styles.locationDashes} />
          <View style={styles.dropSmallDot} />
        </View>
        <View style={styles.locationTextColumn}>
          <View style={styles.locationRow}>
            <Text style={styles.locationName} numberOfLines={1}>
              {pickupTitle}
            </Text>
            <Text style={styles.locationAddress} numberOfLines={2}>
              {params.pickupName}
            </Text>
          </View>
          <View style={styles.locationRow}>
            <Text style={styles.locationName} numberOfLines={1}>
              {dropTitle}
            </Text>
            <Text style={styles.locationAddress} numberOfLines={2}>
              {params.dropName}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.totalFareRow}>
        <Text style={styles.totalFareLabel}>{t("app.ride.totalFare")}</Text>
        <Text style={styles.totalFareValue}>₹{fare}</Text>
      </View>

      <View style={styles.paymentRow}>
        <Ionicons name="cash-outline" size={20} color={colors.textSecondary} />
        <Text style={styles.paymentText}>{t("app.ride.payingViaCash")}</Text>
      </View>

      <TouchableOpacity
        style={styles.backYellowButton}
        onPress={() => setTripDetailsVisible(false)}
      >
        <Text style={styles.backYellowText}>{t("app.ride.back")}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cancelRideButton}
        onPress={showCancelReasons}
      >
        <Text style={styles.cancelRideText}>{t("app.ride.cancelRide")}</Text>
      </TouchableOpacity>
    </View>
    </>
  );
}
