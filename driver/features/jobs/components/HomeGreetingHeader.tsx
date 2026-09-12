import React from "react";

import { LinearGradient } from "expo-linear-gradient";
import { gradients } from "@/constants/colors";
import { styles } from "../home.styles";
import { AppImage } from "@/components/ui/AppImage";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

function greetingFor(name?: string | null) {
  const suffix = name ? `, ${name.split(" ")[0]}` : "";
  const hour = new Date().getHours();
  if (hour < 12) return `Good Morning${suffix}!`;
  if (hour < 17) return `Good Afternoon${suffix}!`;
  return `Good Evening${suffix}!`;
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
            <AppText style={styles.greeting}>{greetingFor(driverName)} 👋</AppText>
            <AppText style={styles.subGreeting} numberOfLines={1}>
              {isOnline ? "You're online and receiving orders" : "Ready to start earning"}
            </AppText>
          </Box>
        </Box>
      </Box>
    </LinearGradient>
  );
}
