import React from "react";

import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Colors } from "@/constants/colors";
import { styles } from "../profile.styles";
import { Touchable } from "@/components/ui/Touchable";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

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
    <Box style={styles.menuSection}>
      <AppText style={styles.menuSectionTitle}>{title}</AppText>
      <Box style={styles.menuCard}>
        {items.map((item, idx) => (
          <React.Fragment key={item.label}>
            <Touchable
              style={styles.menuItem}
              onPress={() => {
                Haptics.selectionAsync();
                onSelect(item);
              }}
            >
              <Box style={[styles.menuIcon, { backgroundColor: item.color + "18" }]}>
                <Feather name={item.icon} size={18} color={item.color} />
              </Box>
              <AppText style={styles.menuLabel}>{item.label}</AppText>
              <Feather name="chevron-right" size={18} color={Colors.textMuted} />
            </Touchable>
            {idx < items.length - 1 && <Box style={styles.menuDivider} />}
          </React.Fragment>
        ))}
      </Box>
    </Box>
  );
}
