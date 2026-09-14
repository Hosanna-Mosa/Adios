import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";

// Moved out of app/tracking.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  accent: any;
  isHelper: any;
  isRide: any;
  pulse1Style: any;
  pulse2Style: any;
  styles: any;
}

export function TrackingFindingWrap({
  accent,
  isHelper,
  isRide,
  pulse1Style,
  pulse2Style,
  styles,
}: Props) {
  const { t } = useTranslation();
  return (
    <View style={styles.findingWrap}>
      <View style={styles.radarWrap}>
        <Animated.View style={[styles.radarRing, { borderColor: accent.accent }, pulse1Style]} />
        <Animated.View style={[styles.radarRing, { borderColor: accent.accent }, pulse2Style]} />
        <View style={[styles.radarCenter, { backgroundColor: accent.accent }]}>
          <Ionicons name="search" size={22} color={accent.on} />
        </View>
      </View>
      <Text style={styles.findingTitle}>{isRide ? `${t("app.ride.findingYourCaptain")}…` : isHelper ? `${t("app.ride.findingYourHelper")}…` : `${t("app.ride.findingYourDeliveryPartner")}…`}</Text>
      <Text style={styles.findingSubtitle}>{t("app.ride.thisUsuallyTakesUnderAMinute")}</Text>
    </View>
  );
}
