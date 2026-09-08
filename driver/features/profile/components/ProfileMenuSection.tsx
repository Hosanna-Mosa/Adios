import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Colors } from "@/constants/colors";
import { styles } from "../profile.styles";

export interface ProfileMenuItem {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  color: string;
  action?: string;
}

/** One titled group of tappable menu rows, hairline-separated. */
export function ProfileMenuSection({
  title,
  items,
  onSelect,
}: {
  title: string;
  items: ProfileMenuItem[];
  onSelect: (item: ProfileMenuItem) => void;
}) {
  return (
    <View style={styles.menuSection}>
      <Text style={styles.menuSectionTitle}>{title}</Text>
      <View style={styles.menuCard}>
        {items.map((item, idx) => (
          <React.Fragment key={item.label}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                Haptics.selectionAsync();
                onSelect(item);
              }}
            >
              <View style={[styles.menuIcon, { backgroundColor: item.color + "18" }]}>
                <Feather name={item.icon} size={18} color={item.color} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Feather name="chevron-right" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
            {idx < items.length - 1 && <View style={styles.menuDivider} />}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}
