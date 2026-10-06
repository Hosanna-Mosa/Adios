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
      <TouchableOpacity style={styles.addressBlock} activeOpacity={0.7} onPress={() => router.push("/delivery/saved-addresses")}>
        <Text style={styles.addressEyebrow}>{t("app.home.deliveryTo")}</Text>
        <View style={styles.addressLabelRow}>
          <Text style={styles.addressLabel} numberOfLines={1}>{areaLabel}</Text>
          <Ionicons name="chevron-down" size={moderateScale(12)} color={tokens.sec} />
        </View>
        <Text style={styles.addressLine} numberOfLines={1}>{areaLine}</Text>
      </TouchableOpacity>
      <View style={styles.topRowActions}>
        <TouchableOpacity style={styles.iconBtnCircle} onPress={() => setIsDistanceSheetOpen(true)}>
          <MaterialCommunityIcons name="radius-outline" size={moderateScale(18)} color={tokens.sec} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtnCircle} onPress={() => router.push("/notifications")}>
          <Ionicons name="notifications-outline" size={moderateScale(18)} color={tokens.sec} />
          <CountBadge count={unreadCount} style={styles.notificationBadge} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
