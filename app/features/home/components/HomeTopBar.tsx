import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";
import { router, useFocusEffect } from "expo-router";
import { type ThemeTokens } from "@/constants/colors";
import { type HomeStyles } from "@/features/home/home.styles";
import { customFetch } from "@/utils/api/custom-fetch";
import { CountBadge } from "@/components/ui/CountBadge";

// Moved out of app/(tabs)/index.tsx. The JSX is unchanged; what it used to read from
// the screen's scope is now passed in as props.
//
// The avatar/profile button that used to sit here was a duplicate of the "Account"
// tab already in the bottom bar. Notifications had no entry point from Home at all
// (only reachable via Profile's menu), so this is now a notification bell instead —
// same unread count source Profile's own badge uses.

interface Props {
  styles: HomeStyles;
  insets: { top: number };
  tokens: ThemeTokens;
  areaLabel: string;
  areaLine: string;
  setIsDistanceSheetOpen: (v: boolean) => void;
}

export function HomeTopBar({
  styles,
  insets,
  tokens,
  areaLabel,
  areaLine,
  setIsDistanceSheetOpen,
}: Props) {
  const { t } = useTranslation();
  const [unreadCount, setUnreadCount] = React.useState(0);

  // Refreshed whenever Home regains focus (e.g. after reading notifications),
  // matching how Profile's own badge for this menu item keeps in sync.
  useFocusEffect(
    React.useCallback(() => {
      customFetch<{ unreadCount: number }>("/notifications/unread-count")
        .then((res) => setUnreadCount(res?.unreadCount || 0))
        .catch(() => {});
    }, [])
  );

  return (
    <View style={[styles.topRow, { paddingTop: insets.top + 6 }]}>
      {/* Only the saved name (Home / Work…), same as the scrolled header; the full address is on the saved-addresses screen. */}
      <TouchableOpacity
        style={[styles.addressBlock, styles.addressInlineRow]}
        activeOpacity={0.7}
        onPress={() => router.push("/delivery/saved-addresses")}
        accessibilityRole="button"
        accessibilityLabel={t("app.home.deliveryAddressAccessibilityLabel", { area: areaLine })}
      >
        <Ionicons name="location-sharp" size={moderateScale(16)} color={tokens.services.food.accent} />
        <Text style={styles.addressInlineText} numberOfLines={1}>
          <Text style={styles.addressInlineLabel}>{areaLabel}</Text>
        </Text>
        <Ionicons name="chevron-down" size={moderateScale(14)} color={tokens.sec} />
      </TouchableOpacity>
      <View style={styles.topRowActions}>
        {/* Delivery radius: how far from this address to look for outlets. */}
        <TouchableOpacity
          style={styles.iconBtnCircle}
          onPress={() => setIsDistanceSheetOpen(true)}
          accessibilityRole="button"
          accessibilityLabel={t("app.home.deliveryRadiusAccessibilityLabel")}
        >
          <MaterialCommunityIcons name="map-marker-radius-outline" size={moderateScale(24)} color={tokens.sec} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconBtnCircle}
          onPress={() => router.push("/notifications")}
          accessibilityRole="button"
          accessibilityLabel={unreadCount > 0 ? t("app.home.notificationsUnreadAccessibilityLabel", { count: unreadCount }) : t("app.home.notificationsAccessibilityLabel")}
        >
          <Ionicons name="notifications-outline" size={moderateScale(24)} color={tokens.sec} />
          <CountBadge count={unreadCount} style={styles.notificationBadge} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
