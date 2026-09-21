import React from "react";

import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { staggerListItem } from "@/motion/presets";
import { styles } from "../profile-tab.styles";
import { PressBox } from "@/components/ui/PressBox";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";
import { AnimatedBox } from "@/components/ui/AnimatedBox";

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
    <Box style={styles.menuList}>
      {entries.map((item, idx) => (
        <AnimatedBox key={item.key} entering={staggerListItem(idx)}>
          <PressBox style={styles.menuItem} onPress={() => onSelect(item)}>
            <Box style={styles.menuIconContainer}>
              <Feather name={item.icon} size={18} color={Colors.brand} />
            </Box>
            <Box style={styles.menuCopy}>
              <AppText style={styles.menuLabel}>{item.title}</AppText>
              <AppText style={styles.menuSubtitle} numberOfLines={1}>{item.subtitle}</AppText>
            </Box>
            <Feather name="chevron-right" size={18} color={Colors.textMuted} />
          </PressBox>
        </AnimatedBox>
      ))}
    </Box>
  );
}
