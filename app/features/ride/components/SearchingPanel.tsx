import { Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { type RideSearchingStyles } from "@/features/ride/ride-searching.styles";
import { vehicleIconFor } from "../rideTierDisplay";

// Moved out of app/ride-searching.tsx. The JSX is unchanged; every value it used to read from
// the screen's scope is now a prop of the same name, so the markup did not
// have to be touched.

interface Props {
  dotStyle: any;
  fare: number;
  params: { serviceId?: string };
  progressBarStyle: any;
  showTripDetails: any;
  styles: RideSearchingStyles;
  tokens: any;
}

export function SearchingPanel({
  dotStyle,
  fare,
  params,
  progressBarStyle,
  showTripDetails,
  styles,
  tokens,
}: Props) {
  const { t } = useTranslation();
  return (
    <View style={styles.panel} pointerEvents="box-none">
      <View style={styles.floatingCard}>
        <View style={styles.handle} />

        <View style={styles.headerInfo}>
          <View style={styles.statusDotRow}>
            <Animated.View style={[styles.pulseDot, dotStyle, { backgroundColor: tokens.success }]} />
            <Text style={styles.title}>{t("app.ride.findingYourCaptain")}...</Text>
          </View>
          <Text style={styles.subtitle}>{t("app.ride.connectingWithNearbyDriversInYour")}</Text>
        </View>

        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressBarActive, progressBarStyle]} />
        </View>

        <View style={styles.fareCard}>
          <View style={styles.bikeBadge}>
            <MaterialCommunityIcons name={vehicleIconFor(params.serviceId)} size={24} color={tokens.text} />
          </View>
          <View style={styles.fareTextGroup}>
            <Text style={styles.fareLabel}>{t("app.ride.totalFare")}</Text>
            <Text style={styles.fareValue}>₹{fare}</Text>
          </View>
          <TouchableOpacity
            style={styles.tripButton}
            onPress={showTripDetails}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel={t("app.ride.tripDetails")}
          >
            <Text style={styles.tripButtonText}>{t("app.ride.tripDetails")}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.suggestionCard}>
          <View style={styles.suggestionHeader}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={20} color={tokens.text} />
            </View>
            <Text style={styles.suggestionTitle}>
              {t("app.ride.captainsArenapostAcceptingAt")}{fare}{t("app.ride.tryAddingMore")}
            </Text>
          </View>

          <View style={styles.addFareRow}>
            {["+ ₹10", "+ ₹15", "+ ₹20", "+"].map((label) => (
              <View key={label} style={styles.addFarePill}>
                <Text style={styles.addFareText}>{label}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}
