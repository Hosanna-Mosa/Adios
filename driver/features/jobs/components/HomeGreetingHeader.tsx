import React from "react";
import { useTranslation } from "react-i18next";

import { LinearGradient } from "expo-linear-gradient";
import { gradients } from "@/constants/colors";
import { styles } from "../home.styles";
import { AppImage } from "@/components/ui/AppImage";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

function greetingFor(t: (key: string, opts?: any) => string, name?: string | null) {
  const suffix = name ? `, ${name.split(" ")[0]}` : "";
  const hour = new Date().getHours();
  if (hour < 12) return t("jobs.goodMorning", { value: suffix, defaultValue: "Good Morning{{value}}!" });
  if (hour < 17) return t("jobs.goodAfternoon", { value: suffix, defaultValue: "Good Afternoon{{value}}!" });
  return t("jobs.goodEvening", { value: suffix, defaultValue: "Good Evening{{value}}!" });
}

/** Brand gradient header with the time-of-day greeting. */
export function HomeGreetingHeader({
  driverName,
  isOnline,
  paddingTop,
}: {
  driverName?: string | null;
  isOnline: boolean;
  paddingTop: number;
}) {
  const { t } = useTranslation();
  return (
    <LinearGradient colors={gradients.brand} style={[styles.headerGradient, { paddingTop }]}>
      <AppImage
        source={require("../../../assets/images/cityscape_bg.png")}
        style={styles.headerBgImage}
        resizeMode="cover"
      />
      <Box style={styles.headerContent}>
        <Box style={styles.headerTopRow}>
          <Box style={styles.headerCopy}>
            <AppText style={styles.greeting}>{greetingFor(t, driverName)} 👋</AppText>
            <AppText style={styles.subGreeting} numberOfLines={1}>
              {isOnline ? t("jobs.youreOnlineAndReceivingOrders") : t("jobs.readyToStartEarning")}
            </AppText>
          </Box>
        </Box>
      </Box>
    </LinearGradient>
  );
}
