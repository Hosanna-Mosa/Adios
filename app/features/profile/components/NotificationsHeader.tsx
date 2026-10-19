import { Text, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { fadeInDown } from "@/motion/presets";
import { router } from "expo-router";
import { moderateScale } from "react-native-size-matters";
import { type ThemeTokens } from "@/constants/colors";
import { type NotificationsStyles } from "@/features/profile/notifications.styles";

// Moved out of app/notifications.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  handleMarkAllRead: () => void;
  styles: NotificationsStyles;
  tokens: ThemeTokens;
  unreadCount: number;
}

export function NotificationsHeader({
  handleMarkAllRead,
  styles,
  tokens,
  unreadCount,
}: Props) {
  const { t } = useTranslation();
  return (
    <Animated.View style={styles.header} entering={fadeInDown(0)}>
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => router.back()}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={t("app.a11y.goBack")}
      >
        <Ionicons name="chevron-back" size={moderateScale(20)} color={tokens.text} />
      </TouchableOpacity>
      <Text style={[styles.headerTitle, { flex: 1 }]} numberOfLines={1}>{t("app.profile.menuItems.notifications")}</Text>
      {unreadCount > 0 && (
        <TouchableOpacity onPress={handleMarkAllRead} hitSlop={12} accessibilityRole="button">
          <Text style={styles.markAllText}>{t("app.profile.markAllRead")}</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}
