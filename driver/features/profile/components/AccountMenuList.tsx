import React from "react";
import { Pressable, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { Colors } from "@/constants/colors";
import { staggerListItem } from "@/motion/presets";
import { styles } from "../profile-tab.styles";

export interface AccountMenuEntry {
  key: string;
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle: string;
}

/** Account settings rows, each fading in after the last. */
export function AccountMenuList({
  entries,
  onSelect,
}: {
  entries: AccountMenuEntry[];
  onSelect: (entry: AccountMenuEntry) => void;
}) {
  return (
    <View style={styles.menuList}>
      {entries.map((item, idx) => (
        <Animated.View key={item.key} entering={staggerListItem(idx)}>
          <Pressable style={styles.menuItem} onPress={() => onSelect(item)}>
            <View style={styles.menuIconContainer}>
              <Feather name={item.icon} size={18} color={Colors.brand} />
            </View>
            <View style={styles.menuCopy}>
              <Text style={styles.menuLabel}>{item.title}</Text>
              <Text style={styles.menuSubtitle} numberOfLines={1}>{item.subtitle}</Text>
            </View>
            <Feather name="chevron-right" size={18} color={Colors.textMuted} />
          </Pressable>
        </Animated.View>
      ))}
    </View>
  );
}
