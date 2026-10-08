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
      {/* "Delivery to · Home · <address>" on one line, truncated at the end. */}
      <TouchableOpacity style={[styles.addressBlock, styles.addressInlineRow]} activeOpacity={0.7} onPress={() => router.push("/delivery/saved-addresses")}>
        <Text style={styles.addressInlineText} numberOfLines={1}>
          <Text style={styles.addressInlineEyebrow}>{t("app.home.deliveryTo").toUpperCase()} </Text>
          <Text style={styles.addressInlineLabel}>{areaLabel}</Text>
          <Text style={styles.addressInlineLine}>{` · ${areaLine}`}</Text>
        </Text>
        <Ionicons name="chevron-down" size={moderateScale(14)} color={tokens.sec} />
      </TouchableOpacity>
      <View style={styles.topRowActions}>
        {/* Delivery radius: how far from this address to look for outlets. */}
        <TouchableOpacity style={styles.iconBtnCircle} onPress={() => setIsDistanceSheetOpen(true)}>
          <MaterialCommunityIcons name="map-marker-radius-outline" size={moderateScale(24)} color={tokens.sec} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtnCircle} onPress={() => router.push("/notifications")}>
          <Ionicons name="notifications-outline" size={moderateScale(24)} color={tokens.sec} />
          <CountBadge count={unreadCount} style={styles.notificationBadge} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
