import React from "react";

import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { styles } from "../support.styles";
import { Touchable } from "@/components/ui/Touchable";
import { Box } from "@/components/ui/Box";
import { AppText } from "@/components/ui/AppText";

/** One way to reach support: icon, label, and how fast it responds. */
export function ContactOptionCard({
  icon,
  label,
  description,
  onPress,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  description: string;
  onPress: () => void;
}) {
  return (
    <Touchable style={styles.contactCard} onPress={onPress}>
      <Box style={styles.iconWrapper}>
        <Feather name={icon} size={22} color={Colors.primary} />
      </Box>
      <AppText style={styles.contactLabel}>{label}</AppText>
      <AppText style={styles.contactDesc}>{description}</AppText>
    </Touchable>
  );
}
