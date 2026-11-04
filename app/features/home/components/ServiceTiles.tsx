import { Image, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { type ThemeTokens } from "@/constants/colors";
import { type HomeStyles } from "@/features/home/home.styles";

// Moved out of app/(tabs)/index.tsx. The JSX is unchanged; what it used to read from
// the screen's scope is now passed in as props.

// Five equal cards in one row (Food, Meat, Ride, Package, Helper) instead of the old
// grouped pill + launcher-tile layout. All 5 icons are the team's own branded 3D art.
const FOOD_3D = require("@/assets/images/services/food_3d.png");
const MEAT_3D = require("@/assets/images/services/meat_3d.png");
const RIDE_3D = require("@/assets/images/services/ride_3d.png");
const PACKAGE_3D = require("@/assets/images/services/package_3d.png");
const HELPER_3D = require("@/assets/images/services/helper_3d.png");

interface Props {
  styles: HomeStyles;
  tokens: ThemeTokens;
  activeService: string;
  handleServiceSwitch: (service: "Food" | "Meat") => void;
}

export function ServiceTiles({
  styles,
  tokens,
  activeService,
  handleServiceSwitch,
}: Props) {
  return (
    <View style={styles.serviceCardsRow}>
      <TouchableOpacity
        style={[styles.serviceCard, activeService === "Food" && { borderColor: tokens.services.food.accent }]}
        onPress={() => handleServiceSwitch("Food")}
        activeOpacity={0.85}
      >
        <Image source={FOOD_3D} style={styles.serviceCardImage} resizeMode="contain" />
        <Text style={[styles.serviceCardLabel, activeService === "Food" && { color: tokens.services.food.accent }]} numberOfLines={1}>Food</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.serviceCard, activeService === "Meat" && { borderColor: tokens.services.meat.accent }]}
        onPress={() => handleServiceSwitch("Meat")}
        activeOpacity={0.85}
      >
        <Image source={MEAT_3D} style={styles.serviceCardImage} resizeMode="contain" />
        <Text style={[styles.serviceCardLabel, activeService === "Meat" && { color: tokens.services.meat.accent }]} numberOfLines={1}>Meat</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.serviceCard} onPress={() => router.push("/all-services")} activeOpacity={0.85}>
        <Text style={styles.serviceCardArrow}>↗</Text>
        <Image source={RIDE_3D} style={styles.serviceCardImage} resizeMode="contain" />
        <Text style={styles.serviceCardLabel} numberOfLines={1}>Ride</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.serviceCard} onPress={() => router.push("/package-delivery")} activeOpacity={0.85}>
        <Image source={PACKAGE_3D} style={styles.serviceCardImage} resizeMode="contain" />
        <Text style={styles.serviceCardLabel} numberOfLines={1}>Package</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.serviceCard} onPress={() => router.push("/helper-task")} activeOpacity={0.85}>
        <Image source={HELPER_3D} style={styles.serviceCardImage} resizeMode="contain" />
        <Text style={styles.serviceCardLabel} numberOfLines={1}>Helper</Text>
      </TouchableOpacity>
    </View>
  );
}
