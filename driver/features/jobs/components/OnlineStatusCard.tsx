import React from "react";
import { useTranslation } from "react-i18next";

import { Feather } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import type { ImageStyle, StyleProp, ViewStyle } from "react-native";
import { Colors } from "@/constants/colors";
import { styles } from "../home.styles";
import { PressBox } from "@/components/ui/PressBox";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";
import { AnimatedBox } from "@/components/ui/AnimatedBox";

/** The online/offline banner that overlaps the header, plus the scooter art. */
export function OnlineStatusCard({
  isOnline,
  activeServices,
  onToggle,
  scooterAnimatedStyle,
}: {
  isOnline: boolean;
  activeServices: string[];
  onToggle: () => void;
  scooterAnimatedStyle: StyleProp<ViewStyle>;
}) {
  const { t } = useTranslation();
  const serviceLabels = activeServices
    .map((s) => (s === "ride" ? t("jobs.rideHailing") : t("jobs.foodDelivery")))
    .join(" & ");
  return (
    <>
      <PressBox style={styles.statusCard} onPress={onToggle}>
        <Box
          style={[
            styles.statusIconBg,
            { backgroundColor: isOnline ? Colors.successLight : Colors.surfaceContainer },
          ]}
        >
          <Feather
            name={isOnline ? "wifi" : "wifi-off"}
            size={20}
            color={isOnline ? Colors.success : Colors.textMuted}
          />
        </Box>
        <Box style={styles.statusCardCopy}>
          <AppText style={styles.statusCardTitle}>
            {isOnline
              ? t("jobs.onlineForServices", { value: serviceLabels, defaultValue: "Online for {{value}}" })
              : t("jobs.youreOffline")}
          </AppText>
          <AppText style={styles.statusCardDesc}>
            {isOnline ? t("jobs.youreVisibleToCustomers") : t("jobs.tapToGoOnline")}
          </AppText>
        </Box>
        <Box
          style={[styles.powerButton, { backgroundColor: isOnline ? Colors.success : Colors.error, borderWidth: 0 }]}
        >
          <Feather name="power" size={24} color={Colors.white} />
        </Box>
      </PressBox>

      <Animated.Image
        source={require("../../../assets/images/generated_blue_scooter.png")}
        style={[styles.heroIllustration, scooterAnimatedStyle as StyleProp<ImageStyle>]}
        resizeMode="contain"
      />
      <AnimatedBox style={[styles.onlineBadgeHero, scooterAnimatedStyle]}>
        <Box style={[styles.onlineBadgeDot, !isOnline && { backgroundColor: Colors.textMuted }]} />
        <AppText style={[styles.onlineBadgeText, !isOnline && { color: Colors.textMuted }]}>
          {isOnline ? t("jobs.onlineCaps") : t("jobs.offlineCaps")}
        </AppText>
      </AnimatedBox>
    </>
  );
}
