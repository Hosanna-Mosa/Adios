import React from "react";
import { Image, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { gradients } from "@/constants/colors";
import { styles } from "../home.styles";

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
      <Image
        source={require("../../../assets/images/cityscape_bg.png")}
        style={styles.headerBgImage}
        resizeMode="cover"
      />
      <View style={styles.headerContent}>
        <View style={styles.headerTopRow}>
          <View style={styles.headerCopy}>
            <Text style={styles.greeting}>{greetingFor(driverName)} 👋</Text>
            <Text style={styles.subGreeting} numberOfLines={1}>
              {isOnline ? "You're online and receiving orders" : "Ready to start earning"}
            </Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}
