import { Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { type RideSearchingStyles } from "@/features/ride/ride-searching.styles";
import { vehicleIconFor, vehicleNameKeyFor } from "../rideTierDisplay";

// Section of BookAgainOverlay, split out to keep every file under 150 lines.
// The JSX is unchanged and the props keep the parent's types.

interface Props {
  dropTitle: string;
  fare: number;
  params: any;
  pickupTitle: string;
  setTripDetailsVisible: React.Dispatch<React.SetStateAction<any>>;
  showCancelReasons: any;
  styles: RideSearchingStyles;
  tokens: any;
}

export function BookAgainOverlayBike({
  dropTitle,
  fare,
  params,
  pickupTitle,
  setTripDetailsVisible,
  showCancelReasons,
  styles,
  tokens,
}: Props) {
  const { t } = useTranslation();
  return (
    <View style={styles.bookAgainSheet}>
      <TouchableOpacity
        style={styles.bookAgainBackFloating}
        onPress={() => setTripDetailsVisible(false)}
        accessibilityRole="button"
        accessibilityLabel={t("app.ride.back")}
      >
        <Ionicons name="arrow-back" size={24} color={tokens.text} />
      </TouchableOpacity>

      <Text style={styles.bookAgainTitle}>{t("app.ride.searchingForBelowServices")}</Text>

      <View style={styles.serviceSummaryCard}>
        <View style={styles.serviceLeft}>
          <View style={styles.serviceBikeBadge}>
            <MaterialCommunityIcons name={vehicleIconFor(params.serviceId)} size={30} color={tokens.text} />
          </View>
          <Text style={styles.serviceName}>{params.rideName || t(vehicleNameKeyFor(params.serviceId))}</Text>
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
        <Ionicons name="cash-outline" size={20} color={tokens.sec} />
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
  );
}
