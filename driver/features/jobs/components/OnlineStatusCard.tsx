import React from "react";
import { Pressable, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import type { ImageStyle, StyleProp, ViewStyle } from "react-native";
import { Colors } from "@/constants/colors";
import { styles } from "../home.styles";

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
  return (
    <>
      <Pressable style={styles.statusCard} onPress={onToggle}>
        <View
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
        </View>
        <View style={styles.statusCardCopy}>
          <Text style={styles.statusCardTitle}>
            {isOnline ? `Online for ${activeServices.join(" & ").toLowerCase()}` : "You're Offline"}
          </Text>
          <Text style={styles.statusCardDesc}>
            {isOnline ? "You're visible to customers" : "Tap to go online"}
          </Text>
        </View>
        <View
          style={[styles.powerButton, { backgroundColor: isOnline ? Colors.success : Colors.error, borderWidth: 0 }]}
        >
          <Feather name="power" size={24} color={Colors.white} />
        </View>
      </Pressable>

      <Animated.Image
        source={require("../../../assets/images/generated_blue_scooter.png")}
        style={[styles.heroIllustration, scooterAnimatedStyle as StyleProp<ImageStyle>]}
        resizeMode="contain"
      />
      <Animated.View style={[styles.onlineBadgeHero, scooterAnimatedStyle]}>
        <View style={[styles.onlineBadgeDot, !isOnline && { backgroundColor: Colors.textMuted }]} />
        <Text style={[styles.onlineBadgeText, !isOnline && { color: Colors.textMuted }]}>
          {isOnline ? "ONLINE" : "OFFLINE"}
        </Text>
      </Animated.View>
    </>
  );
}
