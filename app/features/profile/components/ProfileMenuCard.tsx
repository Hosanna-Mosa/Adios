import { Switch, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { staggerListItem } from "@/motion/presets";

// Moved out of app/(tabs)/profile.tsx. The JSX is unchanged; what it read from the screen's
// scope is now a prop of the same name.

interface Props {
  MENU_ITEMS: readonly any[];
  accent: any;
  styles: any;
  theme: any;
  toggleTheme: any;
  tokens: any;
}

export function ProfileMenuCard({
  MENU_ITEMS,
  accent,
  styles,
  theme,
  toggleTheme,
  tokens,
}: Props) {
  const { t } = useTranslation();
  return (
    <View style={styles.menuCard}>
      {MENU_ITEMS.map((item, idx) => (
        <Animated.View key={item.key} entering={staggerListItem(idx, 30)}>
          <TouchableOpacity
            style={[styles.menuRow, idx < MENU_ITEMS.length - 1 && { borderBottomWidth: 1, borderBottomColor: tokens.border }]}
            activeOpacity={0.7}
            onPress={item.onPress}
          >
            <View style={[styles.menuIcon, { backgroundColor: item.key === "orders" ? accent.skin : tokens.sunken }]}>
              <Ionicons name={item.icon as any} size={17} color={item.key === "orders" ? accent.accent : tokens.sec} />
            </View>
            <Text style={styles.menuLabel}>{item.label}</Text>
            {"badge" in item && item.badge && <Text style={styles.menuBadgeText}>{item.badge}</Text>}
            {"countBadge" in item && item.countBadge ? (
              <View style={styles.menuCountBadge}>
                <Text style={styles.menuCountBadgeText}>{item.countBadge}</Text>
              </View>
            ) : null}
            <Ionicons name="chevron-forward" size={18} color={tokens.muted} />
          </TouchableOpacity>
        </Animated.View>
      ))}

      {/* Appearance — a switch rather than a navigation row, so it sits
          outside MENU_ITEMS and carries its own top divider. */}
      <Animated.View entering={staggerListItem(MENU_ITEMS.length, 30)}>
        <View style={[styles.menuRow, { borderTopWidth: 1, borderTopColor: tokens.border }]}>
          <View style={[styles.menuIcon, { backgroundColor: tokens.sunken }]}>
            <Ionicons name={theme === "dark" ? "moon" : "sunny"} size={17} color={tokens.sec} />
          </View>
          <Text style={styles.menuLabel}>{t("app.profile.darkMode")}</Text>
          <Switch
            value={theme === "dark"}
            onValueChange={toggleTheme}
            trackColor={{ false: tokens.sunken, true: accent.accent }}
            thumbColor={tokens.surface}
            ios_backgroundColor={tokens.sunken}
          />
        </View>
      </Animated.View>
    </View>
  );
}
