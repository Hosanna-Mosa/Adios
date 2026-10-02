import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { type ServiceTokens } from "@/constants/colors";
import { type TrackingStyles } from "@/features/ride/tracking.styles";

// Moved out of app/tracking.tsx. What it read from the screen's scope is now a prop of the
// same name. The pulsing radar rings that used to surround the center icon were removed —
// a static "searching" badge, same as every other empty/loading state in the app.

interface Props {
  accent: ServiceTokens;
  isHelper: boolean;
  isRide: boolean;
  styles: TrackingStyles;
}

export function TrackingFindingWrap({
  accent,
  isHelper,
  isRide,
  styles,
}: Props) {
  const { t } = useTranslation();
  return (
    <View style={styles.findingWrap}>
      <View style={styles.radarWrap}>
        <View style={[styles.radarCenter, { backgroundColor: accent.accent }]}>
          <Ionicons name="search" size={22} color={accent.on} />
        </View>
      </View>
      <Text style={styles.findingTitle}>{isRide ? `${t("app.ride.findingYourCaptain")}…` : isHelper ? `${t("app.ride.findingYourHelper")}…` : `${t("app.ride.findingYourDeliveryPartner")}…`}</Text>
      <Text style={styles.findingSubtitle}>{t("app.ride.thisUsuallyTakesUnderAMinute")}</Text>
    </View>
  );
}
