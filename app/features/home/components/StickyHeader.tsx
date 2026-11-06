import { Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";
import Animated from "react-native-reanimated";
import { type ThemeTokens } from "@/constants/colors";
import { type EdgeInsets } from "react-native-safe-area-context";
import { type HomeStyles } from "@/features/home/home.styles";

// Moved out of app/(tabs)/index.tsx. The JSX is unchanged; every value it used to read from
// the screen's scope is now a prop of the same name, so the markup did not
// have to be touched.

interface Props {
  activeService: string;
  areaLabel: string;
  handleServiceSwitch: any;
  insets: EdgeInsets;
  stickyHeaderAnimatedStyle: any;
  styles: HomeStyles;
  tokens: ThemeTokens;
}

export function StickyHeader({
  activeService,
  areaLabel,
  handleServiceSwitch,
  insets,
  stickyHeaderAnimatedStyle,
  styles,
  tokens,
}: Props) {
  const iconSize = moderateScale(17);
  const accent = tokens.services?.food?.accent ?? tokens.text;
  const foodOn = activeService === "Food";
  const meatOn = activeService === "Meat";
  return (
    <Animated.View
      style={[styles.stickyHeader, { paddingTop: insets.top + 8 }, stickyHeaderAnimatedStyle]}
    >
      <View style={styles.stickyRow}>
        {/* Only the saved name (Home / Work…), not the full address line. */}
        <TouchableOpacity
          style={styles.stickyAddressBtn}
          activeOpacity={0.7}
          onPress={() => router.push("/delivery/saved-addresses")}
          accessibilityRole="button"
        >
          <Ionicons name="location-sharp" size={moderateScale(16)} color={accent} />
          <Text style={styles.stickyAddress} numberOfLines={1}>{areaLabel}</Text>
          <Ionicons name="chevron-down" size={moderateScale(14)} color={tokens.sec} />
        </TouchableOpacity>
        <View style={styles.stickyActions}>
          <View style={styles.stickyTogglePill}>
            <TouchableOpacity
              style={[styles.stickyToggleCell, activeService === "Food" && { backgroundColor: tokens.surface }]}
              onPress={() => handleServiceSwitch("Food")}
            >
              <MaterialCommunityIcons name="silverware-fork-knife" size={iconSize} color={foodOn ? accent : tokens.muted} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.stickyToggleCell, activeService === "Meat" && { backgroundColor: tokens.surface }]}
              onPress={() => handleServiceSwitch("Meat")}
            >
              <MaterialCommunityIcons name="food-steak" size={iconSize} color={meatOn ? accent : tokens.muted} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.stickyIconBtn} onPress={() => router.push("/all-services")}>
            <Ionicons name="car-sport-outline" size={iconSize} color={tokens.sec} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.stickyIconBtn} onPress={() => router.push("/helper-task")}>
            <Ionicons name="briefcase-outline" size={iconSize} color={tokens.sec} />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}
