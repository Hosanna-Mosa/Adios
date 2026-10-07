import React from "react";
import { Pressable, Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { moderateScale } from "react-native-size-matters";
import Animated from "react-native-reanimated";
import { designTokens } from "@/constants/colors";
import { useThemeStore } from "@/contexts/themeStore";
import { useAuthStore } from "@/contexts/authStore";
import { usePressScale } from "@/motion/presets";
import { createStyles } from "./RestaurantListItem.styles";

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
  const { t } = useTranslation();
  const theme = useThemeStore((s) => s.theme);
  const tokens = designTokens[theme];
  const accent = tokens.services[isMeat ? "meat" : "food"];
  const styles = React.useMemo(() => createStyles(tokens, accent.accent), [theme, isMeat, tokens]);

  const user = useAuthStore((s) => s.user);
  const toggleFavorite = useAuthStore((s) => s.toggleFavorite);
  const isFavorite = React.useMemo(() => user?.favorites?.includes(_id) || false, [user?.favorites, _id]);
  const { animatedStyle, onPressIn, onPressOut } = usePressScale(0.98);

  const categoryLabel = Array.isArray(categories) ? categories.slice(0, 2).join(", ") : categories;
  // openState is the evaluated verdict; the bare isOpen boolean is the fallback for any payload that predates it. Either way the card always states a status.
  // A closed outlet just says CLOSED — the "opens Mon 9:00 AM" detail lives on the menu screen.
  const isClosed = openState ? !openState.isOpen : isOpen === false;
  const statusText = isClosed ? t("app.food.closedPill") : openState?.label || "Open now";
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
        // The card's own verdict, so the menu blocks adds from the first frame.
        isOpen: isClosed ? "false" : "true",
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
              size={moderateScale(18)}
              color={isFavorite ? accent.accent : tokens.sec}
            />
          </TouchableOpacity>
        </View>

        {isPureVeg && !isMeat && (
          <View style={styles.vegRow}>
            <View style={styles.vegIcon}>
              <View style={styles.vegDot} />
            </View>
            <Text style={styles.vegLabel}>{t("app.RestaurantListItem.pureVeg")}</Text>
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
