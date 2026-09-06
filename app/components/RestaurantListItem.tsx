import React from "react";
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { moderateScale } from "react-native-size-matters";
import Animated from "react-native-reanimated";
import { designTokens, radius, elevation, type ThemeTokens } from "@/constants/colors";
import { fontFamilies } from "@/constants/typography";
import { useThemeStore } from "@/contexts/themeStore";
import { useAuthStore } from "@/contexts/authStore";
import { usePressScale } from "@/motion/presets";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Props {
  _id: string;
  name: string;
  rating: number;
  reviews: string;
  time: string;
  distance: string;
  categories: string | string[];
  location: string;
  address?: string;
  image: string;
  offer?: string;
  isPureVeg?: boolean;
  minOrderValue?: number;
  isMeat?: boolean;
  deliveryFee?: number;
  isOpen?: boolean;
  /** Server-evaluated opening state (see backend utils/openingHours.ts). */
  openState?: { isOpen: boolean; label: string };
  distanceKm?: number;
}

export function RestaurantListItem({
  _id,
  name,
  rating,
  reviews,
  time,
  distance,
  categories,
  address,
  image,
  offer,
  isPureVeg,
  minOrderValue,
  isMeat,
  isOpen,
  openState,
  distanceKm,
}: Props) {
  const { theme } = useThemeStore();
  const tokens = designTokens[theme];
  const accent = tokens.services[isMeat ? "meat" : "food"];
  const styles = React.useMemo(() => createStyles(tokens, accent.accent), [theme, isMeat]);

  const user = useAuthStore((s) => s.user);
  const toggleFavorite = useAuthStore((s) => s.toggleFavorite);
  const isFavorite = React.useMemo(() => user?.favorites?.includes(_id) || false, [user?.favorites, _id]);
  const { animatedStyle, onPressIn, onPressOut } = usePressScale(0.98);

  const categoryLabel = Array.isArray(categories) ? categories.slice(0, 2).join(", ") : categories;
  // openState is the evaluated verdict; the bare isOpen boolean is the fallback for
  // any payload that predates it. Either way the card always states a status.
  const isClosed = openState ? !openState.isOpen : isOpen === false;
  const statusText = openState?.label || (isClosed ? "Closed" : "Open now");
  const distanceLabel = typeof distanceKm === "number"
    ? (distanceKm < 1 ? `${Math.round(distanceKm * 1000)} m` : `${distanceKm.toFixed(1)} km`)
    : distance;

  const handlePress = () => {
    router.push({
      pathname: "/restaurant-menu",
      params: {
        id: _id,
        name,
        image,
        rating,
        reviews,
        isMeat: isMeat ? "true" : "false",
        categories: Array.isArray(categories) ? categories.join(", ") : categories || "",
        minOrderValue: minOrderValue != null ? String(minOrderValue) : "",
        time: time || "",
        distance: distanceLabel || "",
        address: address || "",
      },
    });
  };

  return (
    <AnimatedPressable
      style={[styles.card, animatedStyle, isClosed && styles.cardClosed]}
      onPress={handlePress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
    >
      <Image source={{ uri: image }} style={styles.thumb} contentFit="cover" transition={200} />
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.name} numberOfLines={1}>{name}</Text>
          <TouchableOpacity
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            onPress={() => toggleFavorite(_id)}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={moderateScale(15)}
              color={isFavorite ? accent.accent : tokens.sec}
            />
          </TouchableOpacity>
        </View>

        {isPureVeg && !isMeat && (
          <View style={styles.vegRow}>
            <View style={styles.vegIcon}>
              <View style={styles.vegDot} />
            </View>
            <Text style={styles.vegLabel}>Pure veg</Text>
          </View>
        )}

        <Text style={styles.metaLine} numberOfLines={1}>
          {categoryLabel}
          {minOrderValue ? (isMeat ? ` · from ₹${minOrderValue} / kg` : ` · ₹${minOrderValue} for two`) : ""}
        </Text>
        <Text style={styles.metaLine} numberOfLines={1}>
          {rating} ★ ({reviews}) · {time} · {distanceLabel}
        </Text>

        <View style={styles.badgeRow}>
          <View style={[styles.statusBadge, isClosed ? styles.statusBadgeClosed : styles.statusBadgeOpen]}>
            <Text style={[styles.statusText, isClosed ? styles.statusTextClosed : styles.statusTextOpen]} numberOfLines={1}>
              {statusText}
            </Text>
          </View>
          {!isClosed && !!offer && (
            <View style={styles.offerBadge}>
              <Text style={styles.offerText}>{offer}</Text>
            </View>
          )}
        </View>
      </View>
    </AnimatedPressable>
  );
}

const createStyles = (tokens: ThemeTokens, accentColor: string) => StyleSheet.create({
  card: {
    flexDirection: "row",
    gap: 14,
    backgroundColor: tokens.surface,
    borderWidth: 1,
    borderColor: tokens.border,
    borderRadius: radius.lg,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 14,
    ...elevation.sm,
  },
  cardClosed: {
    opacity: 0.7,
  },
  thumb: {
    width: moderateScale(90),
    height: moderateScale(90),
    borderRadius: radius.sm,
    backgroundColor: tokens.sunken,
    flexShrink: 0,
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  name: {
    flex: 1,
    fontFamily: fontFamilies.body.semibold,
    fontSize: moderateScale(17),
    letterSpacing: -0.1,
    color: tokens.text,
  },
  vegRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 5,
  },
  vegIcon: {
    width: moderateScale(14),
    height: moderateScale(14),
    borderWidth: 1.5,
    borderColor: tokens.veg,
    borderRadius: moderateScale(3),
    alignItems: "center",
    justifyContent: "center",
  },
  vegDot: {
    width: moderateScale(6),
    height: moderateScale(6),
    borderRadius: moderateScale(3),
    backgroundColor: tokens.veg,
  },
  vegLabel: {
    fontFamily: fontFamilies.body.bold,
    fontSize: moderateScale(11),
    letterSpacing: 1,
    textTransform: "uppercase",
    color: tokens.veg,
  },
  metaLine: {
    fontFamily: fontFamilies.body.medium,
    fontSize: moderateScale(13),
    color: tokens.sec,
    marginTop: 5,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  offerBadge: {
    backgroundColor: `${accentColor}1A`,
    borderRadius: moderateScale(6),
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  offerText: {
    fontFamily: fontFamilies.body.bold,
    fontSize: moderateScale(11),
    letterSpacing: 0.4,
    textTransform: "uppercase",
    color: accentColor,
  },
  statusBadge: {
    borderRadius: moderateScale(6),
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusBadgeOpen: {
    backgroundColor: tokens.successSkin,
  },
  statusBadgeClosed: {
    backgroundColor: tokens.errorSkin,
  },
  statusText: {
    fontFamily: fontFamilies.body.bold,
    fontSize: moderateScale(11),
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  statusTextOpen: {
    color: tokens.success,
  },
  statusTextClosed: {
    color: tokens.error,
  },
});
